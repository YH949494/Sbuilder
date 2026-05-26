import Phaser from "phaser";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../constants.js";

const PANEL_H = 80;
const PANEL_Y = CANVAS_HEIGHT - 40;

export class UIScene extends Phaser.Scene {
  constructor() { super({ key: "UIScene" }); }

  create() {
    this.balance     = 1000;
    this.bet         = 1;
    this.spinEnabled = true;
    this.inFreeSpin  = false;

    this._buildPanel();
    this._buildBalance();
    this._buildBetControls();
    this._buildSpinButton();
    this._buildWinDisplay();
    this._buildFreeSpinBadge();

    this.game.events.on("win_result", ({ amount }) => {
      this.balance += amount;
      this._refreshBalance();
      this._flashWin(amount);
    });

    this.game.events.on("freespin_start", ({ spins }) => {
      this.inFreeSpin = true;
      this.freeSpinBadge.setAlpha(1);
      this.freeTxt.setText(`${spins} FREE`);
    });

    this.game.events.on("freespin_update", ({ left }) => {
      this.freeTxt.setText(`${left} FREE`);
    });

    this.game.events.on("freespin_end", () => {
      this.inFreeSpin = false;
      this.freeSpinBadge.setAlpha(0);
      this._setSpinEnabled(true);
    });
  }

  _buildPanel() {
    this.add.rectangle(CANVAS_WIDTH / 2, PANEL_Y, CANVAS_WIDTH, PANEL_H, 0x000000, 0.82);
    this.add.graphics()
      .lineStyle(1, 0xd4af37, 0.3)
      .lineBetween(0, CANVAS_HEIGHT - PANEL_H, CANVAS_WIDTH, CANVAS_HEIGHT - PANEL_H);
  }

  _buildBalance() {
    const x = 110;
    this.add.text(x, PANEL_Y - 14, "BALANCE", { fontSize: "10px", fontFamily: "Cinzel, serif", color: "#888" }).setOrigin(0.5);
    this.balTxt = this.add.text(x, PANEL_Y + 8, `$${this.balance}`, { fontSize: "24px", fontFamily: "Cinzel, serif", color: "#ffd700" }).setOrigin(0.5);
  }

  _refreshBalance() {
    this.balTxt.setText(`$${this.balance.toLocaleString()}`);
  }

  _buildBetControls() {
    const x = 310;
    this.add.text(x, PANEL_Y - 14, "BET", { fontSize: "10px", fontFamily: "Cinzel, serif", color: "#888" }).setOrigin(0.5);
    this.betTxt = this.add.text(x, PANEL_Y + 8, `$${this.bet}`, { fontSize: "24px", fontFamily: "Cinzel, serif", color: "#ffffff" }).setOrigin(0.5);

    this.add.text(x - 40, PANEL_Y + 8, "−", { fontSize: "22px", color: "#aaa" }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => { if (this.bet > 1) { this.bet--; this.betTxt.setText(`$${this.bet}`); } });

    this.add.text(x + 40, PANEL_Y + 8, "+", { fontSize: "22px", color: "#aaa" }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => { if (this.bet < 100) { this.bet++; this.betTxt.setText(`$${this.bet}`); } });
  }

  _buildSpinButton() {
    this.spinBtn = this.add.circle(CANVAS_WIDTH / 2, PANEL_Y, 34, 0xd4af37)
      .setInteractive({ useHandCursor: true }).setDepth(5);
    this.add.text(CANVAS_WIDTH / 2, PANEL_Y, "SPIN", {
      fontSize: "14px", fontFamily: "Cinzel, serif", color: "#000", fontStyle: "bold"
    }).setOrigin(0.5).setDepth(6);

    this.spinBtn.on("pointerdown", () => this._requestSpin());
    this.spinBtn.on("pointerover", () => this.spinBtn.setFillStyle(0xf0c040));
    this.spinBtn.on("pointerout",  () => this.spinBtn.setFillStyle(this.spinEnabled ? 0xd4af37 : 0x666666));
    this.input.keyboard.on("keydown-SPACE", () => this._requestSpin());
  }

  _requestSpin() {
    if (!this.spinEnabled) return;
    if (!this.inFreeSpin && this.balance < this.bet) {
      this._flashMsg("Insufficient balance!");
      return;
    }
    if (!this.inFreeSpin) {
      this.balance -= this.bet;
      this._refreshBalance();
    }
    this._setSpinEnabled(false);
    this.game.events.emit("spin_requested");
    // Re-enable after generous timeout
    this.time.delayedCall(5000, () => this._setSpinEnabled(true));
  }

  _setSpinEnabled(v) {
    this.spinEnabled = v;
    this.spinBtn.setFillStyle(v ? 0xd4af37 : 0x666666);
    if (v) this.spinBtn.setInteractive({ useHandCursor: true });
    else   this.spinBtn.disableInteractive();
  }

  _buildWinDisplay() {
    this.winTxt = this.add.text(CANVAS_WIDTH - 120, PANEL_Y, "", {
      fontSize: "26px", fontFamily: "Cinzel, serif", color: "#ffd700",
      stroke: "#000", strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0).setDepth(5);
  }

  _flashWin(amount) {
    this.winTxt.setText(`+$${amount.toLocaleString()}`).setAlpha(1).setScale(1.4);
    this.tweens.add({ targets: this.winTxt, scaleX: 1, scaleY: 1, duration: 300, ease: "Back.easeOut" });
    this.tweens.add({ targets: this.winTxt, alpha: 0, duration: 800, delay: 2200 });
  }

  _buildFreeSpinBadge() {
    // Floating badge at top right during free spins
    const bx = CANVAS_WIDTH - 100;
    const by = 20;
    this.freeSpinBadge = this.add.container(bx, by).setAlpha(0);

    const bg = this.add.rectangle(0, 0, 140, 36, 0xcc44ff, 0.9).setStrokeStyle(2, 0xffffff, 0.8);
    this.freeTxt = this.add.text(0, 0, "", {
      fontSize: "16px", fontFamily: "Cinzel, serif", color: "#ffffff", fontStyle: "bold"
    }).setOrigin(0.5);
    this.freeSpinBadge.add([bg, this.freeTxt]);
  }

  _flashMsg(msg) {
    const t = this.add.text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 80, msg, {
      fontSize: "22px", fontFamily: "Cinzel, serif", color: "#ff4444", stroke: "#000", strokeThickness: 3
    }).setOrigin(0.5).setDepth(10);
    this.tweens.add({ targets: t, alpha: 0, duration: 600, delay: 1500, onComplete: () => t.destroy() });
  }
}
