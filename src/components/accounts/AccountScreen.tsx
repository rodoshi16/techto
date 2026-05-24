import { ChevronRight } from "lucide-react";
import { accounts, formatCurrency, transactions } from "../../data/mockData";
import { useApp } from "../../context/AppContext";
import { TangerineHeader } from "../layout/TangerineHeader";
import type { AccountType } from "../../types";

interface AccountScreenProps {
  type: AccountType;
}

export function AccountScreen({ type }: AccountScreenProps) {
  const { setScreen } = useApp();
  const account = accounts.find((a) => a.type === type)!;
  const accountTx = transactions.filter((t) => t.accountId === account.id);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#f7f7f7]">
      <TangerineHeader
        title={account.name}
        showBack
        onBack={() => setScreen("home")}
        light={type !== "credit"}
      />
      <div className="flex-1 overflow-y-auto scroll-hide">
        <div
          className={`px-4 pb-6 ${type === "credit" ? "bg-white" : "bg-tangerine text-white -mt-1 pt-2"}`}
        >
          <p className={`text-sm ${type === "credit" ? "text-gray-500" : "text-white/80"}`}>
            {type === "credit" ? "Current balance" : "Available balance"}
          </p>
          <p
            className={`text-4xl font-bold tracking-tight mt-1 ${type === "credit" ? "text-gray-900" : ""}`}
          >
            {type === "credit" ? "−" : ""}
            {formatCurrency(account.balance)}
          </p>
          <p className={`text-xs mt-2 ${type === "credit" ? "text-gray-400" : "text-white/70"}`}>
            {account.accountNumber}
          </p>
        </div>

        {type === "savings" && (
          <div className="mx-4 -mt-2 mb-4 bg-white rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Interest rate</span>
              <span className="text-sm font-semibold text-tangerine">4.00%</span>
            </div>
            <button
              type="button"
              onClick={() => setScreen("goals")}
              className="w-full flex items-center justify-between text-sm text-tangerine font-medium pt-2 border-t border-gray-100"
            >
              View Savings Goals
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        <div className="px-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Recent transactions</h2>
          <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
            {accountTx.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">No recent transactions</p>
            ) : (
              accountTx.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                    {tx.description.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{tx.description}</p>
                    <p className="text-xs text-gray-500">
                      {tx.date} · {tx.category}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-semibold shrink-0 ${tx.amount > 0 ? "text-green-600" : "text-gray-900"}`}
                  >
                    {tx.amount > 0 ? "+" : "−"}
                    {formatCurrency(tx.amount)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
