import { Sparkles } from "lucide-react";
import { useApp } from "../../context/AppContext";

export function SageFAB() {
  const { sageOpen, openSage } = useApp();

  if (sageOpen) return null;

  return (
    <button
      type="button"
      onClick={openSage}
      className="absolute bottom-24 right-4 z-30 sage-pulse flex items-center gap-2 pl-4 pr-5 py-3 rounded-full bg-sage text-white shadow-lg shadow-sage/30 active:scale-95 transition-transform"
    >
      <div className="relative w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
        <Sparkles size={16} />
      </div>
      <span className="font-semibold text-sm">Ask Sage</span>
    </button>
  );
}
