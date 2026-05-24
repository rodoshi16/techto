import type { Account, Insight, SavingsGoal, Transaction } from "../types";

export const USER_NAME = "Jordan";

export const accounts: Account[] = [
  {
    id: "chequing",
    name: "Everyday Chequing",
    type: "chequing",
    balance: 847.32,
    accountNumber: "****4821",
  },
  {
    id: "savings",
    name: "Savings Account",
    type: "savings",
    balance: 2340.5,
    accountNumber: "****9103",
  },
  {
    id: "credit",
    name: "Money-Back Credit Card",
    type: "credit",
    balance: -1247.89,
    accountNumber: "****3376",
  },
];

export const savingsGoals: SavingsGoal[] = [
  {
    id: "europe",
    name: "Europe Trip",
    target: 3000,
    current: 1660,
    deadline: "Jun 2026",
    icon: "✈️",
  },
  {
    id: "emergency",
    name: "Emergency Fund",
    target: 5000,
    current: 2340,
    deadline: "Dec 2026",
    icon: "🛡️",
  },
];

export const transactions: Transaction[] = [
  { id: "t1", date: "May 22", description: "Uber Eats", amount: -34.5, category: "Dining", accountId: "chequing" },
  { id: "t2", date: "May 21", description: "Rogers Wireless", amount: -89.0, category: "Bills", accountId: "chequing" },
  { id: "t3", date: "May 20", description: "Netflix", amount: -18.99, category: "Subscriptions", accountId: "chequing" },
  { id: "t4", date: "May 19", description: "Uber Eats", amount: -28.75, category: "Dining", accountId: "chequing" },
  { id: "t5", date: "May 18", description: "Payroll Deposit", amount: 2450.0, category: "Income", accountId: "chequing" },
  { id: "t6", date: "May 17", description: "Spotify", amount: -11.99, category: "Subscriptions", accountId: "chequing" },
  { id: "t7", date: "May 16", description: "DoorDash", amount: -42.3, category: "Dining", accountId: "chequing" },
  { id: "t8", date: "May 15", description: "Uber Eats", amount: -31.2, category: "Dining", accountId: "chequing" },
  { id: "t9", date: "May 14", description: "Transfer to Savings", amount: -200.0, category: "Transfer", accountId: "chequing" },
  { id: "t10", date: "May 12", description: "Amazon Prime", amount: -11.49, category: "Subscriptions", accountId: "chequing" },
  { id: "s1", date: "May 14", description: "Transfer from Chequing", amount: 200.0, category: "Transfer", accountId: "savings" },
  { id: "s2", date: "May 1", description: "Interest", amount: 4.12, category: "Interest", accountId: "savings" },
];

export const upcomingBills = [
  { name: "Rent", amount: 1650, date: "Friday, May 30" },
  { name: "Hydro One", amount: 78, date: "Jun 2" },
];

export const insights: Insight[] = [
  {
    id: "rent-warning",
    urgency: 10,
    title: "Rent hits Friday — you're cutting it close",
    detail: "You have $847 in chequing but $1,650 rent due Friday. After rent you'd be ~$803 short unless more income lands.",
    category: "overdraft",
  },
  {
    id: "rogers-increase",
    urgency: 8,
    title: "Rogers bill jumped $12",
    detail: "Your Rogers charge was $89 this month vs $77 last month — first increase in a year.",
    category: "subscription",
  },
  {
    id: "europe-behind",
    urgency: 7,
    title: "Europe trip goal is $340 behind",
    detail: "You planned $500/month toward Europe but only moved $160 this month. Dining overspend is the main gap.",
    category: "goal",
  },
  {
    id: "netflix-increase",
    urgency: 5,
    title: "Netflix went up $3",
    detail: "Netflix is now $18.99/mo (was $15.99). Small, but it's one of 4 active subscriptions totalling $54/mo.",
    category: "subscription",
  },
  {
    id: "dining-spike",
    urgency: 6,
    title: "Dining spend is 3× your usual",
    detail: "You've spent $247 on delivery this month vs ~$80 typical. Three Uber Eats weeks account for most of it.",
    category: "spending",
  },
];

export const subscriptions = [
  { name: "Netflix", amount: 18.99, status: "active" as const },
  { name: "Spotify", amount: 11.99, status: "active" as const },
  { name: "Amazon Prime", amount: 11.49, status: "active" as const },
  { name: "Disney+", amount: 11.99, status: "forgotten" as const },
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(Math.abs(amount));
}
