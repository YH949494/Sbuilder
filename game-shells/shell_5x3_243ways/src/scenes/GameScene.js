import Phaser from "phaser";
import {
  REEL_COUNT, ROW_COUNT, SYMBOL_SIZE, REEL_SPACING,
  SCROLL_SPEED, SPIN_ACCEL_MS, SPIN_DECEL_MS,
  SPIN_DURATION_BASE, REEL_EXTRA_DELAY, REEL_START_DELAY,
  BOUNCE_DISTANCE, CANVAS_WIDTH, CANVAS_HEIGHT,
  SPRITES_PER_REEL, RECYCLE_THRESHOLD, RECYCLE_WRAP,
  SYMBOL_IDS, WIN_TABLE, BIG_WIN_THRESHOLD, MEGA_WIN_THRESHOLD
} from "../constants.js";

const REEL_W    = SYMBOL_SIZE;
const REEL_H    = ROW_COUNT * SYMBOL_SIZE;   // 480
const REELS_X0  = CANVAS_WIDTH  / 2 - ((REEL_COUNT - 1) * REEL_SPACING) / 2;
const REELS_Y0  = CANVAS_HEIGHT / 2 - REEL_H / 2;                           // 120

export class GameScene extends Phaser.Scene {
  constructor() { super({ key: "GameScene" }); }

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  create() {
    this.config     = this.registry.get("config");
    this.isSpinning = false;
    this.spinIndex  = 0;

    this._createBackground();
    this._createReelBackdrops();
    this._createReels();
    this._createWinLineGraphics();
    this._createParticles();
    this._startBGM();

    this.game.events.on("spin_requested", this._onSpinRequested, this);
  }

  update(_time, delta) {
    if (!this.reels) return;
    const dt = Math.min(delta, 50) / 1000;  // cap delta to avoid jumps

    for (const reel of this.reels) {
      if (reel.scrollSpeed <= 0) continue;

      const move = reel.scrollSpeed * dt;
      for (const sprite of reel.sprites) {
        sprite.y += move;
        if (sprite.y > RECYCLE_THRESHOLD) {
          sprite.y -= RECYCLE_WRAP;
          if (!reel.stopping) {
            sprite.setTexture(SYMBOL_IDS[Math.floor(Math.random() * SYMBOL_IDS.length)]);
          }
        }
      }
    }
  }

  // ─── Background ─────────────────────────────────────────────────────────────

