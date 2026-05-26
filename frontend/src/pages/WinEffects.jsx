import { useGameConfig } from "../store/gameConfig";

const WIN_STYLES = {
  smallWin: ["glow", "flash", "shimmer"],
  bigWin:   ["explosion", "burst", "spiral"],
  megaWin:  ["fullscreen", "fireworks", "rainbow"]
};
const PARTICLE_TYPES = ["coins", "gems", "stars", "fire", "hearts"];
const WIN_LINE_STYLES = ["animated_sweep", "static", "pulse", "bounce"];
const COUNTER_SPEEDS = ["slow", "normal", "fast", "instant"];

export default function WinEffects() {
  const { config, updateConfig, setStep } = useGameConfig();
  const fx = config.winEffects;

  const Section = ({ title, path, options }) => (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => updateConfig(path, opt)}
            className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all ${
              config.winEffects[path.split(".").pop()] === opt
                ? "bg-yellow-500/20 border border-yellow-500/50 text-yellow-400"
                : "bg-white/5 border border-white/10 text-white/50 hover:text-white/80"
            }`}
          >
            {opt.replace(/_/g, " ")}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Win Effects</h2>
        <p className="text-white/50 text-sm mt-1">
          Configure celebrations for small wins, big wins, and mega wins.
        </p>
      </div>

      <div className="space-y-5 rounded-xl border border-white/10 p-5 bg-white/3">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Small Win</h3>
        <div className="space-y-2">
          <p className="text-xs text-white/40">Style</p>
          <div className="flex gap-2 flex-wrap">
            {WIN_STYLES.smallWin.map(s => (
              <button key={s}
                onClick={() => updateConfig("winEffects.smallWin.style", s)}
                className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all ${
                  fx.smallWin.style === s
                    ? "bg-yellow-500/20 border border-yellow-500/50 text-yellow-400"
                    : "bg-white/5 border border-white/10 text-white/50 hover:text-white/80"
                }`}
              >{s}</button>
            ))}
          </div>
          <p className="text-xs text-white/40 mt-2">Particles</p>
          <div className="flex gap-2 flex-wrap">
            {PARTICLE_TYPES.map(p => (
              <button key={p}
                onClick={() => updateConfig("winEffects.smallWin.particles", p)}
                className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all ${
                  fx.smallWin.particles === p
                    ? "bg-yellow-500/20 border border-yellow-500/50 text-yellow-400"
                    : "bg-white/5 border border-white/10 text-white/50 hover:text-white/80"
                }`}
              >{p}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-white/10 p-5 bg-white/3">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Big Win</h3>
        <div className="flex gap-2 flex-wrap">
          {WIN_STYLES.bigWin.map(s => (
            <button key={s}
              onClick={() => updateConfig("winEffects.bigWin.style", s)}
              className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all ${
                fx.bigWin.style === s
                  ? "bg-yellow-500/20 border border-yellow-500/50 text-yellow-400"
                  : "bg-white/5 border border-white/10 text-white/50 hover:text-white/80"
              }`}
            >{s}</button>
          ))}
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={fx.bigWin.screenShake}
            onChange={e => updateConfig("winEffects.bigWin.screenShake", e.target.checked)}
            className="accent-yellow-500"
          />
          <span className="text-sm text-white/70">Screen Shake</span>
        </label>
      </div>

      <div className="space-y-4 rounded-xl border border-white/10 p-5 bg-white/3">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Win Line Style</h3>
        <div className="flex gap-2 flex-wrap">
          {WIN_LINE_STYLES.map(s => (
            <button key={s}
              onClick={() => updateConfig("winEffects.winLineStyle", s)}
              className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all ${
                fx.winLineStyle === s
                  ? "bg-yellow-500/20 border border-yellow-500/50 text-yellow-400"
                  : "bg-white/5 border border-white/10 text-white/50 hover:text-white/80"
              }`}
            >{s.replace(/_/g, " ")}</button>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-white/10 p-5 bg-white/3">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Win Counter Speed</h3>
        <div className="flex gap-2">
          {COUNTER_SPEEDS.map(s => (
            <button key={s}
              onClick={() => updateConfig("winEffects.counterSpeed", s)}
              className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all ${
                fx.counterSpeed === s
                  ? "bg-yellow-500/20 border border-yellow-500/50 text-yellow-400"
                  : "bg-white/5 border border-white/10 text-white/50 hover:text-white/80"
              }`}
            >{s}</button>
          ))}
        </div>
      </div>

      <button onClick={() => setStep(5)}
        className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl">
        Next: Sound Studio →
      </button>
    </div>
  );
}
