import Phaser from "phaser";
import { SYMBOL_IDS, CANVAS_WIDTH, CANVAS_HEIGHT, SYMBOL_SIZE } from "../constants.js";

// Fallback colors per symbol
const FALLBACK_COLORS = {
  HP1: 0xd4af37, HP2: 0xc0c0c0,
  LP1: 0xff4444, LP2: 0x4488ff,
  LP3: 0x44cc44, LP4: 0xff8844,
  WILD: 0xcc44ff, SCAT: 0xff44cc
};

export class PreloaderScene extends Phaser.Scene {
  constructor() { super({ key: "PreloaderScene" }); }

  preload() {
    const config = this.registry.get("config");
    const symbols = config?.assets?.symbols || {};

    // Progress bar
    const barBg = this.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 400, 16, 0x222222);
    const barFill = this.add.rectangle(CANVAS_WIDTH / 2 - 198, CANVAS_HEIGHT / 2, 0, 12, 0xd4af37);
    barFill.setOrigin(0, 0.5);

    this.add.text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30, "Loading…", {
      fontSize: "18px", fontFamily: "Cinzel, serif", color: "#888888"
    }).setOrigin(0.5);

    this.load.on("progress", (v) => {
      barFill.width = 396 * v;
    });

    // Load symbol images
    SYMBOL_IDS.forEach(id => {
      if (symbols[id]) this.load.image(id, symbols[id]);
    });

    // Background
    if (config?.assets?.background) {
      this.load.image("background", config.assets.background);
    }

    // Sounds
    const sfx = config?.assets?.sfx || {};
    if (sfx.spin)          this.load.audio("spin",          sfx.spin);
    if (sfx.stop)          this.load.audio("stop",          sfx.stop);
    if (sfx.win_small)     this.load.audio("win_small",     sfx.win_small);
    if (sfx.win_big)       this.load.audio("win_big",       sfx.win_big);
    if (sfx.bonus_trigger) this.load.audio("bonus_trigger", sfx.bonus_trigger);
    if (config?.assets?.bgm) this.load.audio("bgm", config.assets.bgm);
  }

  create() {
    const config = this.registry.get("config");
    const symbols = config?.assets?.symbols || {};

    // Generate fallback textures for any missing symbol
    SYMBOL_IDS.forEach(id => {
      if (!symbols[id] || !this.textures.exists(id)) {
        this._makeFallbackTexture(id);
      }
    });

    // Generate coin particle texture
    if (!this.textures.exists("coin")) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffd700).fillCircle(8, 8, 8);
      g.fillStyle(0xffffff, 0.4).fillCircle(5, 5, 3);
      g.generateTexture("coin", 16, 16);
      g.destroy();
    }

    this.scene.start("GameScene");
    this.scene.launch("UIScene");
  }

  _makeFallbackTexture(id) {
    const color = FALLBACK_COLORS[id] || 0x666666;
    const g = this.make.graphics({ add: false });

    // Outer glow
    g.fillStyle(color, 0.3).fillRoundedRect(4, 4, SYMBOL_SIZE - 8, SYMBOL_SIZE - 8, 20);
    // Main body
    g.fillStyle(color, 1).fillRoundedRect(10, 10, SYMBOL_SIZE - 20, SYMBOL_SIZE - 20, 16);
    // Highlight
    g.fillStyle(0xffffff, 0.25).fillRoundedRect(18, 18, (SYMBOL_SIZE - 20) * 0.6, (SYMBOL_SIZE - 20) * 0.3, 8);
    // Label
    g.generateTexture(id, SYMBOL_SIZE, SYMBOL_SIZE);
    g.destroy();

    // Overlay text label on the texture (using a RenderTexture)
    const rt = this.add.renderTexture(0, 0, SYMBOL_SIZE, SYMBOL_SIZE).setVisible(false);
    rt.draw(id, 0, 0);
    const txt = this.add.text(SYMBOL_SIZE / 2, SYMBOL_SIZE / 2, id, {
      fontSize: "20px", fontFamily: "Cinzel, serif",
      color: "#ffffff", fontStyle: "bold",
      stroke: "#000000", strokeThickness: 3
    }).setOrigin(0.5).setVisible(false);
    rt.draw(txt, SYMBOL_SIZE / 2, SYMBOL_SIZE / 2);
    rt.saveTexture(id);
    txt.destroy();
    rt.destroy();
  }
}
