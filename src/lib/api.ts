const API = "/api";

export interface ApiSnapshot {
  accounts: { id: string; name: string; type: string; balance: number; accountNumber: string }[];
  transactions: { id: string; date: string; description: string; amount: number; category: string; accountId: string }[];
  goals: { id: string; name: string; target: number; current: number; deadline: string }[];
  alerts: { id: string; urgency: number; title: string; detail: string; category: string }[];
  memory: { resolvedInsights: string[]; weeklyDiningLimit?: number; cancelledSubscriptions: string[] };
}

export interface HealthStatus {
  ok: boolean;
  sage: boolean;
  sora: boolean;
}

export async function fetchHealth(): Promise<HealthStatus> {
  const res = await fetch(`${API}/health`);
  if (!res.ok) throw new Error("API unreachable — run: npm run dev:all");
  return res.json();
}

export async function fetchSnapshot(): Promise<ApiSnapshot> {
  const res = await fetch(`${API}/snapshot`);
  if (!res.ok) throw new Error("Failed to load snapshot");
  return res.json();
}

export async function fetchBriefing(): Promise<{ reply: string; snapshot?: ApiSnapshot; mock?: boolean }> {
  const res = await fetch(`${API}/sage/briefing`, { method: "POST" });
  if (!res.ok) throw new Error((await res.json()).error ?? "Briefing failed");
  return res.json();
}

export async function sendSageChat(
  message: string,
  history: { role: "user" | "assistant"; content: string }[]
): Promise<{ reply: string; snapshot?: ApiSnapshot; mock?: boolean }> {
  const res = await fetch(`${API}/sage/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Chat failed");
  return data;
}

export async function speakWithSora(text: string): Promise<Blob> {
  const res = await fetch(`${API}/sora/speak`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "TTS failed");
  }
  return res.blob();
}

export async function executeTransfer(
  from: string,
  to: string,
  amount: number
): Promise<{ ok: boolean; snapshot?: ApiSnapshot; error?: string }> {
  const res = await fetch(`${API}/transfer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, amount }),
  });
  const data = await res.json();
  if (!res.ok) return { ok: false, error: data.error ?? "Transfer failed" };
  return { ok: true, snapshot: data.snapshot };
}

export function playAudioBlob(blob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onended = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    audio.onerror = reject;
    audio.play().catch(reject);
  });
}
