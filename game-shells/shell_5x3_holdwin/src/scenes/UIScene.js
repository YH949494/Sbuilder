import Phaser from "phaser";

const CW = 1280, CH = 720, PANEL_H = 80, PANEL_Y = CH - 40;

export class UIScene extends Phaser.Scene {
  constructor() { super({ key: "UIScene" }); }

  create() {
    this.balance = 1000;
    this.bet     = 1;

    this.add.rectangle(CW / 2, PANEL_Y, CW, PANEL_H, 0x000000, 0.82);

    // Balance
    this.add.text(110, PANEL_Y - 14, "BALANCE", { fontSize: "10px", fontFamily: "Cinzel, serif", color: "#888" }).setOrigin(0.5);
    this.balTxt = this.add.text(110, PANEL_Y + 8, `$${this.balance}`, { fontSize: "24px", fontFamily: "Cinzel, serif", color: "#ffd700" }).setOrigin(0.5);

    // Spin button
    const btn = this.add.circle(CW / 2, PANEL_Y, 34, 0xd4af37).setInteractive({ useHandCursor: true }).setDepth(5);
    this.add.text(CW / 2, PANEL_Y, "SPIN", { fontSize: "14px", fontFamily: "Cinzel, serif", color: "#000", fontStyle: "bold" }).setOrigin(0.5).setDepth(6);
    btn.on("pointerdown", () => { this._spin(); });
    btn.on("pointerover", () => btn.setFillStyle(0xf0c040));
    btn.on("pointerout",  () => btn.setFillStyle(0xd4af37));
    this.input.keyboard.on("keydown-SPACE", () => this._spin());

    // Bonus indicator
    this.bonusTxt = this.add.text(CW - 160, PANEL_Y, "", { fontSize: "16px", fontFamily: "Cinzel, serif", color: "#ff88ff" }).setOrigin(0.5);

    this.game.events.on("win_result", ({ amount }) => {
      this.balance += amount;
      this.balTxt.setText(`$${this.balance.toLocaleString()}`);
    });
    this.game.events.on("bonus_started", () => {
      this.bonusTxt.setText("🔒 HOLD & WIN");
    });
  }

  _spin() {
    if (this.balance < this.bet) return;
    this.balance -= this.bet;
    this.balTxt.setText(`$${this.balance.toLocaleString()}`);
    this.bonusTxt.setText("");
    this.game.events.emit("spin_requested");
  }
}
