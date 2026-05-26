import { useGameConfig } from "../store/gameConfig";
import SymbolSlot from "../components/SymbolSlot";

const SYMBOL_SLOTS = [
  { id: "HP1",  label: "High Pay 1",  tier: "premium",  hint: "Your hero symbol — dragon, warrior, treasure chest" },
  { id: "HP2",  label: "High Pay 2",  tier: "premium",  hint: "Second premium — gem, crown, golden coin" },
  { id: "LP1",  label: "Low Pay 1",   tier: "standard", hint: "Card symbol — Ace, King" },
  { id: "LP2",  label: "Low Pay 2",   tier: "standard", hint: "Card symbol — Queen, Jack" },
  { id: "LP3",  label: "Low Pay 3",   tier: "standard", hint: "Card symbol — 10, 9" },
  { id: "LP4",  label: "Low Pay 4",   tier: "standard", hint: "Card symbol — 8, 7" },
  { id: "WILD", label: "Wild",        tier: "special",  hint: "WILD badge — glowing orb, wild text, logo" },
  { id: "SCAT", label: "Scatter",     tier: "special",  hint: "SCATTER badge — bonus icon, special symbol" }
];

export default function SymbolStudio() {
  const { setStep } = useGameConfig();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Symbol Studio</h2>
        <p className="text-white/50 text-sm mt-1">
          Generate or upload art for each symbol slot. Background removal and resizing is automatic.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {SYMBOL_SLOTS.map(slot => (
          <SymbolSlot key={slot.id} slot={slot} />
        ))}
      </div>

      <button onClick={() => setStep(4)}
        className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl">
        Next: Win Effects →
      </button>
    </div>
  );
}
