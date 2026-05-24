import { insights, subscriptions, transactions, USER_NAME } from "../data/mockData";
import type { ChatMessage, SageAction, SageMemory } from "../types";

let messageCounter = 0;

function msg(role: "sage" | "user", content: string, actions?: SageAction[]): ChatMessage {
  return {
    id: `m-${++messageCounter}`,
    role,
    content,
    timestamp: new Date(),
    actions,
  };
}

export function buildProactiveBriefing(memory: SageMemory): ChatMessage {
  const active = insights
    .filter((i) => !memory.resolvedInsights.includes(i.id))
    .sort((a, b) => b.urgency - a.urgency);

  const top = active.slice(0, 2);
  const lines = top.map((i) => `• ${i.title}`).join("\n");

  const greeting = `Hey ${USER_NAME} 👋 I ran your 30-day scan. Here's what stood out:\n\n${lines}`;

  const followUp =
    top.length > 1
      ? "\n\nYour Rogers bump and Europe goal gap are probably connected — want me to break down where the extra spend went?"
      : "\n\nWant to dig into any of these?";

  return msg("sage", greeting + followUp, [
    { id: "breakdown", label: "Yeah, show me", type: "primary" },
    { id: "rent-only", label: "Just the rent warning", type: "secondary" },
    { id: "later", label: "I'm good for now", type: "secondary" },
  ]);
}

