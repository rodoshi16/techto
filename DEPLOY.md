# Deploy to Vercel

This project is one Vercel app: **Vite frontend** + **Express API** (serverless).

## 1. Push to GitHub

```bash
git add .
git commit -m "Prepare for Vercel"
git push origin main
```

## 2. Import on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. Vercel should auto-detect **Vite** — leave settings as:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Click **Deploy** (it will fail Sage/voice until you add env vars — that's OK)

## 3. Environment variables

In the project → **Settings** → **Environment Variables**, add:

| Name | Value |
|------|--------|
| `ANTHROPIC_API_KEY` | From [console.anthropic.com](https://console.anthropic.com) |
| `ELEVENLABS_API_KEY` | From [elevenlabs.io](https://elevenlabs.io) → Profile → API Key |
| `ELEVENLABS_VOICE_ID` | Optional, default `21m00Tcm4TlvDq8ikWAM` |
| `ANTHROPIC_MODEL` | Optional, e.g. `claude-haiku-4-5-20251001` |

Apply to **Production**, **Preview**, and **Development**.

Then **Redeploy** (Deployments → ⋯ → Redeploy).

## 4. Verify

- App: `https://your-project.vercel.app`
- API: `https://your-project.vercel.app/api/health`  
  Should return `{ "ok": true, "sage": true, "sora": true }`

## 5. Deploy from CLI (optional)

```bash
npm i -g vercel
vercel login
vercel          # first time — link project
vercel --prod   # production
```

Pull env locally:

```bash
vercel env pull .env.local
```

---

## Notes

**In-memory data:** Balances reset when serverless functions cold-start. Fine for demos; production needs a database (Vercel Postgres, Upstash, etc.).

**Voice:** Sora uses ElevenLabs on the server. Mic input uses the browser (works on HTTPS — Vercel provides that).

**Local dev** (unchanged):

```bash
npm run dev:all
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `/api/health` 404 | Ensure `api/[...path].ts` is committed; redeploy |
| Sage always offline | Add `ANTHROPIC_API_KEY`; redeploy |
| 504 on chat | Serverless timeout — use Haiku model; keep prompts short |
| Build fails | Run `npm run build` locally first |
