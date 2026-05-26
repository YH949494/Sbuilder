import Phaser from "phaser";
import { PreloaderScene } from "./scenes/PreloaderScene.js";
import { GameScene }      from "./scenes/GameScene.js";
import { BigWinScene }    from "./scenes/BigWinScene.js";
import { UIScene }        from "./scenes/UIScene.js";

// Config injected by backend for production, or fetched for dev preview
const CONFIG = window.__SLOT_CONFIG__ ||
  await fetch("config.json").then(r => r.json()).catch(() => ({
    game_title: "SlotForge Preview",
    shell: "shell_5x3_243ways",
    grid: { cols: 5, rows: 3 },
    assets: { background: null, symbols: {}, bgm: null, sfx: {} },
    ui: { primaryColor: "#d4af37", accentColor: "#8b0000", glowColor: "#ffd700" },
    winEffects: {},
    demo: { mode: "scripted", sequence: [
      ["LP1","LP2","HP1","LP3","WILD","LP2","HP1","LP4","SCAT","LP1","HP2","LP3","WILD","LP1","LP4"],
      ["HP1","HP1","HP1","LP2","LP3","HP1","LP1","WILD","LP4","LP2","HP2","LP3","LP1","LP4","LP2"]
    ]}
  }));

const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: "#000000",
  parent: "game-container",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [PreloaderScene, GameScene, BigWinScene, UIScene]
});

// Store config in registry for all scenes to access
game.registry.set("config", CONFIG);

window.addEventListener("message", (event) => {
  if (event.data.type === "CONFIG_UPDATE") {
    game.registry.set("config", event.data.config);
    game.scene.getScene("GameScene")?.applyConfig(event.data.config);
  }
  if (event.data.type === "TRIGGER_SPIN") {
    game.scene.getScene("GameScene")?.triggerSpin();
  }
  if (event.data.type === "TRIGGER_BIGWIN") {
    game.scene.getScene("BigWinScene")?.show(12500);
  }
});

export { game, CONFIG };
