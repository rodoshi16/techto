import "dotenv/config";
import cors from "cors";
import express from "express";
import { anthropicConfigured, chatWithSage, getProactiveBriefing } from "./services/sageAgent.js";
import { elevenLabsConfigured, textToSpeech } from "./services/elevenlabs.js";
import { runTransactionScan } from "./services/transactionMonitor.js";
import { dismissAlert, getSnapshot, transferMoney } from "./store/bankStore.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    sage: anthropicConfigured(),
    sora: elevenLabsConfigured(),
  });
});

app.get("/api/snapshot", (_req, res) => {
  runTransactionScan();
  res.json(getSnapshot());
});

app.get("/api/alerts", (_req, res) => {
  const alerts = runTransactionScan();
  res.json({ alerts });
});

app.post("/api/alerts/:id/dismiss", (req, res) => {
  dismissAlert(req.params.id);
  res.json({ ok: true });
});

app.post("/api/transfer", (req, res) => {
  const { from, to, amount } = req.body as { from: string; to: string; amount: number };
  try {
    const result = transferMoney(from, to, amount);
    runTransactionScan();
    res.json({ ok: true, result, snapshot: getSnapshot() });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

app.post("/api/sage/briefing", async (_req, res) => {
  try {
    if (!anthropicConfigured()) {
      runTransactionScan();
      const alerts = getSnapshot().alerts;
      const lines = alerts.slice(0, 2).map((a) => `• ${a.title}`).join("\n");
      return res.json({
        reply: `Hey Rodoshi 👋 Mock briefing (add ANTHROPIC_API_KEY for real Sage):\n\n${lines}\n\nWant me to break down your spending?`,
        mock: true,
      });
    }
    const reply = await getProactiveBriefing();
    res.json({ reply, mock: false, snapshot: getSnapshot() });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.post("/api/sage/chat", async (req, res) => {
  const { message, history = [] } = req.body as {
    message: string;
    history?: { role: "user" | "assistant"; content: string }[];
  };

  if (!message?.trim()) {
    return res.status(400).json({ error: "message required" });
  }

  try {
    if (!anthropicConfigured()) {
      return res.json({
        reply: "Add ANTHROPIC_API_KEY to .env and restart the server for live Sage.",
        mock: true,
      });
    }
    const { reply, toolsUsed } = await chatWithSage(history, message);
    runTransactionScan();
    res.json({ reply, toolsUsed, snapshot: getSnapshot() });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.post("/api/sora/speak", async (req, res) => {
  const { text } = req.body as { text?: string };
  if (!text?.trim()) return res.status(400).json({ error: "text required" });

  try {
    if (!elevenLabsConfigured()) {
      return res.status(503).json({
        error: "ELEVENLABS_API_KEY not set",
        hint: "Add key to .env — or use browser speech in the UI",
      });
    }
    const audio = await textToSpeech(text);
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(audio);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🏦 Sage API http://localhost:${PORT}`);
  console.log(`   Anthropic: ${anthropicConfigured() ? "✓" : "✗ add ANTHROPIC_API_KEY"}`);
  console.log(`   ElevenLabs: ${elevenLabsConfigured() ? "✓" : "✗ add ELEVENLABS_API_KEY"}\n`);
});
