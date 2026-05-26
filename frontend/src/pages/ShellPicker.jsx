import { useGameConfig } from "../store/gameConfig";

const SHELLS = [
  {
    id:          "shell_5x3_243ways",
    name:        "5x3 — 243 Ways",
    description: "Classic 5 reel, 3 row layout with 243 payways. Most popular format.",
    status:      "ready",
    tag:         "Sprint 1"
  },
  {
    id:          "shell_5x3_holdwin",
    name:        "5x3 — Hold & Win",
    description: "Collect symbols lock in place, triggering re-spins. Fill the grid for a Grand Jackpot.",
    status:      "ready",
    tag:         "Sprint 2"
  },
  {
    id:          "shell_5x3_bonusgame",
    name:        "5x3 — Bonus Game",
    description: "3+ scatters trigger free spins. Multiplier grows with each winning spin. Re-triggerable.",
    status:      "ready",
    tag:         "Sprint 3"
  }
];

export default function ShellPicker() {
  const { config, updateConfig, setStep } = useGameConfig();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Choose a Shell</h2>
        <p className="text-white/50 text-sm mt-1">
          The shell defines the reel layout and core mechanics.
        </p>
      </div>

      <div className="grid gap-4">
        {SHELLS.map(shell => (
          <button
            key={shell.id}
            onClick={() => {
              if (shell.status === "ready") {
                updateConfig("shell", shell.id);
                setStep(2);
              }
            }}
            disabled={shell.status !== "ready"}
            className={`
              text-left rounded-xl border p-5 transition-all
              ${config.shell === shell.id
                ? "border-yellow-500/70 bg-yellow-500/10"
                : shell.status === "ready"
                  ? "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/8"
                  : "border-white/10 bg-white/3 opacity-50 cursor-not-allowed"
              }
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-white">{shell.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                shell.status === "ready"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-white/10 text-white/40"
              }`}>
                {shell.tag}
              </span>
            </div>
            <p className="text-sm text-white/50">{shell.description}</p>
            {config.shell === shell.id && (
              <p className="text-xs text-yellow-400 mt-2">✓ Selected</p>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={() => setStep(2)}
        disabled={!config.shell}
        className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40
                   text-black font-bold rounded-xl transition-colors"
      >
        Next: Theme Studio →
      </button>
    </div>
  );
}
