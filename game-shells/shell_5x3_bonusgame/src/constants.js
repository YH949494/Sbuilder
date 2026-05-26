export const REEL_COUNT         = 5;
export const ROW_COUNT          = 3;
export const SYMBOL_SIZE        = 160;
export const REEL_SPACING       = 170;
export const CANVAS_WIDTH       = 1280;
export const CANVAS_HEIGHT      = 720;

export const SCROLL_SPEED       = 900;
export const SPIN_ACCEL_MS      = 200;
export const SPIN_DECEL_MS      = 350;
export const SPIN_DURATION_BASE = 900;
export const REEL_EXTRA_DELAY   = 220;
export const REEL_START_DELAY   = 100;
export const BOUNCE_DISTANCE    = 22;

export const SPRITES_PER_REEL   = ROW_COUNT + 2;
export const RECYCLE_THRESHOLD  = (ROW_COUNT + 1) * SYMBOL_SIZE;
export const RECYCLE_WRAP       = SPRITES_PER_REEL * SYMBOL_SIZE;

export const SYMBOL_IDS = ["HP1", "HP2", "LP1", "LP2", "LP3", "LP4", "WILD", "SCAT"];

export const WIN_TABLE = {
  HP1:  { 5: 500,  4: 100, 3: 30 },
  HP2:  { 5: 250,  4:  60, 3: 15 },
  LP1:  { 5:  80,  4:  20, 3:  5 },
  LP2:  { 5:  60,  4:  15, 3:  4 },
  LP3:  { 5:  40,  4:  10, 3:  3 },
  LP4:  { 5:  30,  4:   8, 3:  2 },
  WILD: { 5: 1000, 4: 200, 3: 50 },
};

// Bonus game
export const SCATTER_SYM        = "SCAT";
export const SCATTER_TRIGGER    = 3;           // minimum scatters to trigger
export const FREE_SPIN_TABLE    = { 3: 10, 4: 15, 5: 20 };
export const RETRIGGER_TABLE    = { 3:  5, 4: 10, 5: 15 };
export const MULT_INCREMENT     = 1;           // multiplier increase per winning free spin
export const BIG_WIN_THRESHOLD  = 500;
export const MEGA_WIN_THRESHOLD = 2000;
