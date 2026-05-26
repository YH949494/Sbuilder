import { useGameConfig } from "./store/gameConfig";
import StepNav      from "./components/StepNav";
import LivePreview  from "./components/LivePreview";
import Dashboard    from "./pages/Dashboard";
import ShellPicker  from "./pages/ShellPicker";
import ThemeStudio  from "./pages/ThemeStudio";
import SymbolStudio from "./pages/SymbolStudio";
import WinEffects   from "./pages/WinEffects";
import SoundStudio  from "./pages/SoundStudio";
import Branding     from "./pages/Branding";
import ExportPage   from "./pages/ExportPage";
import api          from "./api/client";

const STEPS = [
  { id: 1, label: "Shell",    icon: "🎰", component: ShellPicker  },
  { id: 2, label: "Theme",    icon: "🎨", component: ThemeStudio  },
  { id: 3, label: "Symbols",  icon: "✨", component: SymbolStudio },
  { id: 4, label: "Effects",  icon: "💥", component: WinEffects   },
  { id: 5, label: "Sound",    icon: "🔊", component: SoundStudio  },
  { id: 6, label: "Branding", icon: "🏷️", component: Branding     },
  { id: 7, label: "Export",   icon: "📦", component: ExportPage   },
];

async function autoSave(config) {
  if (!config.game_id) return;
  try {
    await api.post("/api/config/save", config);
  } catch { /* silent */ }
}

export default function App() {
  const { currentStep, setStep, showDashboard, config } = useGameConfig();

  if (showDashboard) return <Dashboard />;

  const ActivePage = STEPS.find(s => s.id === currentStep)?.component;

  const handleStepChange = (step) => {
    autoSave(config);
    if (step === 0) setStep(0);
    else setStep(step);
  };

  return (
    <div className="flex h-screen bg-[#0a0a14] text-white overflow-hidden">
      {/* Left: Step Navigation */}
      <StepNav steps={STEPS} current={currentStep} onSelect={handleStepChange} />

      {/* Center: Active Step Panel */}
      <main className="flex-1 overflow-y-auto p-6 border-r border-white/10">
        {/* Top bar with game title + back to dashboard */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
          <button
            onClick={() => handleStepChange(0)}
            className="text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            ← Dashboard
          </button>
          <span className="text-xs text-white/20 truncate max-w-xs">
            {config.game_title}
          </span>
          <button
            onClick={() => autoSave(config)}
            className="text-xs text-white/30 hover:text-yellow-400 transition-colors"
          >
            Save ↑
          </button>
        </div>

        {ActivePage && <ActivePage />}
      </main>

      {/* Right: Live Preview */}
      <aside className="w-[420px] flex flex-col p-4 gap-4">
        <LivePreview />
      </aside>
    </div>
  );
}
