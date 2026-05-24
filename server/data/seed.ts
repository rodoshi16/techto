export const USER_NAME = "Jordan";

export interface Account {
  id: string;
  name: string;
  type: "chequing" | "savings" | "credit";
  balance: number;
  accountNumber: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  accountId: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
}

export interface Alert {
  id: string;
  urgency: number;
  title: string;
  detail: string;
  category: string;
  createdAt: string;
  dismissed: boolean;
}

export const initialAccounts: Account[] = [
  { id: "chequing", name: "Everyday Chequing", type: "chequing", balance: 847.32, accountNumber: "****4821" },
  { id: "savings", name: "Savings Account", type: "savings", balance: 2340.5, accountNumber: "****9103" },
  { id: "credit", name: "Money-Back Credit Card", type: "credit", balance: -1247.89, accountNumber: "****3376" },
];

export const initialGoals: SavingsGoal[] = [
  { id: "europe", name: "Europe Trip", target: 3000, current: 1660, deadline: "Jun 2026" },
  { id: "emergency", name: "Emergency Fund", target: 5000, current: 2340, deadline: "Dec 2026" },
];

export const initialTransactions: Transaction[] = [
  { id: "t1", date: "2026-05-22", description: "Uber Eats", amount: -34.5, category: "Dining", accountId: "chequing" },
  { id: "t2", date: "2026-05-21", description: "Rogers Wireless", amount: -89.0, category: "Bills", accountId: "chequing" },
  { id: "t3", date: "2026-05-20", description: "Netflix", amount: -18.99, category: "Subscriptions", accountId: "chequing" },
  { id: "t4", date: "2026-05-19", description: "Uber Eats", amount: -28.75, category: "Dining", accountId: "chequing" },
  { id: "t5", date: "2026-05-18", description: "Payroll Deposit", amount: 2450.0, category: "Income", accountId: "chequing" },
  { id: "t6", date: "2026-05-17", description: "Spotify", amount: -11.99, category: "Subscriptions", accountId: "chequing" },
  { id: "t7", date: "2026-05-16", description: "DoorDash", amount: -42.3, category: "Dining", accountId: "chequing" },
  { id: "t8", date: "2026-05-15", description: "Uber Eats", amount: -31.2, category: "Dining", accountId: "chequing" },
  { id: "t9", date: "2026-05-14", description: "Transfer to Savings", amount: -200.0, category: "Transfer", accountId: "chequing" },
  { id: "t10", date: "2026-05-12", description: "Amazon Prime", amount: -11.49, category: "Subscriptions", accountId: "chequing" },
];

export const subscriptions = [
  { name: "Netflix", amount: 18.99, status: "active" },
  { name: "Spotify", amount: 11.99, status: "active" },
  { name: "Amazon Prime", amount: 11.49, status: "active" },
  { name: "Disney+", amount: 11.99, status: "forgotten" },
];

export const upcomingBills = [
  { name: "Rent", amount: 1650, dueDate: "2026-05-30" },
  { name: "Hydro One", amount: 78, dueDate: "2026-06-02" },
];
