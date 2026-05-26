export default function StepNav({ steps, current, onSelect }) {
  return (
    <nav className="w-20 flex flex-col items-center py-6 gap-2 border-r border-white/10 bg-black/30">
      <div className="text-xs font-bold text-yellow-400 mb-4 tracking-widest" style={{ writingMode: "vertical-rl" }}>
        SLOTFORGE
      </div>
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
          <span className="text-[9px] uppercase tracking-wider">{step.label}</span>
        </button>
      ))}
    </nav>
  );
}
