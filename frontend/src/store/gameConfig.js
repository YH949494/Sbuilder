import { create } from "zustand";

function uuid() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const DEFAULT_CONFIG = {
  game_id:    null,
  game_title: "My Slot Game",
  shell:      "shell_5x3_243ways",
  grid:       { cols: 5, rows: 3 },

  assets: {
    background: null,
    reelFrame:  null,
    symbols: {
      HP1: null, HP2: null,
      LP1: null, LP2: null, LP3: null, LP4: null,
      WILD: null, SCAT: null
    },
    bgm: null,
    sfx: { spin: null, stop: null, win_small: null, win_big: null, bonus_trigger: null }
  },

  ui: {
    primaryColor:    "#d4af37",
    accentColor:     "#8b0000",
    bgColor:         "#0a0a1a",
    glowColor:       "#ffd700",
    fontFamily:      "Cinzel",
    reelFrameStyle:  "ornate_gold",
    spinButtonStyle: "classic_round"
  },

  winEffects: {
    smallWin:    { style: "glow",      particles: "coins" },
    bigWin:      { style: "explosion", particles: "coins", screenShake: true },
    megaWin:     { style: "fullscreen", particles: "gems", screenShake: true },
    winLineStyle: "animated_sweep",
    counterSpeed: "fast"
  },

  symbolAnimations: {
    HP1: { idle: "float",  win: "explode" },
    HP2: { idle: "pulse",  win: "glow"    },
    LP1: { idle: "none",   win: "shake"   },
    LP2: { idle: "none",   win: "shake"   },
    LP3: { idle: "none",   win: "shake"   },
    LP4: { idle: "none",   win: "shake"   },
    WILD:{ idle: "pulse",  win: "explode" },
    SCAT:{ idle: "float",  win: "glow"    }
  },

  demo: {
    mode:     "scripted",
    sequence: [
      ["LP1","LP2","HP1","LP3","WILD","LP2","HP1","LP4","SCAT","LP1","HP2","LP3","WILD","LP1","LP4"],
      ["HP1","HP1","HP1","LP2","LP3","HP1","LP1","WILD","LP4","LP2","HP2","LP3","LP1","LP4","LP2"],
      ["SCAT","LP1","SCAT","LP2","SCAT","LP3","HP1","LP4","HP2","LP1","LP3","LP2","WILD","LP4","LP1"]
    ]
  }
};

export const useGameConfig = create((set) => ({
  config:      { ...DEFAULT_CONFIG },
  currentStep: 0,      // 0 = Dashboard
  showDashboard: true,

  // Update any nested config field via dot-path e.g. "ui.primaryColor"
  updateConfig: (path, value) => set((state) => {
    const newConfig = structuredClone(state.config);
    const keys = path.split(".");
    let obj = newConfig;
    for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
    obj[keys[keys.length - 1]] = value;
    return { config: newConfig };
  }),

  setStep: (step) => set({
    currentStep: step,
    showDashboard: step === 0
  }),

  initNewGame: () => set({
    config: { ...DEFAULT_CONFIG, game_id: uuid() },
    currentStep: 1,
    showDashboard: false
  }),

  loadGame: (savedConfig) => set({
    config: { ...DEFAULT_CONFIG, ...savedConfig },
    currentStep: 1,
    showDashboard: false
  }),

  resetConfig: () => set({
    config: { ...DEFAULT_CONFIG },
    currentStep: 0,
    showDashboard: true
  })
}));
