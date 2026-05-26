import { useGameConfig } from "../store/gameConfig";

export default function Branding() {
  const { config, updateConfig, setStep } = useGameConfig();

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateConfig("assets.reelFrame", url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Branding</h2>
        <p className="text-white/50 text-sm mt-1">
          Set the game title and upload your logo.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-white/10 p-5 bg-white/3">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Game Title</h3>
        <input
          type="text"
          value={config.game_title}
          onChange={e => updateConfig("game_title", e.target.value)}
          placeholder="My Slot Game"
          maxLength={50}
          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3
                     text-white text-lg outline-none focus:border-yellow-500/50"
        />
        <p className="text-xs text-white/30">{config.game_title.length}/50 characters</p>
      </div>

      <div className="space-y-4 rounded-xl border border-white/10 p-5 bg-white/3">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Logo / Reel Frame</h3>
        <div className="flex flex-col items-center gap-4">
          {config.assets.reelFrame ? (
            <img
              src={config.assets.reelFrame}
              alt="Logo"
              className="h-24 object-contain rounded-lg"
            />
          ) : (
            <div className="h-24 w-full rounded-lg bg-black/40 border border-dashed border-white/20
                           flex items-center justify-center text-white/30 text-sm">
              No logo uploaded
            </div>
          )}
          <label className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm cursor-pointer">
            Upload Logo
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </label>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-white/10 p-5 bg-white/3">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Demo Mode</h3>
        <div className="flex gap-2">
          {["random", "scripted", "always_win"].map(mode => (
            <button
              key={mode}
              onClick={() => updateConfig("demo.mode", mode)}
              className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all ${
                config.demo.mode === mode
                  ? "bg-yellow-500/20 border border-yellow-500/50 text-yellow-400"
                  : "bg-white/5 border border-white/10 text-white/50 hover:text-white/80"
              }`}
            >
              {mode.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      <button onClick={() => setStep(7)}
        className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl">
        Next: Export →
      </button>
    </div>
  );
}
