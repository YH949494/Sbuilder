import Phaser from "phaser";
import {
  REEL_COUNT, ROW_COUNT, SYMBOL_SIZE, REEL_SPACING,
  SCROLL_SPEED, SPIN_ACCEL_MS, SPIN_DECEL_MS,
  SPIN_DURATION_BASE, REEL_EXTRA_DELAY, REEL_START_DELAY,
  BOUNCE_DISTANCE, CANVAS_WIDTH, CANVAS_HEIGHT,
  SPRITES_PER_REEL, RECYCLE_THRESHOLD, RECYCLE_WRAP,
  SYMBOL_IDS, WIN_TABLE,
  SCATTER_SYM, SCATTER_TRIGGER, FREE_SPIN_TABLE, RETRIGGER_TABLE,
  MULT_INCREMENT, BIG_WIN_THRESHOLD, MEGA_WIN_THRESHOLD
} from "../constants.js";

const REEL_W  = SYMBOL_SIZE;
const REEL_H  = ROW_COUNT * SYMBOL_SIZE;
const REELS_X0 = CANVAS_WIDTH  / 2 - ((REEL_COUNT - 1) * REEL_SPACING) / 2;
const REELS_Y0 = CANVAS_HEIGHT / 2 - REEL_H / 2;

export class GameScene extends Phaser.Scene {
  constructor() { super({ key: "GameScene" }); }

  // ─── Lifecycle ──────────────────────────────────────────────────────────────

  create() {
    this.config      = this.registry.get("config");
    this.isSpinning  = false;
    this.spinIndex   = 0;

    // Bonus state
    this.gameMode       = "normal";   // "normal" | "freespin"
    this.freeSpinsLeft  = 0;
    this.multiplier     = 1;
    this.freespinTotal  = 0;

    this._createBackground();
    this._createReelBackdrops();
    this._createReels();
    this._createWinLineGraphics();
    this._createParticles();
    this._createScatterHighlights();
    this._startBGM();

    this.game.events.on("spin_requested", this._onSpinRequested, this);
  }

