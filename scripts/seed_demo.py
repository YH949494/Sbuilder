"""
Seed a demo game config into MongoDB for local development.
Usage: python scripts/seed_demo.py
Requires MONGODB_URI env var or defaults to localhost.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))

from services.db import get_collection

DEMO_CONFIG = {
    "game_id":    "demo-dragon-243",
    "game_title": "Dragon's Fortune",
    "shell":      "shell_5x3_243ways",
    "grid":       {"cols": 5, "rows": 3},
    "assets": {
        "background": None,
        "reelFrame":  None,
        "symbols": {
            "HP1": None, "HP2": None,
            "LP1": None, "LP2": None,
            "LP3": None, "LP4": None,
            "WILD": None, "SCAT": None
        },
        "bgm": None,
        "sfx": {
            "spin": None, "stop": None,
            "win_small": None, "win_big": None,
            "bonus_trigger": None
        }
    },
    "ui": {
        "primaryColor":    "#d4af37",
        "accentColor":     "#8b0000",
        "bgColor":         "#0a0a1a",
        "glowColor":       "#ffd700",
        "fontFamily":      "Cinzel",
        "reelFrameStyle":  "ornate_gold",
        "spinButtonStyle": "classic_round"
    },
    "winEffects": {
        "smallWin": {"style": "glow",      "particles": "coins"},
        "bigWin":   {"style": "explosion", "particles": "coins", "screenShake": True},
        "megaWin":  {"style": "fullscreen","particles": "gems",  "screenShake": True},
        "winLineStyle": "animated_sweep",
        "counterSpeed": "fast"
    },
    "demo": {
        "mode": "scripted",
        "sequence": [
            ["LP1","LP2","HP1","LP3","WILD","LP2","HP1","LP4","SCAT","LP1","HP2","LP3","WILD","LP1","LP4"],
            ["HP1","HP1","HP1","LP2","LP3","HP1","LP1","WILD","LP4","LP2","HP2","LP3","LP1","LP4","LP2"]
        ]
    }
}

def main():
    col = get_collection("game_configs")
    col.replace_one({"game_id": DEMO_CONFIG["game_id"]}, DEMO_CONFIG, upsert=True)
    print(f"✓ Seeded game '{DEMO_CONFIG['game_title']}' (id: {DEMO_CONFIG['game_id']})")

if __name__ == "__main__":
    main()
