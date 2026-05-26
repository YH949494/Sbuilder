import Phaser from "phaser";
import { SYMBOL_IDS } from "../constants.js";

export class PreloaderScene extends Phaser.Scene {
  constructor() { super({ key: "PreloaderScene" }); }

  preload() {
    const config = this.registry.get("config");
    const symbols = config?.assets?.symbols || {};

    // Progress bar
    const bar = this.add.graphics();
    const bg  = this.add.graphics();
    bg.fillStyle(0x222222).fillRect(340, 350, 600, 20);

    this.load.on("progress", (v) => {
      bar.clear();
      bar.fillStyle(0xd4af37).fillRect(340, 350, 600 * v, 20);
    });

    // Load symbol textures — fall back to colored rectangles if URL missing
    SYMBOL_IDS.forEach(id => {
      const url = symbols[id];
      if (url) {
        this.load.image(id, url);
      }
    });

    const bg_url = config?.assets?.background;
    if (bg_url) this.load.image("background", bg_url);
  }

  create() {
    const config = this.registry.get("config");
    const symbols = config?.assets?.symbols || {};

    // Generate fallback colored rectangles for any symbol without a loaded texture
    SYMBOL_IDS.forEach((id, i) => {
      if (!symbols[id] || !this.textures.exists(id)) {
        const colors = [0xd4af37, 0xc0c0c0, 0xff4444, 0x44aaff, 0x44ff44, 0xff8844, 0x8844ff, 0xff44aa];
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(colors[i % colors.length]).fillRoundedRect(0, 0, 140, 140, 16);
        g.fillStyle(0xffffff, 0.15).fillRoundedRect(10, 10, 120, 120, 10);
        g.generateTexture(id, 140, 140);
        g.destroy();
      }
    });

    this.scene.start("GameScene");
    this.scene.launch("UIScene");
  }
}
