import Phaser from "phaser";

const CW = 1280, CH = 720;

export class BonusScene extends Phaser.Scene {
  constructor() { super({ key: "BonusScene" }); }

  init(data) {
    this.amount  = data?.amount  || 0;
    this.jackpot = data?.jackpot || null;
  }

  create() {
    const overlay = this.add.rectangle(CW/2, CH/2, CW, CH, 0x000000, 0).setDepth(0);
    this.tweens.add({
      targets: overlay, alpha: 0.9, duration: 400,
      onComplete: () => this._show()
    });
  }

  _show() {
    const cx = CW / 2, cy = CH / 2;
    const label = this.jackpot ? `${this.jackpot} JACKPOT!` : "COLLECT!";
    const color = this.jackpot === "GRAND" ? "#ff44ff" : "#ffd700";

    this.add.text(cx, cy - 60, label, {
      fontSize: "80px", fontFamily: "Cinzel, serif",
      color, stroke: "#000000", strokeThickness: 8
    }).setOrigin(0.5).setDepth(2);

    const amtTxt = this.add.text(cx, cy + 30, "0", {
      fontSize: "64px", fontFamily: "Cinzel, serif",
      color: "#ffffff", stroke: "#000", strokeThickness: 5
    }).setOrigin(0.5).setDepth(2);

    // Count up
    const dur = 2000;
    const start = this.time.now;
    const timer = this.time.addEvent({
      delay: 16, loop: true,
      callback: () => {
        const t = Math.min((this.time.now - start) / dur, 1);
        amtTxt.setText(Math.floor(this.amount * (1 - Math.pow(1-t, 3))).toLocaleString());
        if (t >= 1) timer.remove();
      }
    });

    this.time.delayedCall(3500, () => this.scene.stop());
    this.input.once("pointerdown", () => this.scene.stop());
  }
}
