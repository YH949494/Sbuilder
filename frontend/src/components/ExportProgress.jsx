export default function ExportProgress({ progress, status }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-white/60">
        <span>{status}</span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-500 transition-all duration-300 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
