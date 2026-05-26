import { useGameConfig } from "../store/gameConfig";

export default function StepNav({ steps, current, onSelect }) {
  const { setStep } = useGameConfig();

  return (
    <nav className="w-20 flex flex-col items-center py-4 gap-1 border-r border-white/10 bg-black/30">
      {/* Home / Dashboard button */}
      <button
        onClick={() => setStep(0)}
        title="Dashboard"
        className="w-14 h-10 rounded-xl flex items-center justify-center text-lg
                   text-white/25 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all mb-2"
      >
        ⌂
      </button>

      <div className="w-8 h-px bg-white/10 mb-2" />

      {steps.map((step) => (
        <button
          key={step.id}
          onClick={() => onSelect(step.id)}
          className={`
            w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1
            text-lg transition-all
            ${current === step.id
              ? "bg-yellow-500/20 border border-yellow-500/50 text-yellow-400"
              : "hover:bg-white/5 text-white/40 hover:text-white/70"
            }
          `}
          title={step.label}
        >
          <span>{step.icon}</span>
          <span className="text-[9px] uppercase tracking-wider leading-none">{step.label}</span>
        </button>
      ))}
    </nav>
  );
}
