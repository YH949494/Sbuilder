# SlotForge — Slot Game Builder

A full-stack monorepo for building, skinning, and exporting browser-based slot games.

## Stack

| Layer | Tech | Host |
|-------|------|------|
| Frontend | React + Vite + Tailwind | Vercel |
| Backend | Flask + Python | Fly.io |
| Game Engine | Phaser.js | Served via Flask |
| Asset Storage | Cloudflare R2 / AWS S3 | Cloud |
| Database | MongoDB Atlas | Cloud |
| Image AI | OpenAI GPT Image API | External |

## Shells (Sprint Status)

| Shell | Mechanic | Status |
|-------|----------|--------|
| `shell_5x3_243ways` | Classic 5×3, 243 payways, all-row win detection | ✅ Sprint 1 |
| `shell_5x3_holdwin` | Hold & Win, collect symbols lock + re-spins, Grand Jackpot | ✅ Sprint 2 |
| `shell_5x3_bonusgame` | 3+ scatters → free spins, growing multiplier, re-trigger | ✅ Sprint 3 |

## Quick Start

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in keys
python app.py
# → http://localhost:8080/health
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
# → http://localhost:5173
```

### Game Shell (standalone dev)
```bash
cd game-shells/shell_5x3_243ways   # or shell_5x3_holdwin / shell_5x3_bonusgame
npm install
npm run dev
```

### Seed demo data (MongoDB)
```bash
python scripts/seed_demo.py
```

### RTP verification
```bash
python scripts/rtp_simulator.py --spins 1000000
```

## Environment Variables

### Backend `.env`
```
OPENAI_API_KEY=sk-...
CLOUDFLARE_R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY=...
CLOUDFLARE_R2_SECRET_KEY=...
CLOUDFLARE_R2_BUCKET=slotforge-assets
ASSET_BASE_URL=https://assets.slotforge.com
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net
MONGODB_DB=slotforge
```

### Frontend `.env.local`
```
VITE_API_BASE=https://slotforge-backend.fly.dev
```

## Deploy

**Backend (Fly.io):**
```bash
cd backend
fly deploy
fly secrets set OPENAI_API_KEY=sk-... MONGODB_URI=...
```

**Frontend (Vercel):**
Push to `main` → GitHub Actions auto-deploys. Set env vars in Vercel dashboard.

## Architecture

```
slotforge/
├── backend/                  Flask API
│   ├── routes/               image, build, preview, config
│   └── services/             image_pipeline, asset_manager, config_builder, game_packager, db
├── frontend/                 React + Vite + Tailwind
│   └── src/
│       ├── pages/            Dashboard, ShellPicker, ThemeStudio, SymbolStudio,
│       │                     WinEffects, SoundStudio, Branding, ExportPage
│       ├── components/       StepNav, LivePreview, SymbolSlot, AIGenButton, ...
│       └── store/            Zustand game config store
├── game-shells/
│   ├── shell_5x3_243ways/    Phaser 3 — smooth scrolling reels, coin particles, win lines
│   ├── shell_5x3_holdwin/    Phaser 3 — Hold & Win, lock overlays, Grand Jackpot
│   └── shell_5x3_bonusgame/  Phaser 3 — scatter triggers, free spins, multiplier HUD
└── scripts/
    ├── rtp_simulator.py      1M-spin RTP verification
    └── seed_demo.py          Seed demo game into MongoDB
```
