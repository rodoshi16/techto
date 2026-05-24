# How to run the real Sage + Sora agent

Your demo has two layers:

| Layer | What it does |
|-------|----------------|
| **UI** (`npm run dev`) | Tangerine screens — React app |
| **Agent API** (`npm run dev:server`) | Monitors transactions, runs Claude tools, ElevenLabs voice |

Run both: **`npm run dev:all`**

---

## 1. Get API keys (free tiers)

### Anthropic (Sage brain)
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Haiku is cheap — good for hackathons (`claude-haiku-4-5-20251001`)

### ElevenLabs (Sora voice)
1. Go to [elevenlabs.io](https://elevenlabs.io) → Profile → **API Keys**
2. Copy your key (free credits apply to TTS)
3. Optional: pick a voice ID from [API voices list](https://elevenlabs.io/docs/api-reference/get-voices)

---

## 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
ANTHROPIC_API_KEY=sk-ant-api03-...
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
PORT=3001
```

Never commit `.env`.

---

## 3. Start the stack

```bash
npm install
npm run dev:all
```

- App: http://localhost:5173  
- API health: http://localhost:3001/api/health  

You should see `sage: true` and `sora: true` when keys work.

---

## What the agent actually does

### Transaction monitoring (`server/services/transactionMonitor.ts`)
Runs rules on every scan:
- Chequing balance vs upcoming rent → **overdraft alert**
- Rogers charge spike → **subscription alert**
- Dining total > $200 → **spending alert**
- Europe goal behind → **goal alert**
- Forgotten Disney+ → **waste alert**

Triggered when:
- App loads (`GET /api/snapshot`)
- Sage opens (`POST /api/sage/briefing`)
- Every chat message (re-scan after actions)

### Alerts
Stored server-side; dismissed via Sage tool `dismiss_alert` or when user resolves in chat.

For **push notifications** (stretch): add Twilio / Firebase and call the same monitor on a cron.

### Move money (`transfer_money` tool)
Sage can call:

```json
{ "from_account": "savings", "to_account": "chequing", "amount": 200 }
```

This updates in-memory balances + creates transfer rows (demo).  
**Production:** Tangerine would expose a secured transfers API — Sage only initiates after user confirms in chat.

### Sage chat (`POST /api/sage/chat`)
Claude with tools:
- `run_transaction_scan`
- `get_account_snapshot`
- `transfer_money`
- `dismiss_alert`
- `set_weekly_dining_limit`

Try: *"Move $200 from savings to chequing for rent"* — balances update in the UI after refresh.

### Sora voice flow
1. Open **Sora** from Sage header  
2. Sage generates briefing text (Claude)  
3. **ElevenLabs TTS** speaks it (`POST /api/sora/speak`)  
4. Tap mic → **browser speech recognition** (Chrome) → text → Sage → spoken reply  

**ElevenLabs Conversational AI** (full duplex): create an agent at elevenlabs.io/app/conversational-ai, point webhooks to your `/api/sage/chat` — best for v2 after the demo.

---

## Architecture (for judges)

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Tangerine UI   │────▶│  Sage API :3001  │────▶│  Anthropic  │
│  (React)        │     │  tools + monitor │     │  Claude     │
└────────┬────────┘     └────────┬─────────┘     └─────────────┘
         │                       │
         │ Sora voice            │ mock bank store
         ▼                       ▼ (→ real Tangerine APIs)
┌─────────────────┐     ┌──────────────────┐
│  Mic + playback │────▶│  ElevenLabs TTS  │
└─────────────────┘     └──────────────────┘
```

**Pitch line:** Tangerine already has transactions, goals, balances. Sage connects the dots and acts — the UI is just where it lives.

---

## Production path (real Tangerine)

| Demo now | Production |
|----------|------------|
| `bankStore.ts` in memory | Tangerine core banking APIs |
| Rule-based monitor | + ML anomaly detection on real ledger |
| Chat-initiated transfer | OAuth + 2FA + confirmed transfer endpoint |
| Browser notifications | Push via FCM/APNs |
| Polling alerts | Webhooks on new transactions |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `API unreachable` | Run `npm run dev:server` |
| Sage says add API key | Set `ANTHROPIC_API_KEY`, restart server |
| No voice | Set `ELEVENLABS_API_KEY`; fallback uses browser `speechSynthesis` |
| Mic doesn't work | Use Chrome; allow microphone |
| High Anthropic cost | Use Haiku; shorten system prompt |

---

## Test commands

```bash
# Health
curl http://localhost:3001/api/health

# Scan + alerts
curl http://localhost:3001/api/alerts

# Chat
curl -X POST http://localhost:3001/api/sage/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Move 200 from savings to chequing"}'
```
