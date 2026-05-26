"""
RTP Simulator — run 1M spins and report actual return-to-player %.
Usage: python scripts/rtp_simulator.py
"""
import random
import argparse

SYMBOL_IDS = ["HP1", "HP2", "LP1", "LP2", "LP3", "LP4", "WILD", "SCAT"]

PAY_TABLE = {
    "HP1": {5: 500, 4: 100, 3: 30},
    "HP2": {5: 250, 4:  60, 3: 15},
    "LP1": {5:  80, 4:  20, 3:  5},
    "LP2": {5:  60, 4:  15, 3:  4},
    "LP3": {5:  40, 4:  10, 3:  3},
    "LP4": {5:  30, 4:   8, 3:  2},
    "WILD": {5: 1000, 4: 200, 3: 50},
}

REEL_COUNT = 5
ROW_COUNT  = 3
BET        = 1


def spin():
    return [
        [random.choice(SYMBOL_IDS) for _ in range(ROW_COUNT)]
        for _ in range(REEL_COUNT)
    ]


def evaluate(reels):
    total = 0
    for row in range(ROW_COUNT):
        line = [reels[r][row] for r in range(REEL_COUNT)]
        total += _check_line(line)
    return total


def _check_line(line):
    first = next((s for s in line if s not in ("WILD",)), line[0])
    count = sum(1 for s in line if s == first or s == "WILD")
    if count >= 3:
        pays = PAY_TABLE.get(first, {})
        return pays.get(count, 0)
    return 0


def simulate(spins: int = 1_000_000) -> None:
    total_bet = spins * BET
    total_win = 0

    for _ in range(spins):
        reels = spin()
        total_win += evaluate(reels)

    rtp = (total_win / total_bet) * 100
    print(f"Spins     : {spins:,}")
    print(f"Total bet : {total_bet:,}")
    print(f"Total win : {total_win:,}")
    print(f"RTP       : {rtp:.2f}%")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--spins", type=int, default=1_000_000)
    args = parser.parse_args()
    simulate(args.spins)
