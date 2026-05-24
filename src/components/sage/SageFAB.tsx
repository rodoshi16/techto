import { useApp } from "../../context/AppContext";
import { OrangeIcon } from "../icons/OrangeIcon";

export function SageFAB() {
  const { sageOpen, openSage } = useApp();

  if (sageOpen) return null;

  return (
    <button
      type="button"
      onClick={openSage}
      className="absolute bottom-24 right-4 z-30 tangi-pulse flex items-center gap-2 pl-3 pr-5 py-3 rounded-full bg-tangerine text-white shadow-lg shadow-tangerine/35 active:scale-95 transition-transform"
    >
      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
        <OrangeIcon className="w-4 h-4 text-white" />
      </div>
      <span className="font-semibold text-sm">Ask Tangi</span>
    </button>
  );
}