export function respondToUser(
  input: string,
  memory: SageMemory,
  onMemoryUpdate?: (patch: Partial<SageMemory>) => void
): ChatMessage {
  const text = input.toLowerCase().trim();

  if (text.includes("cancel") && (text.includes("netflix") || text.includes("subscription"))) {
    onMemoryUpdate?.({
      cancelledSubscriptions: [...memory.cancelledSubscriptions, "Netflix"],
      resolvedInsights: [...memory.resolvedInsights, "netflix-increase"],
    });
    return msg(
      "sage",
      "Got it — I'll mark Netflix as cancelled and won't flag it again. That saves you ~$19/mo. Want me to scan for other subscriptions you might've forgotten?",
      [
        { id: "scan-subs", label: "Scan my subscriptions", type: "primary" },
        { id: "no-thanks", label: "Nope, all good", type: "secondary" },
      ]
    );
  }

  if (text.includes("60") || text.includes("limit") || text.includes("weekly")) {
    onMemoryUpdate?.({ weeklyDiningLimit: 60 });
    return msg(
      "sage",
      "Done ✅ Soft limit set: **$60/week on dining & delivery**. I'll check in next Tuesday and nudge you if you're trending over. Europe goal should get back on track if you stick to it.",
      [{ id: "thanks", label: "Thanks, Tangi", type: "primary" }]
    );
  }

  if (
    text.includes("yeah") ||
    text.includes("yes") ||
    text.includes("show") ||
    text.includes("break") ||
    text.includes("dig")
  ) {
    const dining = transactions
      .filter((t) => t.category === "Dining" && t.accountId === "chequing")
      .reduce((s, t) => s + Math.abs(t.amount), 0);

    return msg(
      "sage",
      `Here's October's picture (well, May 😄):\n\n**Dining & delivery: $${dining.toFixed(0)}** — that's ~3× your usual $80.\n\n• Uber Eats: 4 orders ($125)\n• DoorDash: 1 order ($42)\n\nThat gap lines up almost exactly with your **$340 Europe goal shortfall**. Rogers (+$12) is separate.\n\nWant a soft **$60/week dining cap**? I can watch it for you.`,
      [
        { id: "set-limit", label: "Set $60/week limit", type: "primary" },
        { id: "what-if", label: "What if I cut DoorDash?", type: "secondary" },
      ]
    );
  }

  if (text.includes("door") || text.includes("what if") || text.includes("cut")) {
    return msg(
      "sage",
      "If you drop DoorDash entirely:\n\n• Save **~$42/month**\n• Europe goal catches up in **~8 weeks** instead of 14\n• Chequing buffer before rent improves by **$42**\n\nNot huge alone, but combined with the $60 weekly cap you'd be in solid shape.",
      [{ id: "set-limit", label: "Set the $60 cap", type: "primary" }]
    );
  }

  if (text.includes("rent") || text.includes("friday") || text.includes("bill")) {
    return msg(
      "sage",
      "Rent ($1,650) hits **Friday**. You've got **$847** in chequing right now.\n\nAfter rent you'd be **~$803 short** unless payroll or a transfer lands. I'd move $200 from savings now if you can spare it — you still have $2,340 there and it avoids overdraft stress.",
      [
        { id: "transfer", label: "Move $200 from savings", type: "primary" },
        { id: "remind", label: "Remind me Thursday", type: "secondary" },
      ]
    );
  }

  if (text.includes("subscription") || text.includes("scan")) {
    const active = subscriptions.filter(
      (s) => !memory.cancelledSubscriptions.includes(s.name)
    );
    const list = active
      .map((s) => `• ${s.name}: $${s.amount}${s.status === "forgotten" ? " ⚠️ (barely used)" : ""}`)
      .join("\n");
    const total = active.reduce((s, x) => s + x.amount, 0);
    return msg(
      "sage",
      `You have **${active.length} subscriptions** totalling **$${total.toFixed(2)}/mo**:\n\n${list}\n\nDisney+ looks forgotten — that's **$144/year** you could reclaim. Want me to flag it for cancellation?`,
      [
        { id: "flag-disney", label: "Flag Disney+ to cancel", type: "primary" },
        { id: "keep", label: "Keep everything", type: "secondary" },
      ]
    );
  }

  if (text.includes("europe") || text.includes("goal") || text.includes("vacation")) {
    return msg(
      "sage",
      "Europe Trip: **$1,660 / $3,000** (55%). You're **$340 behind** this month's target.\n\nAt your current pace you'll hit the goal by **August** instead of **June**. The dining overspend is the main drag — fix that and you're back on track by mid-June 👍",
      [{ id: "set-limit", label: "Set dining cap", type: "primary" }]
    );
  }

  if (text.includes("thank") || text.includes("good") || text.includes("later")) {
    onMemoryUpdate?.({
      resolvedInsights: [...memory.resolvedInsights, "dining-spike"],
    });
    return msg(
      "sage",
      "Anytime. I'll keep an eye on things — ping you if anything new pops up. You've got this 💪",
      []
    );
  }

  if (text.includes("disney")) {
    onMemoryUpdate?.({
      resolvedInsights: [...memory.resolvedInsights, "netflix-increase"],
    });
    return msg(
      "sage",
      "Flagged Disney+ for cancellation review. I'll follow up after you confirm in the app. That's $12/mo back in your pocket.",
      [{ id: "thanks", label: "Perfect", type: "primary" }]
    );
  }

  return msg(
    "sage",
    "I can help with that. Try asking about:\n• Your **rent warning** for Friday\n• **Subscription** cleanup\n• **Europe goal** progress\n• A **spending breakdown** or \"what if\" scenario",
    [
      { id: "breakdown", label: "Spending breakdown", type: "primary" },
      { id: "subs", label: "My subscriptions", type: "secondary" },
    ]
  );
}

export function respondToAction(
  actionId: string,
  memory: SageMemory,
  onMemoryUpdate?: (patch: Partial<SageMemory>) => void
): ChatMessage {
  const map: Record<string, string> = {
    breakdown: "yeah show me the breakdown",
    "rent-only": "tell me about rent friday",
    later: "I'm good for later",
    "set-limit": "set a $60 weekly limit please",
    "what-if": "what if I cut doordash",
    "scan-subs": "scan my subscriptions",
    "no-thanks": "thanks sage",
    transfer: "should I move money from savings for rent",
    remind: "remind me about rent thursday",
    "flag-disney": "flag disney plus to cancel",
    keep: "keep all subscriptions",
    thanks: "thanks tangi",
    subs: "scan my subscriptions",
  };
  return respondToUser(map[actionId] ?? actionId, memory, onMemoryUpdate);
}
