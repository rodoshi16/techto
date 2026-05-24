import { subscriptions, upcomingBills, USER_NAME } from "../data/seed.js";
import {
  dismissAlert,
  getAccounts,
  getAlerts,
  getGoals,
  getMemory,
  getTransactions,
  setAlerts,
  type Alert,
} from "../store/bankStore.js";

/** Rule-based monitor — in production this runs on Tangerine webhooks / nightly batch */
export function runTransactionScan(): Alert[] {
  const accounts = getAccounts();
  const transactions = getTransactions(30);
  const goals = getGoals();
  const memory = getMemory();
  const chequing = accounts.find((a) => a.id === "chequing")!;
  const rent = upcomingBills.find((b) => b.name === "Rent")!;

  const dining = transactions
    .filter((t) => t.category === "Dining" && t.accountId === "chequing")
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  const rogers = transactions.find((t) => t.description.includes("Rogers"));
  const netflix = transactions.find((t) => t.description.includes("Netflix"));
  const europe = goals.find((g) => g.id === "europe")!;

  const generated: Alert[] = [];

  const afterRent = chequing.balance - rent.amount;
  if (afterRent < 0 && !memory.resolvedInsights.includes("rent-warning")) {
    generated.push({
      id: "rent-warning",
      urgency: 10,
      title: "Rent hits Friday — you're cutting it close",
      detail: `You have $${chequing.balance.toFixed(0)} in chequing but $${rent.amount} rent due Friday. After rent you'd be ~$${Math.abs(afterRent).toFixed(0)} short unless more income lands.`,
      category: "overdraft",
      createdAt: new Date().toISOString(),
      dismissed: false,
    });
  }

  if (rogers && Math.abs(rogers.amount) >= 85 && !memory.resolvedInsights.includes("rogers-increase")) {
    generated.push({
      id: "rogers-increase",
      urgency: 8,
      title: "Rogers bill jumped $12",
      detail: `Your Rogers charge was $${Math.abs(rogers.amount)} this month vs ~$77 last month.`,
      category: "subscription",
      createdAt: new Date().toISOString(),
      dismissed: false,
    });
  }

  const monthlyTarget = 500;
  const savedThisMonth = 160;
  if (monthlyTarget - savedThisMonth >= 300 && !memory.resolvedInsights.includes("europe-behind")) {
    generated.push({
      id: "europe-behind",
      urgency: 7,
      title: "Europe trip goal is $340 behind",
      detail: `You planned $${monthlyTarget}/month toward Europe but only moved $${savedThisMonth}. Dining overspend is the main gap.`,
      category: "goal",
      createdAt: new Date().toISOString(),
      dismissed: false,
    });
  }

  if (netflix && Math.abs(netflix.amount) >= 18 && !memory.cancelledSubscriptions.includes("Netflix")) {
    generated.push({
      id: "netflix-increase",
      urgency: 5,
      title: "Netflix went up $3",
      detail: `Netflix is now $${Math.abs(netflix.amount)}/mo. One of ${subscriptions.length} active subs.`,
      category: "subscription",
      createdAt: new Date().toISOString(),
      dismissed: false,
    });
  }

  if (dining > 200 && !memory.resolvedInsights.includes("dining-spike")) {
    generated.push({
      id: "dining-spike",
      urgency: 6,
      title: "Dining spend is 3× your usual",
      detail: `You've spent $${dining.toFixed(0)} on delivery this month vs ~$80 typical.`,
      category: "spending",
      createdAt: new Date().toISOString(),
      dismissed: false,
    });
  }

  const forgotten = subscriptions.filter((s) => s.status === "forgotten");
  if (forgotten.length && !memory.resolvedInsights.includes("forgotten-sub")) {
    generated.push({
      id: "forgotten-sub",
      urgency: 4,
      title: `${forgotten[0].name} looks unused`,
      detail: `You're paying $${forgotten[0].amount}/mo for ${forgotten[0].name} — flagged as barely used.`,
      category: "subscription",
      createdAt: new Date().toISOString(),
      dismissed: false,
    });
  }

  const merged = [...generated].sort((a, b) => b.urgency - a.urgency);
  setAlerts(merged);
  return getAlerts();
}

export function getScanSummary(): string {
  const alerts = runTransactionScan();
  if (alerts.length === 0) return `All clear for ${USER_NAME} — no urgent flags right now.`;
  const top = alerts.slice(0, 3);
  return top.map((a) => `• ${a.title}: ${a.detail}`).join("\n");
}

export { dismissAlert };
