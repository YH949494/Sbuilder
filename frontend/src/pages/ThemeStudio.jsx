import { useGameConfig } from "../store/gameConfig";
import ColorPicker from "../components/ColorPicker";

const FONTS = ["Cinzel", "Playfair Display", "Oswald", "Bebas Neue", "Press Start 2P"];
const REEL_FRAMES = ["ornate_gold", "simple_dark", "neon_glow", "crystal_blue", "fire_red"];
const SPIN_BUTTONS = ["classic_round", "hexagon", "diamond", "arrow_pulse"];

export default function ThemeStudio() {
  const { config, updateConfig, setStep } = useGameConfig();
  const ui = config.ui;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Theme Studio</h2>
        <p className="text-white/50 text-sm mt-1">
          Set the visual style — colors, fonts, and frame decorations.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-white/10 p-5 bg-white/3">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Colors</h3>
        <ColorPicker label="Primary Color" value={ui.primaryColor}
          onChange={v => updateConfig("ui.primaryColor", v)} />
        <ColorPicker label="Accent Color" value={ui.accentColor}
          onChange={v => updateConfig("ui.accentColor", v)} />
        <ColorPicker label="Background Color" value={ui.bgColor}
          onChange={v => updateConfig("ui.bgColor", v)} />
        <ColorPicker label="Glow Color" value={ui.glowColor}
          onChange={v => updateConfig("ui.glowColor", v)} />
      </div>

      <div className="space-y-4 rounded-xl border border-white/10 p-5 bg-white/3">
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

      <div className="space-y-4 rounded-xl border border-white/10 p-5 bg-white/3">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Reel Frame</h3>
        <div className="grid grid-cols-3 gap-2">
          {REEL_FRAMES.map(frame => (
            <button
              key={frame}
              onClick={() => updateConfig("ui.reelFrameStyle", frame)}
              className={`py-2 px-3 rounded-lg text-xs capitalize transition-all ${
                ui.reelFrameStyle === frame
                  ? "bg-yellow-500/20 border border-yellow-500/50 text-yellow-400"
                  : "bg-white/5 border border-white/10 text-white/50 hover:text-white/80"
              }`}
            >
              {frame.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-white/10 p-5 bg-white/3">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Spin Button</h3>
        <div className="grid grid-cols-2 gap-2">
          {SPIN_BUTTONS.map(btn => (
            <button
              key={btn}
              onClick={() => updateConfig("ui.spinButtonStyle", btn)}
              className={`py-2 px-3 rounded-lg text-xs capitalize transition-all ${
                ui.spinButtonStyle === btn
                  ? "bg-yellow-500/20 border border-yellow-500/50 text-yellow-400"
                  : "bg-white/5 border border-white/10 text-white/50 hover:text-white/80"
              }`}
            >
              {btn.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      <button onClick={() => setStep(3)}
        className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl">
        Next: Symbol Studio →
      </button>
    </div>
  );
}
