import Phaser from "phaser";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../constants.js";

const INITIAL_BALANCE = 1000;
const BET_AMOUNT = 1;

export class UIScene extends Phaser.Scene {
  constructor() { super({ key: "UIScene" }); }

  create() {
    this.balance = INITIAL_BALANCE;
    this.bet = BET_AMOUNT;

    this._createHUD();

    // Listen for win events from GameScene
    this.game.events.on("win_result", ({ amount }) => {
      this.balance += amount;
      this._updateBalanceText();
      this._showWinAmount(amount);
    });
  }

  _createHUD() {
    const panelY = CANVAS_HEIGHT - 60;

    // Bottom bar backdrop
    this.add.rectangle(CANVAS_WIDTH / 2, panelY, CANVAS_WIDTH, 80, 0x000000, 0.7);

    // Balance display
    this.add.text(100, panelY, "BALANCE", {
      fontSize: "11px", fontFamily: "Cinzel, serif",
      color: "#888888"
    }).setOrigin(0.5);

    this.balanceText = this.add.text(100, panelY + 18, `$${this.balance.toLocaleString()}`, {
      fontSize: "22px", fontFamily: "Cinzel, serif",
      color: "#ffd700"
    }).setOrigin(0.5);

    // Bet display
    this.add.text(260, panelY, "BET", {
      fontSize: "11px", fontFamily: "Cinzel, serif",
      color: "#888888"
    }).setOrigin(0.5);

    this.betText = this.add.text(260, panelY + 18, `$${this.bet}`, {
      fontSize: "22px", fontFamily: "Cinzel, serif",
      color: "#ffffff"
    }).setOrigin(0.5);

    // Spin button
    const spinBtn = this.add.circle(CANVAS_WIDTH / 2, panelY, 36, 0xd4af37)
      .setInteractive({ useHandCursor: true });

    this.add.text(CANVAS_WIDTH / 2, panelY, "SPIN", {
      fontSize: "13px", fontFamily: "Cinzel, serif",
      color: "#000000", fontStyle: "bold"
    }).setOrigin(0.5);

    spinBtn.on("pointerdown", () => {
      if (this.balance < this.bet) return;
      this.balance -= this.bet;
      this._updateBalanceText();
      this.game.events.emit("spin_requested");
    });

    spinBtn.on("pointerover", () => spinBtn.setFillStyle(0xf0c040));
    spinBtn.on("pointerout",  () => spinBtn.setFillStyle(0xd4af37));

    // Win display
    this.winText = this.add.text(CANVAS_WIDTH - 100, panelY, "", {
      fontSize: "22px", fontFamily: "Cinzel, serif",
      color: "#ffd700"
    }).setOrigin(0.5).setAlpha(0);
  }

  _updateBalanceText() {
    this.balanceText.setText(`$${this.balance.toLocaleString()}`);
  }

  _showWinAmount(amount) {
    this.winText.setText(`+$${amount}`).setAlpha(1);
    this.tweens.add({
      targets: this.winText,
      alpha: 0,
      duration: 2000,
      delay: 1000
    });
  }
}
