import Phaser from "phaser";

const SYMBOL_IDS = ["HP1", "HP2", "LP1", "LP2", "LP3", "LP4", "WILD", "SCAT"];
const FALLBACK   = { HP1:0xd4af37, HP2:0xc0c0c0, LP1:0xff4444, LP2:0x4488ff,
                     LP3:0x44cc44, LP4:0xff8844, WILD:0xcc44ff, SCAT:0xff44cc };

export class PreloaderScene extends Phaser.Scene {
  constructor() { super({ key: "PreloaderScene" }); }

  preload() {
    const cfg = this.registry.get("config");
    const sym = cfg?.assets?.symbols || {};
    SYMBOL_IDS.forEach(id => { if (sym[id]) this.load.image(id, sym[id]); });
    if (cfg?.assets?.background) this.load.image("background", cfg.assets.background);
  }

  create() {
    const cfg = this.registry.get("config");
    const sym = cfg?.assets?.symbols || {};

    SYMBOL_IDS.forEach(id => {
      if (!sym[id] || !this.textures.exists(id)) {
        const g = this.make.graphics({ add: false });
        g.fillStyle(FALLBACK[id] || 0x666666).fillRoundedRect(10, 10, 140, 140, 16);
        g.generateTexture(id, 160, 160);
        g.destroy();
      }
    });

    if (!this.textures.exists("coin")) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffd700).fillCircle(8, 8, 8);
      g.generateTexture("coin", 16, 16);
      g.destroy();
    }

    this.scene.start("HoldWinScene");
    this.scene.launch("UIScene");
  }
}
