import {
  initialAccounts,
  initialGoals,
  initialTransactions,
  type Account,
  type Alert,
  type SavingsGoal,
  type Transaction,
} from "../data/seed.js";

export interface AgentMemory {
  resolvedInsights: string[];
  weeklyDiningLimit?: number;
  cancelledSubscriptions: string[];
}

const memory: AgentMemory = {
  resolvedInsights: [],
  cancelledSubscriptions: [],
};

let accounts: Account[] = structuredClone(initialAccounts);
let transactions: Transaction[] = structuredClone(initialTransactions);
let goals: SavingsGoal[] = structuredClone(initialGoals);
let alerts: Alert[] = [];

export function getMemory(): AgentMemory {
  return { ...memory, resolvedInsights: [...memory.resolvedInsights], cancelledSubscriptions: [...memory.cancelledSubscriptions] };
}

export function patchMemory(patch: Partial<AgentMemory>) {
  Object.assign(memory, patch);
  if (patch.resolvedInsights) memory.resolvedInsights = patch.resolvedInsights;
  if (patch.cancelledSubscriptions) memory.cancelledSubscriptions = patch.cancelledSubscriptions;
}

export function getAccounts() {
  return accounts.map((a) => ({ ...a }));
}

export function getTransactions(limit = 30) {
  return [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

export function getGoals() {
  return goals.map((g) => ({ ...g }));
}

export function getAlerts() {
  return alerts.filter((a) => !a.dismissed && !memory.resolvedInsights.includes(a.id));
}

export function setAlerts(newAlerts: Alert[]) {
  alerts = newAlerts;
}

export function dismissAlert(id: string) {
  const a = alerts.find((x) => x.id === id);
  if (a) a.dismissed = true;
  if (!memory.resolvedInsights.includes(id)) {
    memory.resolvedInsights.push(id);
  }
}

export function transferMoney(fromId: string, toId: string, amount: number) {
  if (amount <= 0) throw new Error("Amount must be positive");
  const from = accounts.find((a) => a.id === fromId);
  const to = accounts.find((a) => a.id === toId);
  if (!from || !to) throw new Error("Account not found");
  if (from.balance < amount) throw new Error(`Insufficient funds in ${from.name}`);

  from.balance -= amount;
  to.balance += amount;

  const txId = `tx-${Date.now()}`;
  const date = new Date().toISOString().slice(0, 10);
  transactions.unshift(
    {
      id: `${txId}-out`,
      date,
      description: `Transfer to ${to.name}`,
      amount: -amount,
      category: "Transfer",
      accountId: fromId,
    },
    {
      id: `${txId}-in`,
      date,
      description: `Transfer from ${from.name}`,
      amount,
      category: "Transfer",
      accountId: toId,
    }
  );

  return { from: { ...from }, to: { ...to }, amount };
}

export function getSnapshot() {
  return {
    accounts: getAccounts(),
    transactions: getTransactions(20),
    goals: getGoals(),
    alerts: getAlerts(),
    memory: getMemory(),
    upcomingBills: [
      { name: "Rent", amount: 1650, dueDate: "2026-05-30" },
      { name: "Hydro One", amount: 78, dueDate: "2026-06-02" },
    ],
  };
}
