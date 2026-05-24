import { formatCurrency, savingsGoals } from "../../data/mockData";
import { useApp } from "../../context/AppContext";
import { TangerineHeader } from "../layout/TangerineHeader";

export function GoalsScreen() {
  const { openSage } = useApp();

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#f7f7f7]">
      <TangerineHeader title="Savings Goals" showBack={false} />
      <div className="flex-1 overflow-y-auto scroll-hide px-4 pb-4">
        <p className="text-sm text-gray-600 mb-4">
          Track progress toward what matters. Tangi keeps these on your radar.
        </p>
        <div className="space-y-4">
          {savingsGoals.map((goal) => {
            const pct = Math.round((goal.current / goal.target) * 100);
            const behind = goal.id === "europe" ? 340 : 0;
            return (
              <div key={goal.id} className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{goal.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{goal.name}</p>
                    <p className="text-xs text-gray-500">Target by {goal.deadline}</p>
                  </div>
                  <p className="text-sm font-bold text-tangerine">{pct}%</p>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-tangerine rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{formatCurrency(goal.current)} saved</span>
                  <span className="text-gray-400">of {formatCurrency(goal.target)}</span>
                </div>
                {behind > 0 && (
                  <button
                    type="button"
                    onClick={openSage}
                    className="mt-3 w-full text-left text-xs bg-amber-50 text-amber-800 rounded-lg px-3 py-2 border border-amber-200"
                  >
                    Tangi: You're ${behind} behind this month — tap to see why
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <button
          type="button"
          className="mt-4 w-full py-3 rounded-xl border-2 border-dashed border-tangerine/40 text-tangerine font-medium text-sm"
        >
          + Add a new goal
        </button>
      </div>
    </div>
  );
}
