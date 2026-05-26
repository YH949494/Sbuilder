export const REEL_COUNT         = 5;
export const ROW_COUNT          = 3;
export const SYMBOL_SIZE        = 160;
export const REEL_SPACING       = 170;
export const CANVAS_WIDTH       = 1280;
export const CANVAS_HEIGHT      = 720;

// Spin animation
export const SCROLL_SPEED       = 900;   // px/s at full spin
export const SPIN_ACCEL_MS      = 200;   // ramp-up time per reel
export const SPIN_DECEL_MS      = 350;   // deceleration per reel
export const SPIN_DURATION_BASE = 900;   // hold time before first reel stops
export const REEL_EXTRA_DELAY   = 220;   // extra hold per subsequent reel
export const REEL_START_DELAY   = 100;   // stagger reel spin-start
export const BOUNCE_DISTANCE    = 22;    // px overshoot on land

// Reel scrolling internals
export const SPRITES_PER_REEL   = ROW_COUNT + 2;                             // 5
export const RECYCLE_THRESHOLD  = (ROW_COUNT + 1) * SYMBOL_SIZE;             // 640
export const RECYCLE_WRAP       = SPRITES_PER_REEL * SYMBOL_SIZE;            // 800

export const SYMBOL_IDS = ["HP1", "HP2", "LP1", "LP2", "LP3", "LP4", "WILD", "SCAT"];

// Win amounts (middle-row match)
export const WIN_TABLE = {
  HP1: { 5: 500,  4: 100, 3: 30 },
  HP2: { 5: 250,  4:  60, 3: 15 },
  LP1: { 5:  80,  4:  20, 3:  5 },
  LP2: { 5:  60,  4:  15, 3:  4 },
  LP3: { 5:  40,  4:  10, 3:  3 },
  LP4: { 5:  30,  4:   8, 3:  2 },
  WILD:{ 5: 1000, 4: 200, 3: 50 },
};

export const BIG_WIN_THRESHOLD  = 500;
export const MEGA_WIN_THRESHOLD = 2000;
