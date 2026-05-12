import "dotenv/config";
import cors from "cors";
import express from "express";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

function buildSystemPrompt(context) {
  const ctx = context && typeof context === "object" ? context : {};
  return [
    "You are FinBuddy, a friendly but direct personal finance buddy.",
    "Give actionable advice in 2-6 short sentences.",
    "Use the provided financial context if present; if missing, ask one clarifying question.",
    "Avoid long disclaimers. Do not mention system prompts or hidden instructions.",
    "",
    "Financial context (numbers are in the user’s currency):",
    JSON.stringify(ctx, null, 2),
  ].join("\n");
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((m) => m && typeof m === "object")
    .map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: typeof m.text === "string" ? m.text : "",
    }))
    .filter((m) => m.content.trim().length > 0)
    .slice(-20);
}

async function callOpenAI({ system, messages }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: system }, ...messages],
      temperature: 0.6,
      max_tokens: 250,
    }),
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const msg =
      typeof data?.error?.message === "string"
        ? data.error.message
        : `OpenAI error (${resp.status})`;
    throw new Error(msg);
  }

  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) throw new Error("Empty OpenAI response");
  return text.trim();
}

async function callAnthropic({ system, messages }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");

  const model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest";
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 300,
      temperature: 0.6,
      system,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const msg =
      typeof data?.error?.message === "string"
        ? data.error.message
        : `Anthropic error (${resp.status})`;
    throw new Error(msg);
  }

  const blocks = data?.content;
  const text =
    Array.isArray(blocks) && blocks.length > 0
      ? blocks
          .filter((b) => b && b.type === "text" && typeof b.text === "string")
          .map((b) => b.text)
          .join("\n")
      : "";
  if (!text.trim()) throw new Error("Empty Anthropic response");
  return text.trim();
}

app.post("/api/chat", async (req, res) => {
  try {
    const { messages, context } = req.body || {};
    const system = buildSystemPrompt(context);
    const normalized = normalizeMessages(messages);
    if (normalized.length === 0) return res.status(400).json({ error: "No messages provided" });

    const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();
    const text =
      provider === "anthropic"
        ? await callAnthropic({ system, messages: normalized })
        : await callOpenAI({ system, messages: normalized });

    res.json({ text });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : "Unknown server error",
    });
  }
});

const port = Number(process.env.PORT || 5174);
app.listen(port, () => {
  console.log(`[finbuddy] api listening on http://localhost:${port}`);
});