  _createBackground() {
    if (this.textures.exists("background")) {
      this.add.image(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, "background")
        .setDisplaySize(CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      this.add.graphics()
        .fillGradientStyle(0x06060f, 0x06060f, 0x16092b, 0x16092b, 1)
        .fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }

  _createReelBackdrops() {
    const pad = 14;
    const totalW = (REEL_COUNT - 1) * REEL_SPACING + REEL_W + pad * 2;
    const totalH = REEL_H + pad * 2;
    const rx = REELS_X0 - REEL_W / 2 - pad;
    const ry = REELS_Y0 - pad;

    // Outer border glow
    this.add.graphics()
      .lineStyle(3, 0xd4af37, 0.6)
      .strokeRoundedRect(rx - 3, ry - 3, totalW + 6, totalH + 6, 18)
      .fillStyle(0x000000, 0.55)
      .fillRoundedRect(rx, ry, totalW, totalH, 14);

    // Individual reel separators
    const g = this.add.graphics().lineStyle(1, 0xffffff, 0.08);
    for (let r = 1; r < REEL_COUNT; r++) {
      const lx = REELS_X0 + r * REEL_SPACING - REEL_SPACING / 2;
      g.lineBetween(lx, ry, lx, ry + totalH);
    }
  }

  // ─── Reels ──────────────────────────────────────────────────────────────────

  _createReels() {
    this.reels = [];
    this.maskGfxList = [];

    for (let r = 0; r < REEL_COUNT; r++) {
      const worldX = REELS_X0 + r * REEL_SPACING;
      const worldY = REELS_Y0;

      // Container sits at (worldX, worldY); local coords: 0..REEL_H visible
      const container = this.add.container(worldX, worldY);

      // Geometry mask clips to visible reel window
      const maskGfx = this.make.graphics();
      maskGfx.fillStyle(0xffffff, 1)
        .fillRect(worldX - REEL_W / 2, worldY, REEL_W, REEL_H);
      const mask = maskGfx.createGeometryMask();
      container.setMask(mask);
      this.maskGfxList.push(maskGfx);

      // 5 sprites: local y = -80, 80, 240, 400, 560
      const sprites = [];
      for (let i = 0; i < SPRITES_PER_REEL; i++) {
        const key = SYMBOL_IDS[Math.floor(Math.random() * SYMBOL_IDS.length)];
        const y   = (i - 0.5) * SYMBOL_SIZE;   // -80, 80, 240, 400, 560
        const sp  = this.add.image(0, y, key)
          .setDisplaySize(SYMBOL_SIZE - 14, SYMBOL_SIZE - 14);
        container.add(sp);
        sprites.push(sp);
      }

      this.reels.push({
        r, worldX, worldY,
        container, sprites,
        scrollSpeed: 0,
        stopping: false
      });
    }
  }

  // ─── Win Line Overlay ────────────────────────────────────────────────────────

  _createWinLineGraphics() {
    this.winLineGfx = this.add.graphics();
  }

  // ─── Particles ──────────────────────────────────────────────────────────────

  _createParticles() {
    if (!this.textures.exists("coin")) return;

    this.coinEmitter = this.add.particles(0, 0, "coin", {
      speed:    { min: 120, max: 400 },
      angle:    { min: 250, max: 290 },
      scale:    { start: 1.2, end: 0.3 },
      alpha:    { start: 1,   end: 0 },
      gravityY: 600,
      lifespan: 1400,
      quantity: 0,
      emitting: false
    });
    this.coinEmitter.setDepth(20);
  }

  _burstCoins(x, y, count = 40) {
    if (!this.coinEmitter) return;
    this.coinEmitter.setPosition(x, y);
    this.coinEmitter.explode(count);
  }

  // ─── BGM ────────────────────────────────────────────────────────────────────

  _startBGM() {
    if (this.cache.audio.has("bgm") && !this.sound.get("bgm")) {
      this.sound.add("bgm", { loop: true, volume: 0.3 }).play();
    }
  }

  _playSfx(key, volume = 0.6) {
    if (this.cache.audio.has(key)) {
      this.sound.play(key, { volume });
    }
  }

  // ─── Spin Logic ─────────────────────────────────────────────────────────────

  _onSpinRequested() {
    if (this.isSpinning) return;
    this.isSpinning = true;
    this.winLineGfx.clear();

    const seq = this.config?.demo?.sequence || [];
    let reelOutcomes;
    if (seq.length) {
      reelOutcomes = this._parseOutcome(seq[this.spinIndex % seq.length]);
      this.spinIndex++;
    } else {
      reelOutcomes = this._randomOutcome();
    }

    this._playSfx("spin");
    this._spinReels(reelOutcomes);
  }

  _randomOutcome() {
    return Array.from({ length: REEL_COUNT }, () =>
      Array.from({ length: ROW_COUNT }, () =>
        SYMBOL_IDS[Math.floor(Math.random() * SYMBOL_IDS.length)]
      )
    );
  }

  _parseOutcome(flat) {
    return Array.from({ length: REEL_COUNT }, (_, r) =>
      Array.from({ length: ROW_COUNT }, (_, row) => flat[r * ROW_COUNT + row])
    );
  }

  _spinReels(reelOutcomes) {
    const promises = [];

    for (let r = 0; r < REEL_COUNT; r++) {
      const reel = this.reels[r];
      const startDelay  = r * REEL_START_DELAY;
      const spinHold    = SPIN_DURATION_BASE + r * REEL_EXTRA_DELAY;

      const p = new Promise(resolve => {
        this.time.delayedCall(startDelay, () => {
          reel.stopping = false;

          // Accelerate
          this.tweens.add({
            targets: reel, scrollSpeed: SCROLL_SPEED,
            duration: SPIN_ACCEL_MS, ease: "Power2.easeIn"
          });

          // After spinHold, decelerate then snap
          this.time.delayedCall(spinHold, () => {
            reel.stopping = true;
            this.tweens.add({
              targets: reel, scrollSpeed: 0,
              duration: SPIN_DECEL_MS, ease: "Power3.easeOut",
              onComplete: () => {
                this._snapReel(r, reelOutcomes[r], resolve);
              }
            });
          });
        });
      });

      promises.push(p);
    }

    Promise.all(promises).then(() => {
      this._evaluateWins(reelOutcomes);
      this.isSpinning = false;
    });
  }

  _snapReel(r, targetSymbols, resolve) {
    const reel = this.reels[r];
    reel.scrollSpeed = 0;
    reel.stopping    = false;

    // Assign exact positions and target textures
    // Buffer above (i=0), row0 (i=1), row1 (i=2), row2 (i=3), buffer below (i=4)
    const targetKeys = [
      SYMBOL_IDS[Math.floor(Math.random() * SYMBOL_IDS.length)],
      targetSymbols[0], targetSymbols[1], targetSymbols[2],
      SYMBOL_IDS[Math.floor(Math.random() * SYMBOL_IDS.length)]
    ];

    reel.sprites.forEach((sprite, i) => {
      const key = this.textures.exists(targetKeys[i]) ? targetKeys[i] : SYMBOL_IDS[0];
      sprite.setTexture(key).setAlpha(1).setScale(1);
      sprite.y = (i - 0.5) * SYMBOL_SIZE;
    });

    this._playSfx("stop", 0.5);

    // Bounce: push down then spring back
    reel.sprites.forEach(sprite => {
      const baseY = sprite.y;
      this.tweens.add({
        targets: sprite,
        y: baseY + BOUNCE_DISTANCE,
        duration: 70,
        ease: "Power2.easeOut",
        yoyo: true,
        onComplete: () => { sprite.y = baseY; }
      });
    });

    this.time.delayedCall(140, resolve);
  }

  // ─── Win Detection ───────────────────────────────────────────────────────────

  _evaluateWins(reelOutcomes) {
    // Check all 3 rows (rows 0, 1, 2)
    let totalWin = 0;
    const winningRows = [];

    for (let row = 0; row < ROW_COUNT; row++) {
      const line = reelOutcomes.map(reel => reel[row]);
      const { amount, count, symbol } = this._checkLine(line);
      if (amount > 0) {
        totalWin += amount;
        winningRows.push({ row, count, symbol });
      }
    }

    if (totalWin > 0) {
      this._showWins(winningRows, totalWin);
    }
  }

  _checkLine(line) {
    const first = line.find(s => s !== "WILD") || line[0];
    const count = line.filter(s => s === first || s === "WILD").length;
    if (count >= 3) {
      const pays = WIN_TABLE[first] || {};
      return { amount: pays[count] || 0, count, symbol: first };
    }
    return { amount: 0, count: 0, symbol: null };
  }

  _showWins(winningRows, totalWin) {
    // Flash each winning row
    winningRows.forEach(({ row }) => {
      this._drawWinLine(row);
      this._pulseWinningSymbols(row);
    });

    // Coin burst at center of reel grid
    this._burstCoins(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 50);

    this._playSfx(totalWin >= BIG_WIN_THRESHOLD ? "win_big" : "win_small");
    this.game.events.emit("win_result", { amount: totalWin });

    if (totalWin >= BIG_WIN_THRESHOLD) {
      this.time.delayedCall(900, () => {
        this.scene.launch("BigWinScene", {
          amount: totalWin,
          mega: totalWin >= MEGA_WIN_THRESHOLD
        });
      });
    }
  }

  _drawWinLine(rowIndex) {
    // Animated highlight rect around winning row
    const y  = REELS_Y0 + rowIndex * SYMBOL_SIZE;
    const x1 = REELS_X0 - REEL_W / 2 - 4;
    const w  = (REEL_COUNT - 1) * REEL_SPACING + REEL_W + 8;
    const h  = SYMBOL_SIZE;

    const g = this.winLineGfx;
    g.lineStyle(3, 0xffd700, 0.9)
      .strokeRect(x1, y, w, h);

    // Fade-out after 2s
    this.tweens.add({
      targets: g, alpha: 0,
      duration: 600, delay: 1800,
      onComplete: () => { g.clear(); g.setAlpha(1); }
    });
  }

  _pulseWinningSymbols(rowIndex) {
    // rowIndex 0→sprite[1], 1→sprite[2], 2→sprite[3]
    const spriteIdx = rowIndex + 1;
    this.reels.forEach(reel => {
      const sp = reel.sprites[spriteIdx];
      if (!sp) return;
      this.tweens.add({
        targets: sp,
        scaleX: 1.18, scaleY: 1.18,
        yoyo: true, repeat: 3, duration: 130,
        ease: "Sine.easeInOut"
      });
    });
  }

  // ─── Live Config Update ──────────────────────────────────────────────────────

  applyConfig(config) {
    this.config = config;
    this.registry.set("config", config);
    this.scene.restart();
  }

  triggerSpin() {
    this._onSpinRequested();
  }
}
