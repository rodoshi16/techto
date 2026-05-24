import { useEffect, useState } from "react";
import { Mic, MicOff, X } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { USER_NAME } from "../../data/mockData";

const SORA_SCRIPT = `Hey ${USER_NAME}. Quick voice check-in — your Rogers bill jumped twelve dollars, you're three forty behind on Europe, and rent hits Friday. Want me to walk through the dining spend?`;

export function SoraVoice() {
  const { closeSora, openSage } = useApp();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [speaking, setSpeaking] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setSpeaking(false);
      setTranscript("Tell me about my spending this month");
    }, 3500);
    return () => clearTimeout(t);
  }, []);

  const toggleListen = () => {
    setListening((l) => !l);
    if (!listening) {
      setTimeout(() => {
        setListening(false);
        openSage();
        closeSora();
      }, 2000);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-gradient-to-b from-[#1b4332] to-[#081c15] text-white">
      <header className="flex items-center justify-between px-4 pt-12 pb-4">
        <div>
          <p className="text-xs text-white/60 uppercase tracking-widest">Voice</p>
          <h1 className="text-xl font-semibold">Sora</h1>
          <p className="text-xs text-white/70">Powered by ElevenLabs</p>
        </div>
        <button
          type="button"
          onClick={closeSora}
          className="p-2 rounded-full bg-white/10"
          aria-label="Close"
        >
          <X size={22} />
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div
          className={`relative w-32 h-32 rounded-full flex items-center justify-center mb-8 ${
            listening ? "bg-white/20" : "bg-white/10"
          }`}
        >
          {speaking && (
            <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping" />
          )}
          <div className="flex items-end gap-1 h-8">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-1 bg-white rounded-full voice-bar ${speaking || listening ? "" : "h-2!"}`}
                style={{ height: speaking || listening ? undefined : 8 }}
              />
            ))}
          </div>
        </div>

        {speaking ? (
          <p className="text-center text-white/90 text-sm leading-relaxed max-w-[280px]">
            {SORA_SCRIPT}
          </p>
        ) : (
          <div className="text-center w-full max-w-[300px]">
            <p className="text-xs text-white/50 mb-2">You said</p>
            <p className="text-lg font-medium">{transcript || "..."}</p>
          </div>
        )}

        <p className="mt-8 text-xs text-white/40 text-center max-w-[260px]">
          Demo mode — connect ElevenLabs API key for live voice. Sage continues in chat.
        </p>
      </div>

      <div className="p-8 flex flex-col items-center gap-4 pb-12">
        <button
          type="button"
          onClick={toggleListen}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
            listening ? "bg-red-500 scale-110" : "bg-white text-[#1b4332]"
          }`}
        >
          {listening ? <MicOff size={28} /> : <Mic size={28} />}
        </button>
        <p className="text-sm text-white/70">
          {listening ? "Listening..." : speaking ? "Sora is speaking" : "Tap to speak"}
        </p>
        <button
          type="button"
          onClick={() => {
            openSage();
            closeSora();
          }}
          className="text-sm text-white/80 underline"
        >
          Continue in chat with Sage
        </button>
      </div>
    </div>
  );
}
