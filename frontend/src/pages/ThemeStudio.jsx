import { useRef } from "react";
import { useGameConfig } from "../store/gameConfig";
import ColorPicker from "../components/ColorPicker";

const FONTS        = ["Cinzel", "Playfair Display", "Oswald", "Bebas Neue", "Press Start 2P"];
const REEL_FRAMES  = ["ornate_gold", "simple_dark", "neon_glow", "crystal_blue", "fire_red"];
const SPIN_BUTTONS = ["classic_round", "hexagon", "diamond", "arrow_pulse"];

export default function ThemeStudio() {
  const { config, updateConfig, setStep } = useGameConfig();
  const { ui, assets } = config;
  const bgRef = useRef(null);

  const handleBgUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateConfig("assets.background", url);
  };

  const ToggleGroup = ({ path, options, cols = 3 }) => {
    const keys   = path.split(".");
    let current  = config;
    for (const k of keys) current = current?.[k];

    return (
      <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => updateConfig(path, opt)}
            className={`py-2 px-3 rounded-lg text-xs capitalize transition-all ${
              current === opt
                ? "bg-yellow-500/20 border border-yellow-500/50 text-yellow-400"
                : "bg-white/5 border border-white/10 text-white/50 hover:text-white/80"
            }`}
          >
            {opt.replace(/_/g, " ")}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Theme Studio</h2>
        <p className="text-white/50 text-sm mt-1">Set visual style — background, colors, fonts, and frame decorations.</p>
      </div>

      {/* Background */}
      <div className="space-y-3 rounded-xl border border-white/10 p-5 bg-white/3">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Background Image</h3>
        <div className="flex items-center gap-4">
          {assets.background ? (
            <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-white/20">
              <img src={assets.background} alt="Background" className="w-full h-full object-cover" />
              <button
                onClick={() => updateConfig("assets.background", null)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70
                           text-white text-xs flex items-center justify-center hover:bg-red-600"
              >✕</button>
            </div>
          ) : (
            <div className="w-32 h-20 rounded-lg border border-dashed border-white/20
                           bg-black/30 flex items-center justify-center text-white/20 text-xs">
              No image
            </div>
          )}
          <div className="space-y-2">
            <label className="block px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg
                              text-sm cursor-pointer transition-colors w-fit">
              Upload Background
              <input ref={bgRef} type="file" accept="image/*" className="hidden" onChange={handleBgUpload} />
            </label>
            <p className="text-xs text-white/30">Recommended: 1280×720 JPG/PNG</p>
          </div>
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-4 rounded-xl border border-white/10 p-5 bg-white/3">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Colors</h3>
        <ColorPicker label="Primary Color"    value={ui.primaryColor} onChange={v => updateConfig("ui.primaryColor", v)} />
        <ColorPicker label="Accent Color"     value={ui.accentColor}  onChange={v => updateConfig("ui.accentColor",  v)} />
        <ColorPicker label="Background Color" value={ui.bgColor}      onChange={v => updateConfig("ui.bgColor",      v)} />
        <ColorPicker label="Glow Color"       value={ui.glowColor}    onChange={v => updateConfig("ui.glowColor",    v)} />
      </div>

      {/* Typography */}
      <div className="space-y-3 rounded-xl border border-white/10 p-5 bg-white/3">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Typography</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">Font Family</span>
          <select
            value={ui.fontFamily}
            onChange={e => updateConfig("ui.fontFamily", e.target.value)}
            className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none"
          >
            {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      </div>

      {/* Reel Frame */}
      <div className="space-y-3 rounded-xl border border-white/10 p-5 bg-white/3">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Reel Frame Style</h3>
        <ToggleGroup path="ui.reelFrameStyle" options={REEL_FRAMES} cols={3} />
      </div>

      {/* Spin Button */}
      <div className="space-y-3 rounded-xl border border-white/10 p-5 bg-white/3">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Spin Button</h3>
        <ToggleGroup path="ui.spinButtonStyle" options={SPIN_BUTTONS} cols={2} />
      </div>

      <button onClick={() => setStep(3)}
        className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-colors">
        Next: Symbol Studio →
      </button>
    </div>
  );
}
