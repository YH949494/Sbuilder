import { useState } from "react";
import { useGameConfig } from "../store/gameConfig";
import { generateImage, uploadImage } from "../api/client";

const TIER_COLORS = {
  premium:  "border-yellow-500/50 bg-yellow-500/5",
  standard: "border-white/20 bg-white/5",
  special:  "border-purple-500/50 bg-purple-500/5"
};

export default function SymbolSlot({ slot }) {
  const { config, updateConfig } = useGameConfig();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentUrl = config.assets.symbols[slot.id];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { url } = await generateImage({
        prompt,
        slot_id: slot.id,
        game_id: config.game_id || "preview"
      });
      updateConfig(`assets.symbols.${slot.id}`, url);
    } catch (err) {
      setError("Generation failed. Check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const { url } = await uploadImage(file, slot.id, config.game_id || "preview");
      updateConfig(`assets.symbols.${slot.id}`, url);
    } catch {
      const localUrl = URL.createObjectURL(file);
      updateConfig(`assets.symbols.${slot.id}`, localUrl);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${TIER_COLORS[slot.tier]}`}>
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm text-white">{slot.label}</span>
        <span className="text-xs text-white/30 font-mono">{slot.id}</span>
      </div>

      <div className="relative h-24 rounded-lg bg-black/40 flex items-center justify-center">
        {currentUrl ? (
          <img src={currentUrl} alt={slot.id} className="h-20 object-contain" />
        ) : (
          <span className="text-white/20 text-xs text-center px-3">{slot.hint}</span>
        )}
        <label className="absolute inset-0 cursor-pointer opacity-0 hover:opacity-100
                          bg-black/60 flex items-center justify-center rounded-lg
                          text-xs text-white transition-opacity">
          📁 Upload
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <div className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleGenerate()}
          placeholder="Describe symbol..."
          className="flex-1 text-xs bg-black/40 border border-white/10 rounded-lg
                     px-3 py-2 text-white placeholder:text-white/20 outline-none
                     focus:border-yellow-500/50"
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="px-3 py-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40
                     text-black text-xs font-bold rounded-lg whitespace-nowrap"
        >
          {loading ? "..." : "✨ Gen"}
        </button>
      </div>
    </div>
  );
}
