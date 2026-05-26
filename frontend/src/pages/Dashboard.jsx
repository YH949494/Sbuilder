import { useState, useEffect } from "react";
import { useGameConfig } from "../store/gameConfig";
import api from "../api/client";

export default function Dashboard() {
  const { setStep, initNewGame, loadGame } = useGameConfig();
  const [savedGames, setSavedGames] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    api.get("/api/config/list")
      .then(r => setSavedGames(r.data))
      .catch(() => setSavedGames([]))
      .finally(() => setLoadingList(false));
  }, []);

  const handleNew = () => {
    initNewGame();
    setStep(1);
  };

  const handleLoad = async (game_id) => {
    try {
      const { data } = await api.get(`/api/config/${game_id}`);
      loadGame(data);
      setStep(1);
    } catch {
      alert("Failed to load game.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-yellow-400 tracking-widest mb-2">
          SLOTFORGE
        </h1>
        <p className="text-white/40 text-sm tracking-wider uppercase">
          Slot Game Creator
        </p>
      </div>

      {/* Main actions */}
      <div className="flex flex-col gap-4 w-full max-w-sm mb-14">
        <button
          onClick={handleNew}
          className="w-full py-4 bg-yellow-500 hover:bg-yellow-400
                     text-black font-bold text-lg rounded-xl transition-all
                     shadow-lg shadow-yellow-500/20 hover:shadow-yellow-400/30"
        >
          + New Game
        </button>

        <button
          disabled
          className="w-full py-3 border border-white/10 text-white/30
                     font-semibold rounded-xl cursor-not-allowed text-sm"
        >
          Import Game (coming soon)
        </button>
      </div>

      {/* Saved games */}
      <div className="w-full max-w-2xl">
        <h2 className="text-xs text-white/40 uppercase tracking-widest mb-4">
          Saved Games
        </h2>

        {loadingList ? (
          <p className="text-white/20 text-sm text-center py-8">Loading…</p>
        ) : savedGames.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-white/3 p-8 text-center">
            <p className="text-white/25 text-sm">No saved games yet.</p>
            <p className="text-white/15 text-xs mt-1">Create your first slot game above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {savedGames.map(g => (
              <button
                key={g.game_id}
                onClick={() => handleLoad(g.game_id)}
                className="text-left rounded-xl border border-white/10 bg-white/5
                           hover:border-yellow-500/40 hover:bg-yellow-500/5
                           p-4 transition-all group"
              >
                <p className="font-semibold text-white group-hover:text-yellow-300 truncate">
                  {g.game_title || "Untitled"}
                </p>
                <p className="text-xs text-white/30 mt-1">{g.shell?.replace("shell_", "") || "—"}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
