export type AccountType = "chequing" | "savings" | "credit";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  accountId: string;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  accountNumber: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  icon: string;
}

export interface Insight {
  id: string;
  urgency: number;
  title: string;
  detail: string;
  category: "overdraft" | "subscription" | "goal" | "bill" | "spending";
}

export interface ChatMessage {
  id: string;
  role: "sage" | "user";
  content: string;
  timestamp: Date;
  actions?: SageAction[];
}

export interface SageAction {
  id: string;
  label: string;
  type: "primary" | "secondary";
}

export type Screen =
  | "home"
  | "chequing"
  | "savings"
  | "goals"
  | "credit"
  | "move-money"
  | "more"
  | "sage"
  | "sora-voice";

export interface SageMemory {
  resolvedInsights: string[];
  weeklyDiningLimit?: number;
  cancelledSubscriptions: string[];
}
