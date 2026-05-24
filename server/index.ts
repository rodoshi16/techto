import "dotenv/config";
import app from "./app.js";

const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, () => {
  console.log(`\n🏦 Sage API http://localhost:${PORT}`);
  console.log(`   Set ANTHROPIC_API_KEY and ELEVENLABS_API_KEY in .env\n`);
});
