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

## Quick Start

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in your keys
python app.py
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### Game Shell (dev)
```bash
cd game-shells/shell_5x3_243ways
npm install
npm run dev
```

## Sprint 1 Checklist

- [ ] Flask routes scaffold
- [ ] `/api/image/generate` → GPT Image API → rembg → R2
- [ ] Phaser 5x3 shell — PreloaderScene + GameScene + BigWinScene + UIScene
- [ ] React skinning tool — 7-step wizard
- [ ] Live Preview iframe with postMessage bridge
- [ ] GitHub Actions CI/CD
