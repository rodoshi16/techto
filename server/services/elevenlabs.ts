const ELEVENLABS_API = "https://api.elevenlabs.io/v1";

export async function textToSpeech(text: string): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM";

  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY not set");
  }

  const clean = text.replace(/\*\*/g, "").replace(/[👋✅👍]/g, "").slice(0, 500);

  const res = await fetch(`${ELEVENLABS_API}/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: clean,
      model_id: "eleven_turbo_v2_5",
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs TTS failed: ${res.status} ${err}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

export function elevenLabsConfigured(): boolean {
  return Boolean(process.env.ELEVENLABS_API_KEY);
}
