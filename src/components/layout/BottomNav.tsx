import { Home, Menu, Package, Send } from "lucide-react";
import { useApp } from "../../context/AppContext";
import type { Screen } from "../../types";

const tabs: { id: Screen; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Overview", icon: Home },
  { id: "move-money", label: "Move Money", icon: Send },
  { id: "goals", label: "Goals", icon: Package },
  { id: "more", label: "More", icon: Menu },
];

export function BottomNav() {
  const { screen, setScreen, sageOpen } = useApp();

  if (sageOpen) return null;

  return (
    <nav className="shrink-0 border-t border-gray-200 bg-white px-2 pb-6 pt-2 safe-area-bottom">
      <div className="flex justify-around">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = screen === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setScreen(id)}
              className="flex flex-col items-center gap-0.5 min-w-[72px] py-1"
            >
              <Icon
                size={22}
                className={active ? "text-tangerine" : "text-gray-400"}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className={`text-[10px] font-medium ${active ? "text-tangerine" : "text-gray-500"}`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
