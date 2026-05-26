import { useGameConfig } from "../store/gameConfig";
import AIGenButton from "./AIGenButton";
import { generateImage, uploadImage } from "../api/client";

const TIER_COLORS = {
  premium:  "border-yellow-500/50 bg-yellow-500/5",
  standard: "border-white/20 bg-white/5",
  special:  "border-purple-500/50 bg-purple-500/5"
};

export default function SymbolSlot({ slot }) {
  const { config, updateConfig } = useGameConfig();
  const currentUrl = config.assets.symbols[slot.id];

  const handleGenerate = async (prompt) => {
    const { url } = await generateImage({
      prompt,
      slot_id: slot.id,
      game_id: config.game_id || "preview"
    });
    updateConfig(`assets.symbols.${slot.id}`, url);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await uploadImage(file, slot.id, config.game_id || "preview");
      updateConfig(`assets.symbols.${slot.id}`, url);
    } catch {
      // Use local object URL as fallback if backend upload fails
      updateConfig(`assets.symbols.${slot.id}`, URL.createObjectURL(file));
    }
  };

  const handleClear = () => updateConfig(`assets.symbols.${slot.id}`, null);

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${TIER_COLORS[slot.tier]}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm text-white">{slot.label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/30 font-mono">{slot.id}</span>
          {currentUrl && (
            <button onClick={handleClear} className="text-white/20 hover:text-red-400 text-xs">✕</button>
          )}
        </div>
      </div>

      {/* Preview + Upload area */}
      <div className="relative h-24 rounded-lg bg-black/40 flex items-center justify-center overflow-hidden">
        {currentUrl ? (
          <img src={currentUrl} alt={slot.id} className="h-20 object-contain" />
        ) : (
          <span className="text-white/20 text-xs text-center px-3 leading-relaxed">{slot.hint}</span>
        )}
        <label className="absolute inset-0 cursor-pointer opacity-0 hover:opacity-100
                          bg-black/60 flex items-center justify-center rounded-lg
                          text-xs text-white transition-opacity gap-1">
          📁 Upload image
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      {/* AI Generate */}
      <AIGenButton
        onGenerate={handleGenerate}
        placeholder={`Describe ${slot.label.toLowerCase()}…`}
      />
    </div>
  );
}
