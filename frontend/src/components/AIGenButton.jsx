import { useState } from "react";

/**
 * Reusable AI generation input + button.
 * Props:
 *   onGenerate(prompt) → Promise   called when user submits
 *   placeholder        string
 *   disabled           bool
 *   className          string      extra classes for container
 */
export default function AIGenButton({ onGenerate, placeholder = "Describe…", disabled = false, className = "" }) {
  const [prompt, setPrompt]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const handleSubmit = async () => {
    if (!prompt.trim() || loading || disabled) return;
    setLoading(true);
    setError(null);
    try {
      await onGenerate(prompt.trim());
      setPrompt("");
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder={placeholder}
          disabled={loading || disabled}
          className="flex-1 text-xs bg-black/40 border border-white/10 rounded-lg
                     px-3 py-2 text-white placeholder:text-white/20 outline-none
                     focus:border-yellow-500/50 disabled:opacity-40"
        />
        <button
          onClick={handleSubmit}
          disabled={loading || disabled || !prompt.trim()}
          className="px-3 py-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40
                     text-black text-xs font-bold rounded-lg whitespace-nowrap
                     transition-colors"
        >
          {loading
            ? <span className="inline-block animate-spin">⟳</span>
            : "✨ Gen"}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}
