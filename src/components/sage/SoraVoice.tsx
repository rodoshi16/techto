import { useCallback, useEffect, useState } from "react";
import { Mic, MicOff, X } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { USER_NAME } from "../../data/mockData";
import { playAudioBlob, speakWithSora } from "../../lib/api";

const TRANSFER_AMOUNT = 200;
const FROM_ACCOUNT = "chequing";
const TO_ACCOUNT = "savings";

const TANGI_SUGGESTION = `Hey ${USER_NAME} — you're $340 behind on your Europe trip goal. I'd move $${TRANSFER_AMOUNT} from Everyday Chequing to Savings today. You'll still have enough buffer before rent Friday. Want me to do that?`;

type Phase = "speaking" | "awaiting" | "listening" | "processing" | "done";

function isApproval(text: string): boolean {
  const t = text.toLowerCase();
  return /\b(yes|yeah|yep|sure|ok|okay|do it|go ahead|please|sounds good|move it)\b/.test(t);
}

function isDecline(text: string): boolean {
  const t = text.toLowerCase();
  return /\b(no|nah|not now|later|cancel|skip|don't)\b/.test(t);
}

export function SoraVoice() {
  const { closeSora, openSage, transferFunds } = useApp();
  const [phase, setPhase] = useState<Phase>("speaking");
  const [transcript, setTranscript] = useState("");
  const [tangiLine, setTangiLine] = useState(TANGI_SUGGESTION);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const blob = await speakWithSora(TANGI_SUGGESTION);
        if (!cancelled) await playAudioBlob(blob);
      } catch {
        if ("speechSynthesis" in window) {
          const u = new SpeechSynthesisUtterance(TANGI_SUGGESTION);
          u.lang = "en-CA";
          await new Promise<void>((res) => {
            u.onend = () => res();
            speechSynthesis.speak(u);
          });
        }
      }
      if (!cancelled) setPhase("awaiting");
    };

    const fallback = setTimeout(() => {
      if (!cancelled) setPhase("awaiting");
    }, 4500);

    run().finally(() => clearTimeout(fallback));
    return () => {
      cancelled = true;
      clearTimeout(fallback);
    };
  }, []);

  const approveTransfer = useCallback(async () => {
    setPhase("processing");
    setTranscript("Yes, move it");
    const { ok, message } = await transferFunds(FROM_ACCOUNT, TO_ACCOUNT, TRANSFER_AMOUNT);
    setTangiLine(ok ? message : message);
    setPhase("done");
  }, [transferFunds]);

  const handleDecline = () => {
    setTranscript("Not right now");
    setTangiLine("No problem — I'll check in again next week. Your Europe goal is still on my radar.");
    setPhase("done");
  };

  const toggleListen = () => {
    if (listening) return;

    const w = window as Window & {
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
      SpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      setTranscript("Yes, move it");
      approveTransfer();
      return;
    }

    const rec = new Ctor();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-CA";
    setListening(true);
    setPhase("listening");

    rec.onresult = (e: SpeechRecognitionEvent) => {
      const said = e.results[0][0].transcript;
      setTranscript(said);
      setListening(false);
      if (isApproval(said)) approveTransfer();
      else if (isDecline(said)) handleDecline();
      else {
        setTangiLine("Sorry, I didn't catch that — say yes to move the money, or no to skip.");
        setPhase("awaiting");
      }
    };
    rec.onerror = () => {
      setListening(false);
      setPhase("awaiting");
    };
    rec.onend = () => setListening(false);
    rec.start();
  };

  const speaking = phase === "speaking";
  const showUser = phase === "awaiting" || phase === "listening" || phase === "processing" || phase === "done";

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-gradient-to-b from-tangerine to-tangerine-dark text-white">
      <header className="flex items-center justify-between px-4 pt-12 pb-4">
        <div>
          <p className="text-xs text-white/70 uppercase tracking-widest">Voice</p>
          <h1 className="text-xl font-semibold">Tangi</h1>
          <p className="text-xs text-white/80">Powered by ElevenLabs</p>
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
            listening || speaking || phase === "processing" ? "bg-white/20" : "bg-white/10"
          }`}
        >
          {(speaking || listening || phase === "processing") && (
            <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping" />
          )}
          <div className="flex items-end gap-1 h-8">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-1 bg-white rounded-full voice-bar ${
                  speaking || listening || phase === "processing" ? "" : "opacity-40"
                }`}
                style={{
                  height: speaking || listening || phase === "processing" ? undefined : 8,
                }}
              />
            ))}
          </div>
        </div>

        {speaking || phase === "processing" || phase === "done" ? (
          <p className="text-center text-white/90 text-sm leading-relaxed max-w-[280px]">
            {phase === "processing" ? "Moving your money now..." : tangiLine}
          </p>
        ) : (
          <div className="text-center w-full max-w-[300px] space-y-4">
            <p className="text-center text-white/80 text-sm leading-relaxed">{TANGI_SUGGESTION}</p>
            {showUser && (
              <>
                <div>
                  <p className="text-xs text-white/50 mb-2">You said</p>
                  <p className="text-lg font-medium">{transcript || "..."}</p>
                </div>
                {phase === "awaiting" && (
                  <div className="flex flex-col gap-2 w-full">
                    <button
                      type="button"
                      onClick={approveTransfer}
                      className="w-full py-3 rounded-full bg-white text-[#1b4332] font-semibold text-sm"
                    >
                      Yes, move ${TRANSFER_AMOUNT}
                    </button>
                    <button
                      type="button"
                      onClick={handleDecline}
                      className="w-full py-3 rounded-full bg-white/10 text-white font-medium text-sm border border-white/20"
                    >
                      Not now
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="p-8 flex flex-col items-center gap-4 pb-12">
        {phase !== "done" && (
          <>
            <button
              type="button"
              onClick={toggleListen}
              disabled={phase === "processing" || speaking}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all disabled:opacity-40 ${
                listening ? "bg-red-500 scale-110" : "bg-white text-tangerine-dark"
              }`}
            >
              {listening ? <MicOff size={28} /> : <Mic size={28} />}
            </button>
            <p className="text-sm text-white/70">
              {listening
                ? "Listening..."
                : speaking
                  ? "Tangi is speaking"
                  : phase === "processing"
                    ? "Working on it..."
                    : "Tap to say yes or no"}
            </p>
          </>
        )}
        {phase === "done" && (
          <button
            type="button"
            onClick={() => {
              openSage();
              closeSora();
            }}
            className="text-sm text-white/80 underline"
          >
            Continue with Tangi
          </button>
        )}
      </div>
    </div>
  );
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}
