import Phaser from "phaser";
import { SYMBOL_IDS, CANVAS_WIDTH, CANVAS_HEIGHT, SYMBOL_SIZE } from "../constants.js";

const FALLBACK_COLORS = {
  HP1: 0xd4af37, HP2: 0xc0c0c0,
  LP1: 0xff4444, LP2: 0x4488ff,
  LP3: 0x44cc44, LP4: 0xff8844,
  WILD: 0xcc44ff, SCAT: 0xff44cc
};

export class PreloaderScene extends Phaser.Scene {
  constructor() { super({ key: "PreloaderScene" }); }

  preload() {
    const cfg = this.registry.get("config");
    const sym = cfg?.assets?.symbols || {};

    const barBg   = this.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 400, 16, 0x222222);
    const barFill = this.add.rectangle(CANVAS_WIDTH / 2 - 198, CANVAS_HEIGHT / 2, 0, 12, 0xd4af37).setOrigin(0, 0.5);
    this.add.text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30, "Loading…", { fontSize: "18px", fontFamily: "Cinzel, serif", color: "#888" }).setOrigin(0.5);
    this.load.on("progress", v => { barFill.width = 396 * v; });

    SYMBOL_IDS.forEach(id => { if (sym[id]) this.load.image(id, sym[id]); });
    if (cfg?.assets?.background) this.load.image("background", cfg.assets.background);

    const sfx = cfg?.assets?.sfx || {};
    ["spin","stop","win_small","win_big","bonus_trigger"].forEach(k => {
      if (sfx[k]) this.load.audio(k, sfx[k]);
    });
    if (cfg?.assets?.bgm) this.load.audio("bgm", cfg.assets.bgm);
  }

  create() {
    const cfg = this.registry.get("config");
    const sym = cfg?.assets?.symbols || {};

    SYMBOL_IDS.forEach(id => {
      if (!sym[id] || !this.textures.exists(id)) {
        const color = FALLBACK_COLORS[id] || 0x666666;
        const g = this.make.graphics({ add: false });
        g.fillStyle(color, 0.3).fillRoundedRect(4, 4, SYMBOL_SIZE - 8, SYMBOL_SIZE - 8, 20);
        g.fillStyle(color).fillRoundedRect(10, 10, SYMBOL_SIZE - 20, SYMBOL_SIZE - 20, 16);
        g.fillStyle(0xffffff, 0.2).fillRoundedRect(18, 18, (SYMBOL_SIZE - 20) * 0.6, (SYMBOL_SIZE - 20) * 0.3, 8);
        g.generateTexture(id, SYMBOL_SIZE, SYMBOL_SIZE);
        g.destroy();
      }
    });

    if (!this.textures.exists("coin")) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffd700).fillCircle(8, 8, 8);
      g.fillStyle(0xffffff, 0.4).fillCircle(5, 5, 3);
      g.generateTexture("coin", 16, 16);
      g.destroy();
    }

    // Star texture for free spin effects
    if (!this.textures.exists("star")) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffd700).fillStar(8, 8, 5, 8, 4);
      g.generateTexture("star", 16, 16);
      g.destroy();
    }

    this.scene.start("GameScene");
    this.scene.launch("UIScene");
  }
}
