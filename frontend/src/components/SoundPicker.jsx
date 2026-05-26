import { useRef } from "react";

export default function SoundPicker({ label, value, onChange }) {
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange(url, file.name);
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-white/70">{label}</span>
      <div className="flex items-center gap-2">
        {value ? (
          <>
            <span className="text-xs text-green-400">✓ Loaded</span>
            <audio controls src={value} className="h-6 w-32" />
          </>
        ) : (
          <span className="text-xs text-white/30">No file</span>
        )}
        <button
          onClick={() => inputRef.current?.click()}
          className="px-2 py-1 text-xs rounded bg-white/10 hover:bg-white/20"
        >
          Browse
        </button>
        <input ref={inputRef} type="file" accept="audio/*" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
}
