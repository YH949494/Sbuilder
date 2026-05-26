import Phaser from "phaser";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../constants.js";

export class BigWinScene extends Phaser.Scene {
  constructor() { super({ key: "BigWinScene" }); }

  init(data) {
    this.winAmount = data?.amount || 0;
    this.isMega    = data?.mega   || false;
  }

  create() {
    this.overlay = this.add.rectangle(
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0
    ).setDepth(0);

    this.tweens.add({
      targets: this.overlay, alpha: 0.88, duration: 350,
      onComplete: () => this._showContent()
    });
  }

  _showContent() {
    const cx = CANVAS_WIDTH / 2, cy = CANVAS_HEIGHT / 2;
    const label  = this.isMega ? "MEGA WIN!"   : "BIG WIN!";
    const color  = this.isMega ? "#ff44ff"     : "#ffd700";
    const stroke = this.isMega ? "#330033"     : "#8b0000";

    const title = this.add.text(cx, cy - 80, label, {
      fontSize: this.isMega ? "100px" : "88px", fontFamily: "Cinzel, serif",
      color, stroke, strokeThickness: 10
    }).setOrigin(0.5).setAlpha(0).setScale(0.4).setDepth(2);

    this.tweens.add({ targets: title, alpha: 1, scaleX: 1, scaleY: 1, duration: 500, ease: "Back.easeOut" });

    const amtTxt = this.add.text(cx, cy + 30, "0", {
      fontSize: "72px", fontFamily: "Cinzel, serif",
      color: "#ffffff", stroke: "#000000", strokeThickness: 6
    }).setOrigin(0.5).setDepth(2);

    const dur = 2200, start = this.time.now;
    const timer = this.time.addEvent({
      delay: 16, loop: true,
      callback: () => {
        const t = Math.min((this.time.now - start) / dur, 1);
        amtTxt.setText(Math.floor(this.winAmount * (1 - Math.pow(1 - t, 3))).toLocaleString());
        if (t >= 1) timer.remove();
      }
    });

    if (this.textures.exists("coin")) {
      const e = this.add.particles(cx, cy - 60, "coin", {
        speed: { min: 200, max: 600 }, angle: { min: 240, max: 300 },
        scale: { start: 1.5, end: 0.2 }, alpha: { start: 1, end: 0 },
        gravityY: 700, lifespan: 2000, quantity: 0
      }).setDepth(3);
      e.explode(80);
      this.time.delayedCall(400, () => {
        e.setPosition(cx - 220, cy); e.explode(40);
        this.time.delayedCall(200, () => { e.setPosition(cx + 220, cy); e.explode(40); });
      });
    }

    this.time.delayedCall(3500, () => this._dismiss([title, amtTxt]));
    this.input.once("pointerdown", () => this._dismiss([title, amtTxt]));
  }

  _dismiss(targets) {
    this.tweens.add({
      targets: [...targets, this.overlay], alpha: 0, duration: 350,
      onComplete: () => this.scene.stop()
    });
  }

  show(amount, mega = false) { this.scene.restart({ amount, mega }); }
}
