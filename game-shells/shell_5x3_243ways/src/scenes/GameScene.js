import Phaser from "phaser";
import {
  REEL_COUNT, ROW_COUNT, SYMBOL_SIZE, REEL_SPACING,
  SPIN_DURATION_BASE, BOUNCE_DISTANCE, REEL_START_DELAY,
  REEL_EXTRA_DELAY, CANVAS_WIDTH, CANVAS_HEIGHT, SYMBOL_IDS
} from "../constants.js";

export class GameScene extends Phaser.Scene {
  constructor() { super({ key: "GameScene" }); }

  create() {
    this.config = this.registry.get("config");
    this.isSpinning = false;
    this.spinIndex = 0;

    this._createBackground();
    this._createReels();
    this._createWinLineGraphics();

    this.game.events.on("spin_requested", this._onSpinRequested, this);
  }

  // ─── Background ─────────────────────────────────────────────────────────────

  _createBackground() {
    if (this.textures.exists("background")) {
      this.add.image(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, "background")
        .setDisplaySize(CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      const g = this.add.graphics();
      g.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x1a0a2e, 0x1a0a2e, 1);
      g.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // Reel area backdrop
    const reelW = REEL_COUNT * REEL_SPACING + 40;
    const reelH = ROW_COUNT * SYMBOL_SIZE + 40;
    const rx = CANVAS_WIDTH / 2 - reelW / 2;
    const ry = CANVAS_HEIGHT / 2 - reelH / 2;
    this.add.graphics()
      .fillStyle(0x000000, 0.5)
      .fillRoundedRect(rx, ry, reelW, reelH, 12);
  }

  // ─── Reels ──────────────────────────────────────────────────────────────────

  _createReels() {
    this.reels = [];

    const startX = CANVAS_WIDTH / 2 - ((REEL_COUNT - 1) * REEL_SPACING) / 2;
    const startY = CANVAS_HEIGHT / 2 - ((ROW_COUNT - 1) * SYMBOL_SIZE) / 2;

    for (let r = 0; r < REEL_COUNT; r++) {
      const reelSymbols = [];
      const x = startX + r * REEL_SPACING;

      for (let row = 0; row < ROW_COUNT; row++) {
        const sym = this.add.image(x, startY + row * SYMBOL_SIZE, SYMBOL_IDS[0])
          .setDisplaySize(SYMBOL_SIZE - 10, SYMBOL_SIZE - 10);
        reelSymbols.push(sym);
      }

      this.reels.push({ x, symbols: reelSymbols });
    }
  }

  // ─── Win line overlay ────────────────────────────────────────────────────────

  _createWinLineGraphics() {
    this.winLineGfx = this.add.graphics();
  }

  // ─── Spin ───────────────────────────────────────────────────────────────────

  _onSpinRequested() {
    if (this.isSpinning) return;
    this.isSpinning = true;
    this.winLineGfx.clear();

    const seq = this.config?.demo?.sequence || [];
    if (!seq.length) {
      this._spinReels(this._randomOutcome());
      return;
    }
    const outcome = seq[this.spinIndex % seq.length];
    this.spinIndex++;
    this._spinReels(this._parseOutcome(outcome));
  }

  _randomOutcome() {
    const reelOutcomes = [];
    for (let r = 0; r < REEL_COUNT; r++) {
      reelOutcomes.push(Array.from({ length: ROW_COUNT }, () =>
        SYMBOL_IDS[Math.floor(Math.random() * SYMBOL_IDS.length)]
      ));
    }
    return reelOutcomes;
  }

  _parseOutcome(flat) {
    const reelOutcomes = [];
    for (let r = 0; r < REEL_COUNT; r++) {
      reelOutcomes.push([
        flat[r * ROW_COUNT],
        flat[r * ROW_COUNT + 1],
        flat[r * ROW_COUNT + 2]
      ]);
    }
    return reelOutcomes;
  }

  _spinReels(reelOutcomes) {
    const promises = [];

    for (let r = 0; r < REEL_COUNT; r++) {
      const delay = r * REEL_START_DELAY;
      const duration = SPIN_DURATION_BASE + r * REEL_EXTRA_DELAY;

      const p = new Promise(resolve => {
        this.time.delayedCall(delay, () => {
          this._startReelBlur(r);
          this.time.delayedCall(duration, () => {
            this._stopReel(r, reelOutcomes[r], resolve);
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

  _startReelBlur(reelIndex) {
    const reel = this.reels[reelIndex];
    this.time.addEvent({
      delay: 60,
      repeat: 20,
      callback: () => {
        reel.symbols.forEach(sprite => {
          const key = SYMBOL_IDS[Math.floor(Math.random() * SYMBOL_IDS.length)];
          sprite.setTexture(key).setAlpha(0.7);
        });
      }
    });
  }

  _stopReel(reelIndex, symbolIds, resolve) {
    const reel = this.reels[reelIndex];
    const startY = CANVAS_HEIGHT / 2 - ((ROW_COUNT - 1) * SYMBOL_SIZE) / 2;

    symbolIds.forEach((symId, row) => {
      const key = this.textures.exists(symId) ? symId : SYMBOL_IDS[0];
      reel.symbols[row].setTexture(key).setAlpha(1);
    });

    reel.symbols.forEach((sprite, row) => {
      const targetY = startY + row * SYMBOL_SIZE;
      this.tweens.add({
        targets: sprite,
        y: targetY + BOUNCE_DISTANCE,
        duration: 80,
        ease: "Power2",
        yoyo: true,
        onComplete: () => { sprite.y = targetY; }
      });
    });

    this.time.delayedCall(160, resolve);
  }

  // ─── Win Detection ──────────────────────────────────────────────────────────

  _evaluateWins(reelOutcomes) {
    const middleRow = reelOutcomes.map(reel => reel[1]);
    const firstSym = middleRow.find(s => s !== "WILD") || middleRow[0];
    const matchCount = middleRow.filter(s => s === firstSym || s === "WILD").length;

    if (matchCount >= 3) {
      const winAmount = matchCount === 5 ? 1250 : matchCount === 4 ? 200 : 25;
      this._showWin(winAmount);
    }
  }

  _showWin(amount) {
    this._drawWinLine(1);

    // Pulse winning row sprites
    const startY = CANVAS_HEIGHT / 2 - ((ROW_COUNT - 1) * SYMBOL_SIZE) / 2;
    this.reels.forEach(reel => {
      const sprite = reel.symbols[1];
      this.tweens.add({
        targets: sprite,
        scaleX: 1.2, scaleY: 1.2,
        yoyo: true, repeat: 3, duration: 150,
        ease: "Sine.easeInOut"
      });
    });

    this.game.events.emit("win_result", { amount });

    if (amount > 500) {
      this.time.delayedCall(800, () => {
        this.scene.launch("BigWinScene", { amount });
      });
    }
  }

  _drawWinLine(rowIndex) {
    const startY = CANVAS_HEIGHT / 2 - ((ROW_COUNT - 1) * SYMBOL_SIZE) / 2;
    const y = startY + rowIndex * SYMBOL_SIZE;
    const x1 = this.reels[0].x - SYMBOL_SIZE / 2;
    const x2 = this.reels[REEL_COUNT - 1].x + SYMBOL_SIZE / 2;

    this.winLineGfx.lineStyle(4, 0xffd700, 0.9);
    this.winLineGfx.strokeRect(x1, y - SYMBOL_SIZE / 2 + 5, x2 - x1, SYMBOL_SIZE - 10);

    this.time.delayedCall(2000, () => this.winLineGfx.clear());
  }

  // ─── Live Config Update ──────────────────────────────────────────────────────

  applyConfig(config) {
    this.config = config;
    this.scene.restart();
  }

  triggerSpin() {
    this._onSpinRequested();
  }
}
