import Phaser from "phaser";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../constants.js";

const CX = CANVAS_WIDTH  / 2;
const PANEL_Y = 55;

export class FreeSpinScene extends Phaser.Scene {
  constructor() { super({ key: "FreeSpinScene" }); }

  create() {
    this.spinsLeft  = 0;
    this.multiplier = 1;
    this.total      = 0;

    this._createGoldenOverlay();
    this._createHUD();
    this._bindEvents();
  }

  // ─── Visuals ─────────────────────────────────────────────────────────────────

  _createGoldenOverlay() {
    // Animated golden border around the entire screen during free spins
    this.borderGfx = this.add.graphics();
    this._drawBorder(0.8);

    // Slow pulse tween on the border alpha
    this.tweens.add({
      targets: this.borderGfx,
      alpha: 0.3,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    // Translucent top banner background
    this.add.rectangle(CX, PANEL_Y, CANVAS_WIDTH, 100, 0x000000, 0.7);
    this.add.graphics()
      .lineStyle(1, 0xffd700, 0.4)
      .lineBetween(0, PANEL_Y + 50, CANVAS_WIDTH, PANEL_Y + 50);
  }

  _drawBorder(alpha) {
    this.borderGfx.clear();
    this.borderGfx.lineStyle(6, 0xffd700, alpha);
    this.borderGfx.strokeRoundedRect(6, 6, CANVAS_WIDTH - 12, CANVAS_HEIGHT - 12, 12);
  }

  _createHUD() {
    // "FREE SPINS" label
    this.add.text(CX, PANEL_Y - 22, "FREE SPINS", {
      fontSize: "16px", fontFamily: "Cinzel, serif",
      color: "#ffd700", letterSpacing: 6
    }).setOrigin(0.5);

    // Spins remaining
    const leftX = CX - 280;
    this.add.text(leftX, PANEL_Y + 10, "SPINS LEFT", {
      fontSize: "10px", fontFamily: "Cinzel, serif", color: "#888888"
    }).setOrigin(0.5);
    this.spinsTxt = this.add.text(leftX, PANEL_Y + 30, "0", {
      fontSize: "30px", fontFamily: "Cinzel, serif", color: "#ffffff"
    }).setOrigin(0.5);

    // Multiplier (center)
    this.add.text(CX, PANEL_Y + 10, "MULTIPLIER", {
      fontSize: "10px", fontFamily: "Cinzel, serif", color: "#888888"
    }).setOrigin(0.5);
    this.multTxt = this.add.text(CX, PANEL_Y + 30, "1×", {
      fontSize: "34px", fontFamily: "Cinzel, serif",
      color: "#ffd700", stroke: "#8b0000", strokeThickness: 3
    }).setOrigin(0.5);

    // Total win (right)
    const rightX = CX + 280;
    this.add.text(rightX, PANEL_Y + 10, "FREE WIN", {
      fontSize: "10px", fontFamily: "Cinzel, serif", color: "#888888"
    }).setOrigin(0.5);
    this.totalTxt = this.add.text(rightX, PANEL_Y + 30, "$0", {
      fontSize: "26px", fontFamily: "Cinzel, serif", color: "#44ff88"
    }).setOrigin(0.5);

    // Re-trigger flash message (hidden)
    this.retriggerTxt = this.add.text(CX, CANVAS_HEIGHT / 2 - 100, "", {
      fontSize: "42px", fontFamily: "Cinzel, serif",
      color: "#ff88ff", stroke: "#000000", strokeThickness: 5
    }).setOrigin(0.5).setAlpha(0);
  }

  // ─── Events ──────────────────────────────────────────────────────────────────

  _bindEvents() {
    this.game.events.on("freespin_start", ({ spins }) => {
      this.spinsLeft  = spins;
      this.multiplier = 1;
      this.total      = 0;
      this._refresh();
    }, this);

    this.game.events.on("freespin_update", ({ left, multiplier }) => {
      this.spinsLeft  = left;
      this.multiplier = multiplier;
      this._refresh();
    }, this);

    this.game.events.on("freespin_win", ({ amount, total }) => {
      this.total = total;
      this._refresh();
      this._flashWinAmount(amount);
    }, this);

    this.game.events.on("freespin_retrigger", ({ added, total }) => {
      this.spinsLeft = total;
      this._refresh();
      this._flashRetrigger(added);
    }, this);
  }

  _refresh() {
    this.spinsTxt.setText(`${this.spinsLeft}`);
    this.multTxt.setText(`${this.multiplier}×`);
    this.totalTxt.setText(`$${this.total.toLocaleString()}`);

    // Pop multiplier on change
    this.tweens.add({ targets: this.multTxt, scaleX: 1.3, scaleY: 1.3, yoyo: true, duration: 200 });
  }

  _flashWinAmount(amount) {
    const txt = this.add.text(CX, CANVAS_HEIGHT / 2 + 80, `+$${amount.toLocaleString()}`, {
      fontSize: "36px", fontFamily: "Cinzel, serif",
      color: "#ffd700", stroke: "#000000", strokeThickness: 4
    }).setOrigin(0.5).setAlpha(1);

    this.tweens.add({
      targets: txt, y: txt.y - 60, alpha: 0,
      duration: 1400, ease: "Power2.easeOut",
      onComplete: () => txt.destroy()
    });
  }

  _flashRetrigger(added) {
    this.retriggerTxt.setText(`+${added} FREE SPINS!`).setAlpha(1).setScale(0.5);
    this.tweens.add({
      targets: this.retriggerTxt, alpha: 1, scaleX: 1, scaleY: 1,
      duration: 400, ease: "Back.easeOut",
      onComplete: () => {
        this.time.delayedCall(1500, () => {
          this.tweens.add({ targets: this.retriggerTxt, alpha: 0, duration: 400 });
        });
      }
    });
  }
}
