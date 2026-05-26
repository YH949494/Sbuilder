import Phaser from "phaser";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../constants.js";

export class BigWinScene extends Phaser.Scene {
  constructor() { super({ key: "BigWinScene" }); }

  init(data) {
    this.winAmount = data?.amount || 0;
  }

  create() {
    // Darken overlay
    this.overlay = this.add.rectangle(
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2,
      CANVAS_WIDTH, CANVAS_HEIGHT,
      0x000000, 0
    );

    this.tweens.add({
      targets: this.overlay,
      alpha: 0.85,
      duration: 400,
      onComplete: () => this._showContent()
    });
  }

  _showContent() {
    const cx = CANVAS_WIDTH / 2;
    const cy = CANVAS_HEIGHT / 2;

    this.add.text(cx, cy - 60, "BIG WIN!", {
      fontSize: "96px",
      fontFamily: "Cinzel, serif",
      color: "#ffd700",
      stroke: "#8b0000",
      strokeThickness: 8
    }).setOrigin(0.5).setAlpha(0).setScale(0.5);

    const titleText = this.children.list[this.children.list.length - 1];
    this.tweens.add({
      targets: titleText,
      alpha: 1,
      scaleX: 1, scaleY: 1,
      duration: 500,
      ease: "Back.easeOut"
    });

    // Animate counter
    const amountText = this.add.text(cx, cy + 40, "0", {
      fontSize: "64px",
      fontFamily: "Cinzel, serif",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4
    }).setOrigin(0.5);

    const target = this.winAmount;
    let current = 0;
    const step = target / 60;
    const counter = this.time.addEvent({
      delay: 16,
      repeat: 60,
      callback: () => {
        current = Math.min(current + step, target);
        amountText.setText(Math.floor(current).toLocaleString());
      }
    });

    // Close on tap after 3s
    this.time.delayedCall(3000, () => {
      this.tweens.add({
        targets: [this.overlay, titleText, amountText],
        alpha: 0,
        duration: 400,
        onComplete: () => this.scene.stop()
      });
    });

    this.input.once("pointerdown", () => {
      this.scene.stop();
    });
  }

  show(amount) {
    this.scene.restart({ amount });
  }
}
