import { useEffect, useRef } from "react";
import { useGameConfig } from "../store/gameConfig";

export default function LivePreview() {
  const { config } = useGameConfig();
  const iframeRef = useRef(null);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "CONFIG_UPDATE", config },
        "*"
      );
    }
  }, [config]);

  const shellUrl = `/game-shells/${config.shell}/index.html?mode=preview`;

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white/60 uppercase tracking-wider">
          Live Preview
        </span>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-xs rounded bg-white/10 hover:bg-white/20">
            📱 Mobile
          </button>
          <button className="px-3 py-1 text-xs rounded bg-white/10 hover:bg-white/20">
            🖥 Desktop
          </button>
        </div>
      </div>

      <div className="flex-1 rounded-xl overflow-hidden border border-white/10 bg-black">
        <iframe
          ref={iframeRef}
          src={shellUrl}
          className="w-full h-full"
          title="Slot Preview"
        />
      </div>

      <div className="flex gap-2">
        <button
          className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg text-sm"
          onClick={() => {
            iframeRef.current?.contentWindow?.postMessage({ type: "TRIGGER_SPIN" }, "*");
          }}
        >
          ▶ Test Spin
        </button>
        <button
          className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-sm"
          onClick={() => {
            iframeRef.current?.contentWindow?.postMessage({ type: "TRIGGER_BIGWIN" }, "*");
          }}
        >
          💥 Test Big Win
        </button>
      </div>
    </div>
  );
}
