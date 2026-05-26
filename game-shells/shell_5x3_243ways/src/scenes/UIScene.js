import Phaser from "phaser";
import { CANVAS_WIDTH, CANVAS_HEIGHT, BIG_WIN_THRESHOLD } from "../constants.js";

const INITIAL_BALANCE = 1000;
const DEFAULT_BET     = 1;
const PANEL_H         = 80;
const PANEL_Y         = CANVAS_HEIGHT - PANEL_H / 2;

export class UIScene extends Phaser.Scene {
  constructor() { super({ key: "UIScene" }); }

  create() {
    this.balance      = INITIAL_BALANCE;
    this.bet          = DEFAULT_BET;
    this.spinEnabled  = true;

    this._buildPanel();
    this._buildSpinButton();
    this._buildBalanceDisplay();
    this._buildBetControls();
    this._buildWinDisplay();

    this.game.events.on("win_result", ({ amount }) => {
      this.balance += amount;
      this._refreshBalance();
      this._flashWin(amount);
    });
  }

  // ─── Panel ──────────────────────────────────────────────────────────────────

  _buildPanel() {
    this.add.rectangle(CANVAS_WIDTH / 2, PANEL_Y, CANVAS_WIDTH, PANEL_H, 0x000000, 0.82);
    this.add.graphics()
      .lineStyle(1, 0xd4af37, 0.4)
      .lineBetween(0, CANVAS_HEIGHT - PANEL_H, CANVAS_WIDTH, CANVAS_HEIGHT - PANEL_H);
  }

  // ─── Spin Button ────────────────────────────────────────────────────────────

  _buildSpinButton() {
    const cx = CANVAS_WIDTH / 2;

    this.spinCircle = this.add.circle(cx, PANEL_Y, 34, 0xd4af37)
      .setInteractive({ useHandCursor: true })
      .setDepth(5);

    this.add.text(cx, PANEL_Y, "SPIN", {
      fontSize: "14px", fontFamily: "Cinzel, serif",
      color: "#000000", fontStyle: "bold"
    }).setOrigin(0.5).setDepth(6);

    this.spinCircle.on("pointerdown", () => this._requestSpin());
    this.spinCircle.on("pointerover", () => this.spinCircle.setFillStyle(0xf0c040));
    this.spinCircle.on("pointerout",  () => this.spinCircle.setFillStyle(0xd4af37));

    // Keyboard shortcut: Space
    this.input.keyboard.on("keydown-SPACE", () => this._requestSpin());
  }

  _requestSpin() {
    if (!this.spinEnabled) return;
    if (this.balance < this.bet) {
      this._flashMessage("Insufficient balance!");
      return;
    }
    this.balance -= this.bet;
    this._refreshBalance();
    this._setSpinEnabled(false);
    this.game.events.emit("spin_requested");

    // Re-enable spin after reels stop (give generous 6s timeout)
    this.time.delayedCall(6000, () => this._setSpinEnabled(true));
    this.game.events.once("win_result", () => {
      this.time.delayedCall(2000, () => this._setSpinEnabled(true));
    });

    // Fallback if no win event
    this.time.delayedCall(4500, () => this._setSpinEnabled(true));
  }

  _setSpinEnabled(v) {
    this.spinEnabled = v;
    this.spinCircle.setFillStyle(v ? 0xd4af37 : 0x666666);
    this.spinCircle.setInteractive(v);
  }

  // ─── Balance ────────────────────────────────────────────────────────────────

  _buildBalanceDisplay() {
    const x = 110;
    this.add.text(x, PANEL_Y - 14, "BALANCE", {
      fontSize: "10px", fontFamily: "Cinzel, serif", color: "#888888"
    }).setOrigin(0.5);

    this.balanceTxt = this.add.text(x, PANEL_Y + 8, `$${this.balance}`, {
      fontSize: "24px", fontFamily: "Cinzel, serif", color: "#ffd700"
    }).setOrigin(0.5);
  }

  _refreshBalance() {
    this.balanceTxt.setText(`$${this.balance.toLocaleString()}`);
  }

  // ─── Bet Controls ───────────────────────────────────────────────────────────

  _buildBetControls() {
    const x = 310;
    this.add.text(x, PANEL_Y - 14, "BET", {
      fontSize: "10px", fontFamily: "Cinzel, serif", color: "#888888"
    }).setOrigin(0.5);

    this.betTxt = this.add.text(x, PANEL_Y + 8, `$${this.bet}`, {
      fontSize: "24px", fontFamily: "Cinzel, serif", color: "#ffffff"
    }).setOrigin(0.5);

    // Minus
    this.add.text(x - 40, PANEL_Y + 8, "−", {
      fontSize: "22px", color: "#aaaaaa"
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        if (this.bet > 1) { this.bet--; this.betTxt.setText(`$${this.bet}`); }
      });

    // Plus
    this.add.text(x + 40, PANEL_Y + 8, "+", {
      fontSize: "22px", color: "#aaaaaa"
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        if (this.bet < 100) { this.bet++; this.betTxt.setText(`$${this.bet}`); }
      });
  }

  // ─── Win Flash ───────────────────────────────────────────────────────────────

  _buildWinDisplay() {
    this.winTxt = this.add.text(CANVAS_WIDTH - 120, PANEL_Y, "", {
      fontSize: "26px", fontFamily: "Cinzel, serif", color: "#ffd700",
      stroke: "#000000", strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0).setDepth(5);
  }

  _flashWin(amount) {
    this.winTxt.setText(`+$${amount.toLocaleString()}`).setAlpha(1).setScale(1.4);
    this.tweens.add({
      targets: this.winTxt, scaleX: 1, scaleY: 1,
      duration: 300, ease: "Back.easeOut"
    });
    this.tweens.add({
      targets: this.winTxt, alpha: 0,
      duration: 800, delay: 2000
    });
  }

  _flashMessage(msg) {
    const t = this.add.text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 80, msg, {
      fontSize: "22px", fontFamily: "Cinzel, serif",
      color: "#ff4444", stroke: "#000000", strokeThickness: 3
    }).setOrigin(0.5).setDepth(10);

    this.tweens.add({
      targets: t, alpha: 0, duration: 600, delay: 1500,
      onComplete: () => t.destroy()
    });
  }
}
