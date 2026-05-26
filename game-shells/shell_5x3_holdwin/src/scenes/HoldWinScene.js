/**
 * Hold & Win mechanic:
 * - Normal spin: symbols land, any COLLECT (SCAT) symbols stick.
 * - If ≥ 1 COLLECT lands → enter Respin phase (3 re-spins by default).
 * - Each Respin: locked cells stay, others spin. Any new COLLECT resets counter to 3.
 * - When counter reaches 0 → collect phase: total up all locked values.
 * - Fill all 15 cells → Grand Jackpot.
 */
import Phaser from "phaser";

const REEL_COUNT    = 5;
const ROW_COUNT     = 3;
const SYMBOL_SIZE   = 160;
const REEL_SPACING  = 170;
const CANVAS_W      = 1280;
const CANVAS_H      = 720;
const SYMBOL_IDS    = ["HP1", "HP2", "LP1", "LP2", "LP3", "LP4", "WILD", "SCAT"];
const BASE_VALUES   = { HP1: 5, HP2: 3, LP1: 1, LP2: 1, LP3: 1, LP4: 1, WILD: 0, SCAT: 2 };

export class HoldWinScene extends Phaser.Scene {
  constructor() { super({ key: "HoldWinScene" }); }

  create() {
    this.config      = this.registry.get("config");
    this.collectSym  = this.config?.holdwin?.collect_symbol || "SCAT";
    this.maxRespins  = this.config?.holdwin?.respins ?? 3;

    this.grid       = [];   // 5×3 array of { symbol, locked, value }
    this.respinsLeft = 0;
    this.inBonus    = false;
    this.isSpinning = false;
    this.totalWin   = 0;

    this._createBackground();
    this._createGrid();
    this._createRespinCounter();

    this.game.events.on("spin_requested", this._onSpin, this);
  }

  _createBackground() {
    if (this.textures.exists("background")) {
      this.add.image(CANVAS_W / 2, CANVAS_H / 2, "background").setDisplaySize(CANVAS_W, CANVAS_H);
    } else {
      this.add.graphics()
        .fillGradientStyle(0x060615, 0x060615, 0x1a0820, 0x1a0820, 1)
        .fillRect(0, 0, CANVAS_W, CANVAS_H);
    }
  }

  _createGrid() {
    this.cellSprites = [];
    this.lockOverlays = [];

    const startX = CANVAS_W / 2 - ((REEL_COUNT - 1) * REEL_SPACING) / 2;
    const startY = CANVAS_H / 2 - ((ROW_COUNT - 1) * SYMBOL_SIZE) / 2;

    for (let r = 0; r < REEL_COUNT; r++) {
      this.cellSprites.push([]);
      this.lockOverlays.push([]);
      this.grid.push([]);

      for (let row = 0; row < ROW_COUNT; row++) {
        const x = startX + r * REEL_SPACING;
        const y = startY + row * SYMBOL_SIZE;

        const sprite = this.add.image(x, y, SYMBOL_IDS[0])
          .setDisplaySize(SYMBOL_SIZE - 14, SYMBOL_SIZE - 14);

        const lockGfx = this.add.graphics()
          .lineStyle(3, 0xffd700, 0)
          .strokeRoundedRect(x - SYMBOL_SIZE/2 + 2, y - SYMBOL_SIZE/2 + 2, SYMBOL_SIZE - 4, SYMBOL_SIZE - 4, 8);

        this.cellSprites[r].push(sprite);
        this.lockOverlays[r].push(lockGfx);
        this.grid[r].push({ symbol: SYMBOL_IDS[0], locked: false, value: 0 });
      }
    }
  }

