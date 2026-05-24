import Anthropic from "@anthropic-ai/sdk";
import { USER_NAME } from "../data/seed.js";
import {
  dismissAlert,
  getSnapshot,
  patchMemory,
  transferMoney,
} from "../store/bankStore.js";
import { getScanSummary, runTransactionScan } from "./transactionMonitor.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TOOLS: Anthropic.Tool[] = [
  {
    name: "run_transaction_scan",
    description: "Scan last 30 days of transactions, balances, and goals. Returns ranked alerts. Call on session start and when user asks for an update.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_account_snapshot",
    description: "Get current balances, recent transactions, savings goals, and active alerts.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "transfer_money",
    description: "Move money between user's Tangerine accounts. Always confirm amount and accounts with user first.",
    input_schema: {
      type: "object",
      properties: {
        from_account: { type: "string", enum: ["chequing", "savings"] },
        to_account: { type: "string", enum: ["chequing", "savings"] },
        amount: { type: "number", description: "CAD amount" },
      },
      required: ["from_account", "to_account", "amount"],
    },
  },
  {
    name: "dismiss_alert",
    description: "Mark an alert as resolved so it is not shown again.",
    input_schema: {
      type: "object",
      properties: { alert_id: { type: "string" } },
      required: ["alert_id"],
    },
  },
  {
    name: "set_weekly_dining_limit",
    description: "Set a soft weekly dining/delivery spending cap Sage will track.",
    input_schema: {
      type: "object",
      properties: { amount: { type: "number" } },
      required: ["amount"],
    },
  },
];

function executeTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case "run_transaction_scan": {
      const alerts = runTransactionScan();
      return JSON.stringify({ alerts, summary: getScanSummary() }, null, 2);
    }
    case "get_account_snapshot":
      return JSON.stringify(getSnapshot(), null, 2);
    case "transfer_money": {
      const from = input.from_account as string;
      const to = input.to_account as string;
      const amount = input.amount as number;
      try {
        const result = transferMoney(from, to, amount);
        return JSON.stringify({
          success: true,
          message: `Transferred $${amount} from ${result.from.name} to ${result.to.name}. New chequing balance: $${getSnapshot().accounts.find((a) => a.id === "chequing")?.balance.toFixed(2)}`,
          result,
        });
      } catch (e) {
        return JSON.stringify({ success: false, error: (e as Error).message });
      }
    }
    case "dismiss_alert":
      dismissAlert(input.alert_id as string);
      return JSON.stringify({ dismissed: input.alert_id });
    case "set_weekly_dining_limit":
      patchMemory({ weeklyDiningLimit: input.amount as number });
      return JSON.stringify({ set: input.amount, unit: "CAD/week dining" });
    default:
      return JSON.stringify({ error: "Unknown tool" });
  }
}

const SYSTEM = `You are Sage, a proactive financial companion inside the Tangerine banking app for ${USER_NAME}.

You are NOT a generic chatbot. You:
- Speak like a financially-savvy friend (warm, concise, Canadian context, CAD)
- Lead with insights — on first message, call run_transaction_scan then open with top 1-2 urgent items
- Offer concrete actions (transfer money, set limits, dismiss resolved alerts)
- Remember: use tools instead of guessing balances

Never say "How can I help?" as your opener. Briefing first, then invite conversation.

When user confirms a transfer, use transfer_money tool. Double-check amounts.

Keep responses under 120 words unless breaking down spending.`;

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export async function chatWithSage(
  history: ChatTurn[],
  userMessage: string
): Promise<{ reply: string; toolsUsed: string[] }> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY not set");
  }

  const messages: Anthropic.MessageParam[] = [
    ...history.map((h) => ({
      role: h.role as "user" | "assistant",
      content: h.content,
    })),
    { role: "user", content: userMessage },
  ];

  const toolsUsed: string[] = [];
  let reply = "";
  let iterations = 0;

  while (iterations < 6) {
    iterations++;
    const response = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM,
      tools: TOOLS,
      messages,
    });

    const toolBlocks = response.content.filter((b) => b.type === "tool_use");
    const textBlocks = response.content.filter((b) => b.type === "text");

    if (textBlocks.length) {
      reply = textBlocks.map((b) => (b.type === "text" ? b.text : "")).join("\n");
    }

    if (toolBlocks.length === 0 || response.stop_reason === "end_turn") {
      if (reply) break;
    }

    messages.push({ role: "assistant", content: response.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of toolBlocks) {
      if (block.type !== "tool_use") continue;
      toolsUsed.push(block.name);
      const result = executeTool(block.name, block.input as Record<string, unknown>);
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: result,
      });
    }

    messages.push({ role: "user", content: toolResults });

    if (response.stop_reason === "end_turn" && !toolBlocks.length) break;
  }

  return { reply: reply || "I'm here — ask me about your accounts or say 'scan my transactions'.", toolsUsed };
}

export function anthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function getProactiveBriefing(): Promise<string> {
  runTransactionScan();
  const { reply } = await chatWithSage([], "I just opened the app. Give me my proactive briefing now.");
  return reply;
}
