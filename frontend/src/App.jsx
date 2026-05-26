import { useGameConfig } from "./store/gameConfig";
import StepNav from "./components/StepNav";
import LivePreview from "./components/LivePreview";
import ShellPicker from "./pages/ShellPicker";
import ThemeStudio from "./pages/ThemeStudio";
import SymbolStudio from "./pages/SymbolStudio";
import WinEffects from "./pages/WinEffects";
import SoundStudio from "./pages/SoundStudio";
import Branding from "./pages/Branding";
import ExportPage from "./pages/ExportPage";

const STEPS = [
  { id: 1, label: "Shell",    icon: "🎰", component: ShellPicker },
  { id: 2, label: "Theme",    icon: "🎨", component: ThemeStudio },
  { id: 3, label: "Symbols",  icon: "✨", component: SymbolStudio },
  { id: 4, label: "Effects",  icon: "💥", component: WinEffects },
  { id: 5, label: "Sound",    icon: "🔊", component: SoundStudio },
  { id: 6, label: "Branding", icon: "🏷️", component: Branding },
  { id: 7, label: "Export",   icon: "📦", component: ExportPage }
];

export default function App() {
  const { currentStep, setStep } = useGameConfig();
  const ActivePage = STEPS.find(s => s.id === currentStep)?.component;

  return (
    <div className="flex h-screen bg-[#0a0a14] text-white overflow-hidden">
      <StepNav steps={STEPS} current={currentStep} onSelect={setStep} />

      <main className="flex-1 overflow-y-auto p-6 border-r border-white/10">
        {ActivePage && <ActivePage />}
      </main>

      <aside className="w-[420px] flex flex-col p-4 gap-4">
        <LivePreview />
      </aside>
    </div>
  );
}
