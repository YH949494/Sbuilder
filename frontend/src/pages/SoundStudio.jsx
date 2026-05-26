import { useGameConfig } from "../store/gameConfig";
import SoundPicker from "../components/SoundPicker";

const SFX_SLOTS = [
  { key: "sfx.spin",          label: "Spin Start" },
  { key: "sfx.stop",          label: "Reel Stop" },
  { key: "sfx.win_small",     label: "Small Win" },
  { key: "sfx.win_big",       label: "Big Win" },
  { key: "sfx.bonus_trigger", label: "Bonus Trigger" }
];

export default function SoundStudio() {
  const { config, updateConfig, setStep } = useGameConfig();
  const assets = config.assets;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Sound Studio</h2>
        <p className="text-white/50 text-sm mt-1">
          Upload background music and sound effects. MP3 or OGG recommended.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-white/10 p-5 bg-white/3">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Background Music</h3>
        <SoundPicker
          label="BGM Track"
          value={assets.bgm}
          onChange={(url) => updateConfig("assets.bgm", url)}
        />
      </div>

      <div className="space-y-4 rounded-xl border border-white/10 p-5 bg-white/3">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Sound Effects</h3>
        {SFX_SLOTS.map(slot => (
          <SoundPicker
            key={slot.key}
            label={slot.label}
            value={assets.sfx[slot.key.split(".")[1]]}
            onChange={(url) => updateConfig(`assets.${slot.key}`, url)}
          />
        ))}
      </div>

      <button onClick={() => setStep(6)}
        className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl">
        Next: Branding →
      </button>
    </div>
  );
}
