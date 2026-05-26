import { useState } from "react";
import { useGameConfig } from "../store/gameConfig";
import { buildPackage } from "../api/client";
import api from "../api/client";
import ExportProgress from "../components/ExportProgress";

export default function ExportPage() {
  const { config } = useGameConfig();
  const [building, setBuilding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status,   setStatus  ] = useState("");
  const [done,     setDone    ] = useState(false);
  const [error,    setError   ] = useState(null);

  const symbolsFilled   = Object.values(config.assets.symbols).filter(Boolean).length;
  const hasBgm          = Boolean(config.assets.bgm);
  const hasBackground   = Boolean(config.assets.background);

  const step = (pct, msg) => { setProgress(pct); setStatus(msg); };

  const handleBuild = async () => {
    setBuilding(true);
    setDone(false);
    setError(null);

    try {
      step(10, "Saving config…");
      if (config.game_id) {
        await api.post("/api/config/save", config).catch(() => {});
      }

      step(30, "Building game package…");
      const blob = await buildPackage(config);

      step(90, "Preparing download…");
      const url = URL.createObjectURL(blob);
      const a   = document.createElement("a");
      a.href     = url;
      a.download = `${config.game_title || "slot_game"}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      step(100, "Done!");
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Build failed");
      setStatus("Error");
    } finally {
      setBuilding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Export</h2>
        <p className="text-white/50 text-sm mt-1">
          Build and download your slot game as a deployable zip package.
        </p>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-white/10 p-5 bg-white/3 space-y-3">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Game Summary</h3>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <span className="text-white/50">Title</span>
          <span className="text-white font-medium">{config.game_title}</span>

          <span className="text-white/50">Shell</span>
          <span className="text-white font-medium">{config.shell}</span>

          <span className="text-white/50">Symbols</span>
          <span className={symbolsFilled >= 8 ? "text-green-400" : "text-yellow-400"}>
            {symbolsFilled}/8 filled
          </span>

          <span className="text-white/50">Background</span>
          <span className={hasBackground ? "text-green-400" : "text-white/30"}>
            {hasBackground ? "✓" : "Using default"}
          </span>

          <span className="text-white/50">Music</span>
          <span className={hasBgm ? "text-green-400" : "text-white/30"}>
            {hasBgm ? "✓" : "No BGM"}
          </span>

          <span className="text-white/50">Demo Mode</span>
          <span className="text-white font-medium">{config.demo.mode}</span>
        </div>
      </div>

      {/* Warnings */}
      {symbolsFilled < 8 && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-300">
          ⚠ {8 - symbolsFilled} symbol slot(s) are empty — placeholder art will be used.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {building && <ExportProgress progress={progress} status={status} />}

      {done && !building && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400">
          ✓ Downloaded! Unzip and open <code className="font-mono bg-black/30 px-1 rounded">index.html</code> in a browser.
        </div>
      )}

      <button
        onClick={handleBuild}
        disabled={building}
        className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50
                   text-black font-bold rounded-xl text-lg transition-colors"
      >
        {building ? "Building…" : "📦 Build & Download"}
      </button>
    </div>
  );
}
