import { ChevronRight, CreditCard, PiggyBank, Wallet } from "lucide-react";
import { accounts as mockAccounts, formatCurrency, insights, upcomingBills } from "../../data/mockData";
import { useApp } from "../../context/AppContext";
import { TangerineHeader } from "../layout/TangerineHeader";
import { TangiIcon } from "../icons/TangiIcon";
import type { AccountType } from "../../types";

const accountIcons: Record<AccountType, typeof Wallet> = {
  chequing: Wallet,
  savings: PiggyBank,
  credit: CreditCard,
};

export function HomeScreen() {
  const { setScreen, openSage, memory, snapshot } = useApp();
  const accounts = snapshot?.accounts ?? mockAccounts;
  const chequing = accounts.find((a) => a.id === "chequing")!;
  const savings = accounts.find((a) => a.id === "savings");
  const activeInsights = insights.filter((i) => !memory.resolvedInsights.includes(i.id));
  const topInsight = activeInsights.sort((a, b) => b.urgency - a.urgency)[0];

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#f7f7f7]">
      <TangerineHeader light />
      <div className="flex-1 overflow-y-auto scroll-hide -mt-2">
        {/* Tangi insight banner */}
        {topInsight && (
          <button
            type="button"
            onClick={openSage}
            className="mx-4 mb-4 w-[calc(100%-2rem)] text-left bg-tangerine-light border border-tangerine/25 rounded-2xl p-4 active:scale-[0.99] transition-transform"
          >
            <div className="flex items-start gap-3">
              <TangiIcon size={40} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-tangerine uppercase tracking-wide mb-1">
                  Tangi noticed
                </p>
                <p className="text-sm font-medium text-gray-900 leading-snug">{topInsight.title}</p>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{topInsight.detail}</p>
              </div>
              <ChevronRight size={18} className="text-tangerine shrink-0 mt-1" />
            </div>
          </button>
        )}

        {/* Total balance card */}
        <div className="mx-4 bg-white rounded-2xl shadow-sm p-5 mb-4">
          <p className="text-sm text-gray-500 mb-1">Total available</p>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">
            {formatCurrency(chequing.balance + (savings?.balance ?? 0))}
          </p>
        </div>

        {/* Accounts */}
        <div className="px-4 mb-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">My Accounts</h2>
          <div className="space-y-2">
            {accounts.map((account) => {
              const Icon = accountIcons[account.type as AccountType];
              const screenId =
                account.type === "chequing"
                  ? "chequing"
                  : account.type === "savings"
                    ? "savings"
                    : "credit";
              return (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => setScreen(screenId)}
                  className="w-full flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm active:bg-gray-50 transition-colors"
                >
                  <div className="w-11 h-11 rounded-full bg-tangerine-light flex items-center justify-center">
                    <Icon size={20} className="text-tangerine" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{account.name}</p>
                    <p className="text-xs text-gray-500">{account.accountNumber}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={`font-semibold text-sm ${account.type === "credit" ? "text-gray-900" : "text-gray-900"}`}
                    >
                      {account.type === "credit" ? "−" : ""}
                      {formatCurrency(account.balance)}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Upcoming */}
        <div className="px-4 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Coming up</h2>
          <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
            {upcomingBills.map((bill) => (
              <div key={bill.name} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{bill.name}</p>
                  <p className="text-xs text-gray-500">{bill.date}</p>
                </div>
                <p className="text-sm font-semibold text-red-600">−{formatCurrency(bill.amount)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="px-4 pb-4 grid grid-cols-2 gap-2">
          {["e-Transfer", "Pay Bills", "Deposit", "Find ABM"].map((action) => (
            <button
              key={action}
              type="button"
              className="bg-white rounded-xl py-3 px-4 text-sm font-medium text-tangerine shadow-sm border border-tangerine/10"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