  _createRespinCounter() {
    this.respinText = this.add.text(CANVAS_W / 2, 50, "", {
      fontSize: "28px", fontFamily: "Cinzel, serif",
      color: "#ffd700", stroke: "#000", strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0);
  }

  _onSpin() {
    if (this.isSpinning) return;

    if (this.inBonus) {
      this._doRespin();
    } else {
      this._doNormalSpin();
    }
  }

  _doNormalSpin() {
    this.isSpinning = true;
    this.totalWin = 0;

    // Unlock all cells
    for (let r = 0; r < REEL_COUNT; r++) {
      for (let row = 0; row < ROW_COUNT; row++) {
        this.grid[r][row].locked = false;
        this.lockOverlays[r][row].lineStyle(3, 0xffd700, 0).strokeRoundedRect(0, 0, 0, 0);
      }
    }

    this._spinAllCells(false, () => {
      const collectCount = this._countCollect();
      if (collectCount >= 1) {
        this._enterBonusMode();
      } else {
        this.isSpinning = false;
      }
    });
  }

  _doRespin() {
    if (this.respinsLeft <= 0) {
      this._endBonus();
      return;
    }
    this.isSpinning = true;
    this.respinsLeft--;
    this._updateRespinDisplay();

    this._spinAllCells(true, () => {
      const newCollect = this._countNewCollect();
      if (newCollect > 0) {
        this.respinsLeft = this.maxRespins;  // reset
        this._updateRespinDisplay();
      }
      if (this.respinsLeft <= 0 || this._allCellsLocked()) {
        this._endBonus();
      } else {
        this.isSpinning = false;
      }
    });
  }

  _spinAllCells(skipLocked, onDone) {
    let pending = REEL_COUNT * ROW_COUNT;
    if (skipLocked) {
      pending = 0;
      for (let r = 0; r < REEL_COUNT; r++)
        for (let row = 0; row < ROW_COUNT; row++)
          if (!this.grid[r][row].locked) pending++;
    }
    if (pending === 0) { onDone(); return; }

    let done = 0;
    const checkDone = () => { if (++done >= pending) onDone(); };

    for (let r = 0; r < REEL_COUNT; r++) {
      for (let row = 0; row < ROW_COUNT; row++) {
        if (skipLocked && this.grid[r][row].locked) continue;
        this._spinCell(r, row, checkDone);
      }
    }
  }

  _spinCell(r, row, onDone) {
    const sprite = this.cellSprites[r][row];
    let ticks = 0;
    const maxTicks = 8 + r * 3 + Math.floor(Math.random() * 5);

    const ticker = this.time.addEvent({
      delay: 60,
      repeat: maxTicks,
      callback: () => {
        const key = SYMBOL_IDS[Math.floor(Math.random() * SYMBOL_IDS.length)];
        sprite.setTexture(key).setAlpha(0.7);
        if (++ticks >= maxTicks) {
          // Final symbol — weighted toward collect in bonus
          const finalKey = this._pickSymbol();
          sprite.setTexture(finalKey).setAlpha(1);
          this.grid[r][row].symbol = finalKey;

          if (finalKey === this.collectSym) {
            this.grid[r][row].locked = true;
            this.grid[r][row].value  = BASE_VALUES[finalKey] || 2;
            this._showLock(r, row);
          }
          onDone();
        }
      }
    });
  }

  _pickSymbol() {
    // Slightly higher chance of collect in bonus mode
    if (this.inBonus && Math.random() < 0.12) return this.collectSym;
    return SYMBOL_IDS[Math.floor(Math.random() * SYMBOL_IDS.length)];
  }

  _showLock(r, row) {
    const sprite = this.cellSprites[r][row];
    const gfx    = this.lockOverlays[r][row];
    const x = sprite.x - SYMBOL_SIZE / 2 + 2;
    const y = sprite.y - SYMBOL_SIZE / 2 + 2;
    const s = SYMBOL_SIZE - 4;

    gfx.clear().lineStyle(3, 0xffd700, 0.9).strokeRoundedRect(x, y, s, s, 8);

    this.tweens.add({
      targets: sprite,
      scaleX: 1.15, scaleY: 1.15,
      yoyo: true, duration: 150, ease: "Back.easeOut"
    });
  }

  _enterBonusMode() {
    this.inBonus     = true;
    this.respinsLeft = this.maxRespins;
    this._updateRespinDisplay();
    this.game.events.emit("bonus_started");
    this.isSpinning = false;
  }

  _endBonus() {
    this.inBonus = false;
    this.respinsLeft = 0;
    this.respinText.setAlpha(0);

    const total = this._calcTotalWin();
    this.game.events.emit("win_result", { amount: total });

    // Unlock all
    for (let r = 0; r < REEL_COUNT; r++)
      for (let row = 0; row < ROW_COUNT; row++) {
        this.grid[r][row].locked = false;
        this.lockOverlays[r][row].clear();
      }

    if (this._allCellsFilled()) {
      this.scene.launch("BonusScene", { amount: total, jackpot: "GRAND" });
    }

    this.isSpinning = false;
  }

  _countCollect() {
    let n = 0;
    for (let r = 0; r < REEL_COUNT; r++)
      for (let row = 0; row < ROW_COUNT; row++)
        if (this.grid[r][row].symbol === this.collectSym) n++;
    return n;
  }

  _countNewCollect() {
    let n = 0;
    for (let r = 0; r < REEL_COUNT; r++)
      for (let row = 0; row < ROW_COUNT; row++)
        if (this.grid[r][row].symbol === this.collectSym && this.grid[r][row].locked) n++;
    return n;
  }

  _calcTotalWin() {
    let total = 0;
    for (let r = 0; r < REEL_COUNT; r++)
      for (let row = 0; row < ROW_COUNT; row++)
        if (this.grid[r][row].locked) total += this.grid[r][row].value || 0;
    return total;
  }

  _allCellsLocked() {
    for (let r = 0; r < REEL_COUNT; r++)
      for (let row = 0; row < ROW_COUNT; row++)
        if (!this.grid[r][row].locked) return false;
    return true;
  }

  _allCellsFilled() {
    return this._allCellsLocked();
  }

  _updateRespinDisplay() {
    if (this.respinsLeft > 0) {
      this.respinText.setText(`Respins: ${this.respinsLeft}`).setAlpha(1);
    } else {
      this.respinText.setAlpha(0);
    }
  }

  applyConfig(config) {
    this.config = config;
    this.scene.restart();
  }

  triggerSpin() {
    this._onSpin();
  }
}
