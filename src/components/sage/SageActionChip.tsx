import type { SageAction } from "../../types";

interface SageActionChipProps {
  action: SageAction;
  onClick: () => void;
}

export function SageActionChip({ action, onClick }: SageActionChipProps) {
  const primary = action.type === "primary";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
        primary
          ? "bg-tangerine text-white"
          : "bg-gray-100 text-gray-700 border border-gray-200"
      }`}
    >
      {action.label}
    </button>
  );
}
