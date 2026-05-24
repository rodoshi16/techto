import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, Mic, Send } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { SageActionChip } from "./SageActionChip";
import { TangiIcon } from "../icons/TangiIcon";

function formatMessage(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part.split("\n").map((line, j, arr) => (
      <span key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </span>
    ));
  });
}

export function SageChat() {
  const { messages, sendMessage, closeSage, openSora, loading } = useApp();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const submit = () => {
    const t = input.trim();
    if (!t || loading) return;
    sendMessage(t);
    setInput("");
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-[#faf9f7]">
      <header className="shrink-0 flex items-center gap-3 px-4 pt-12 pb-3 bg-white border-b border-gray-100">
        <button type="button" onClick={closeSage} className="p-1 -ml-1 text-gray-600">
          <ArrowLeft size={24} />
        </button>
        <TangiIcon size={40} />
        <div className="flex-1">
          <h1 className="font-semibold text-gray-900">Tangi</h1>
          <p className="text-xs text-tangerine">Your financial companion</p>
        </div>
        <button
          type="button"
          onClick={openSora}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tangerine/10 text-tangerine text-xs font-medium"
          aria-label="Talk to Tangi"
        >
          <Mic size={14} />
          Voice
        </button>
      </header>

      <div className="flex-1 overflow-y-auto scroll-hide px-4 py-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                m.role === "user"
                  ? "bg-tangerine text-white rounded-br-md"
                  : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md"
              }`}
            >
              {m.role === "sage" && (
                <p className="text-[10px] font-semibold text-tangerine mb-1 uppercase tracking-wide">
                  Tangi
                </p>
              )}
              <div>{formatMessage(m.content)}</div>
              {m.actions && m.actions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {m.actions.map((a) => (
                    <SageActionChip key={a.id} action={a} onClick={() => sendMessage(a.label)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-tangerine text-sm">
            <Loader2 size={16} className="animate-spin" />
            Tangi is checking your accounts...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 p-4 bg-white border-t border-gray-100 pb-8">
        <div className="flex gap-2 items-end">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Message Tangi..."
            disabled={loading}
            className="flex-1 rounded-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-tangerine/30 focus:border-tangerine disabled:opacity-50"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-full bg-tangerine text-white flex items-center justify-center disabled:opacity-40"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