  update(_time, delta) {
    if (!this.reels) return;
    const dt = Math.min(delta, 50) / 1000;
    for (const reel of this.reels) {
      if (reel.scrollSpeed <= 0) continue;
      const move = reel.scrollSpeed * dt;
      for (const sprite of reel.sprites) {
        sprite.y += move;
        if (sprite.y > RECYCLE_THRESHOLD) {
          sprite.y -= RECYCLE_WRAP;
          if (!reel.stopping)
            sprite.setTexture(SYMBOL_IDS[Math.floor(Math.random() * SYMBOL_IDS.length)]);
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
        .fillGradientStyle(0x050510, 0x050510, 0x1a0530, 0x1a0530, 1)
        .fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }

  _createReelBackdrops() {
    const pad    = 14;
    const totalW = (REEL_COUNT - 1) * REEL_SPACING + REEL_W + pad * 2;
    const totalH = REEL_H + pad * 2;
    const rx     = REELS_X0 - REEL_W / 2 - pad;
    const ry     = REELS_Y0 - pad;

    this.add.graphics()
      .lineStyle(3, 0xd4af37, 0.6)
      .strokeRoundedRect(rx - 3, ry - 3, totalW + 6, totalH + 6, 18)
      .fillStyle(0x000000, 0.55)
      .fillRoundedRect(rx, ry, totalW, totalH, 14);

    const g = this.add.graphics().lineStyle(1, 0xffffff, 0.08);
    for (let r = 1; r < REEL_COUNT; r++) {
      const lx = REELS_X0 + r * REEL_SPACING - REEL_SPACING / 2;
      g.lineBetween(lx, ry, lx, ry + totalH);
    }
  }

  // ─── Reels ──────────────────────────────────────────────────────────────────

  _createReels() {
    this.reels = [];
    for (let r = 0; r < REEL_COUNT; r++) {
      const worldX    = REELS_X0 + r * REEL_SPACING;
      const worldY    = REELS_Y0;
      const container = this.add.container(worldX, worldY);

      const maskGfx = this.make.graphics();
      maskGfx.fillStyle(0xffffff).fillRect(worldX - REEL_W / 2, worldY, REEL_W, REEL_H);
      container.setMask(maskGfx.createGeometryMask());

      const sprites = [];
      for (let i = 0; i < SPRITES_PER_REEL; i++) {
        const key = SYMBOL_IDS[Math.floor(Math.random() * SYMBOL_IDS.length)];
        const sp  = this.add.image(0, (i - 0.5) * SYMBOL_SIZE, key)
          .setDisplaySize(SYMBOL_SIZE - 14, SYMBOL_SIZE - 14);
        container.add(sp);
        sprites.push(sp);
      }

      this.reels.push({ r, worldX, worldY, container, sprites, scrollSpeed: 0, stopping: false });
    }
  }

  // ─── Win line & highlights ───────────────────────────────────────────────────

  _createWinLineGraphics() {
    this.winLineGfx = this.add.graphics();
  }

  _createScatterHighlights() {
    // Gold glow rectangles that appear on scatter symbols
    this.scatterGlows = [];
    for (let r = 0; r < REEL_COUNT; r++) {
      const rowGlows = [];
      for (let row = 0; row < ROW_COUNT; row++) {
        const gfx = this.add.graphics().setAlpha(0);
        rowGlows.push(gfx);
      }
      this.scatterGlows.push(rowGlows);
    }
  }

  // ─── Particles ──────────────────────────────────────────────────────────────

  _createParticles() {
    if (this.textures.exists("coin")) {
      this.coinEmitter = this.add.particles(0, 0, "coin", {
        speed: { min: 120, max: 400 }, angle: { min: 250, max: 290 },
        scale: { start: 1.2, end: 0.3 }, alpha: { start: 1, end: 0 },
        gravityY: 600, lifespan: 1400, quantity: 0, emitting: false
      }).setDepth(20);
    }

    if (this.textures.exists("star")) {
      this.starEmitter = this.add.particles(0, 0, "star", {
        speed: { min: 80, max: 300 }, angle: { min: 0, max: 360 },
        scale: { start: 1.5, end: 0 }, alpha: { start: 1, end: 0 },
        gravityY: 0, lifespan: 1800, quantity: 0, emitting: false
      }).setDepth(20);
    }
  }

  _burstCoins(x, y, count = 40) {
    if (!this.coinEmitter) return;
    this.coinEmitter.setPosition(x, y);
    this.coinEmitter.explode(count);
  }

  _burstStars(x, y, count = 30) {
    if (!this.starEmitter) return;
    this.starEmitter.setPosition(x, y);
    this.starEmitter.explode(count);
  }

  // ─── Audio ──────────────────────────────────────────────────────────────────

  _startBGM() {
    if (this.cache.audio.has("bgm") && !this.sound.get("bgm"))
      this.sound.add("bgm", { loop: true, volume: 0.3 }).play();
  }

  _playSfx(key, vol = 0.6) {
    if (this.cache.audio.has(key)) this.sound.play(key, { volume: vol });
  }

  // ─── Spin ───────────────────────────────────────────────────────────────────

  _onSpinRequested() {
    if (this.isSpinning) return;
    this.isSpinning = true;
    this.winLineGfx.clear();
    this._clearScatterGlows();

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
      const reel       = this.reels[r];
      const startDelay = r * REEL_START_DELAY;
      const spinHold   = SPIN_DURATION_BASE + r * REEL_EXTRA_DELAY;

      const p = new Promise(resolve => {
        this.time.delayedCall(startDelay, () => {
          reel.stopping = false;
          this.tweens.add({ targets: reel, scrollSpeed: SCROLL_SPEED, duration: SPIN_ACCEL_MS, ease: "Power2.easeIn" });

          this.time.delayedCall(spinHold, () => {
            reel.stopping = true;
            this.tweens.add({
              targets: reel, scrollSpeed: 0,
              duration: SPIN_DECEL_MS, ease: "Power3.easeOut",
              onComplete: () => { this._snapReel(r, reelOutcomes[r], resolve); }
            });
          });
        });
      });
      promises.push(p);
    }

    Promise.all(promises).then(() => {
      this._evaluateResult(reelOutcomes);
      this.isSpinning = false;
    });
  }

  _snapReel(r, targetSymbols, resolve) {
    const reel = this.reels[r];
    reel.scrollSpeed = 0;
    reel.stopping    = false;

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
    reel.sprites.forEach(sprite => {
      const baseY = sprite.y;
      this.tweens.add({
        targets: sprite, y: baseY + BOUNCE_DISTANCE,
        duration: 70, ease: "Power2.easeOut",
        yoyo: true, onComplete: () => { sprite.y = baseY; }
      });
    });
    this.time.delayedCall(140, resolve);
  }

  // ─── Win & Scatter Evaluation ────────────────────────────────────────────────

  _evaluateResult(reelOutcomes) {
    // Count scatters in entire grid (any position)
    const scatPositions = [];
    for (let r = 0; r < REEL_COUNT; r++)
      for (let row = 0; row < ROW_COUNT; row++)
        if (reelOutcomes[r][row] === SCATTER_SYM)
          scatPositions.push({ r, row });

    const scatCount = scatPositions.length;

    // Evaluate payline wins (all 3 rows)
    let totalWin = 0;
    const winningRows = [];
    for (let row = 0; row < ROW_COUNT; row++) {
      const line = reelOutcomes.map(reel => reel[row]);
      const { amount, symbol } = this._checkLine(line);
      if (amount > 0) { totalWin += amount; winningRows.push({ row, symbol }); }
    }

    // In free spin mode, apply multiplier
    if (this.gameMode === "freespin" && totalWin > 0) {
      totalWin *= this.multiplier;
      this.multiplier += MULT_INCREMENT;
      this.freespinTotal += totalWin;
      this.game.events.emit("freespin_win", { amount: totalWin, multiplier: this.multiplier, total: this.freespinTotal });
    }

    // Show payline wins
    if (winningRows.length > 0 && totalWin > 0) {
      this._showWins(winningRows, totalWin);
    }

    // Handle scatters
    if (scatCount >= SCATTER_TRIGGER) {
      this._highlightScatters(scatPositions);

      if (this.gameMode === "normal") {
        // Trigger free spins
        const spins = FREE_SPIN_TABLE[Math.min(scatCount, 5)] || 10;
        this.time.delayedCall(800, () => this._triggerFreeSpins(spins));
      } else {
        // Re-trigger during free spins
        const added = RETRIGGER_TABLE[Math.min(scatCount, 5)] || 5;
        this.freeSpinsLeft += added;
        this.game.events.emit("freespin_retrigger", { added, total: this.freeSpinsLeft });
      }
    }

    // Free spin counter
    if (this.gameMode === "freespin") {
      this.freeSpinsLeft--;
      this.game.events.emit("freespin_update", { left: this.freeSpinsLeft, multiplier: this.multiplier });
      if (this.freeSpinsLeft <= 0 && scatCount < SCATTER_TRIGGER) {
        this.time.delayedCall(1200, () => this._endFreeSpins());
      }
    }

    // Normal mode: send win to UI
    if (this.gameMode === "normal" && totalWin > 0) {
      this.game.events.emit("win_result", { amount: totalWin });
    }
  }

  _checkLine(line) {
    const first = line.find(s => s !== "WILD") || line[0];
    const count = line.filter(s => s === first || s === "WILD").length;
    if (count >= 3) {
      const pays = WIN_TABLE[first] || {};
      return { amount: pays[count] || 0, symbol: first };
    }
    return { amount: 0, symbol: null };
  }

  // ─── Win Display ─────────────────────────────────────────────────────────────

  _showWins(winningRows, totalWin) {
    winningRows.forEach(({ row }) => {
      this._drawWinLine(row);
      this._pulseRow(row);
    });
    this._burstCoins(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 45);
    this._playSfx(totalWin >= BIG_WIN_THRESHOLD ? "win_big" : "win_small");

    if (this.gameMode === "normal" && totalWin >= BIG_WIN_THRESHOLD) {
      this.time.delayedCall(900, () => {
        this.scene.launch("BigWinScene", { amount: totalWin, mega: totalWin >= MEGA_WIN_THRESHOLD });
      });
    }
  }

  _drawWinLine(rowIndex) {
    const y  = REELS_Y0 + rowIndex * SYMBOL_SIZE;
    const x1 = REELS_X0 - REEL_W / 2 - 4;
    const w  = (REEL_COUNT - 1) * REEL_SPACING + REEL_W + 8;
    this.winLineGfx.lineStyle(3, 0xffd700, 0.9).strokeRect(x1, y, w, SYMBOL_SIZE);
    this.tweens.add({
      targets: this.winLineGfx, alpha: 0,
      duration: 600, delay: 1800,
      onComplete: () => { this.winLineGfx.clear(); this.winLineGfx.setAlpha(1); }
    });
  }

  _pulseRow(rowIndex) {
    const spriteIdx = rowIndex + 1;
    this.reels.forEach(reel => {
      const sp = reel.sprites[spriteIdx];
      if (sp) this.tweens.add({ targets: sp, scaleX: 1.18, scaleY: 1.18, yoyo: true, repeat: 3, duration: 130, ease: "Sine.easeInOut" });
    });
  }

  // ─── Scatter Highlights ──────────────────────────────────────────────────────

  _highlightScatters(positions) {
    positions.forEach(({ r, row }) => {
      const sprite = this.reels[r].sprites[row + 1]; // +1 because sprite[0] is buffer
      if (!sprite) return;
      const wx = this.reels[r].worldX;
      const wy = this.reels[r].worldY + row * SYMBOL_SIZE;
      const gfx = this.scatterGlows[r][row];
      gfx.clear().lineStyle(4, 0xff44cc, 1).strokeRoundedRect(
        wx - SYMBOL_SIZE / 2 + 2, wy + 2, SYMBOL_SIZE - 4, SYMBOL_SIZE - 4, 10
      ).setAlpha(1);

      this.tweens.add({ targets: gfx, alpha: 0, duration: 800, delay: 1500 });
      this._burstStars(wx, wy + SYMBOL_SIZE / 2, 20);
    });
  }

  _clearScatterGlows() {
    this.scatterGlows.forEach(row => row.forEach(gfx => { gfx.clear(); gfx.setAlpha(1); }));
  }

  // ─── Free Spins ──────────────────────────────────────────────────────────────

  _triggerFreeSpins(count) {
    this.gameMode      = "freespin";
    this.freeSpinsLeft = count;
    this.multiplier    = 1;
    this.freespinTotal = 0;

    this._playSfx("bonus_trigger");
    this.game.events.emit("freespin_start", { spins: count });

    // Launch free spin overlay
    if (!this.scene.isActive("FreeSpinScene")) {
      this.scene.launch("FreeSpinScene");
    }
  }

  _endFreeSpins() {
    const total    = this.freespinTotal;
    this.gameMode  = "normal";
    this.multiplier = 1;

    this.game.events.emit("freespin_end", { total });
    this.scene.stop("FreeSpinScene");

    if (total > 0) {
      this.game.events.emit("win_result", { amount: total });
      this.time.delayedCall(500, () => {
        this.scene.launch("BigWinScene", { amount: total, mega: total >= MEGA_WIN_THRESHOLD });
      });
    }
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
