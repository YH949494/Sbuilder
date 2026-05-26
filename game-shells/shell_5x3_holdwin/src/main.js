import Phaser from "phaser";
import { PreloaderScene } from "./scenes/PreloaderScene.js";
import { HoldWinScene }   from "./scenes/HoldWinScene.js";
import { BonusScene }     from "./scenes/BonusScene.js";
import { UIScene }        from "./scenes/UIScene.js";

const CONFIG = window.__SLOT_CONFIG__ ||
  await fetch("config.json").then(r => r.json()).catch(() => ({
    game_title: "Hold & Win Preview",
    shell: "shell_5x3_holdwin",
    grid: { cols: 5, rows: 3 },
    holdwin: { respins: 3, collect_symbol: "SCAT" },
    assets: { background: null, symbols: {}, bgm: null, sfx: {} },
    ui: { primaryColor: "#d4af37" },
    demo: { mode: "random", sequence: [] }
  }));

const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: "#000000",
  parent: "game-container",
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [PreloaderScene, HoldWinScene, BonusScene, UIScene]
});

game.registry.set("config", CONFIG);

window.addEventListener("message", (event) => {
  if (event.data.type === "CONFIG_UPDATE") {
    game.registry.set("config", event.data.config);
    game.scene.getScene("HoldWinScene")?.applyConfig(event.data.config);
  }
  if (event.data.type === "TRIGGER_SPIN") {
    game.scene.getScene("HoldWinScene")?.triggerSpin();
  }
});

export { game, CONFIG };
