import { useCallback, useEffect, useRef, useState } from "react";

type SpeechCtor = new () => {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export function useSpeechRecognition() {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<InstanceType<SpeechCtor> | null>(null);

  useEffect(() => {
    const w = window as Window & { webkitSpeechRecognition?: SpeechCtor; SpeechRecognition?: SpeechCtor };
    setSupported(Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition));
  }, []);

  const listen = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      const w = window as Window & { webkitSpeechRecognition?: SpeechCtor; SpeechRecognition?: SpeechCtor };
      const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
      if (!Ctor) {
        reject(new Error("Speech recognition not supported — use Chrome"));
        return;
      }

      const rec = new Ctor();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-CA";
      recRef.current = rec;

      rec.onresult = (e) => {
        const t = e.results[0][0].transcript;
        setListening(false);
        resolve(t);
      };
      rec.onerror = (e) => {
        setListening(false);
        reject(new Error(e.error));
      };
      rec.onend = () => setListening(false);

      setListening(true);
      rec.start();
    });
  }, []);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  return { supported, listening, listen, stop };
}
