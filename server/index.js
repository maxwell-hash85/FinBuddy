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
    "You are FinBuddy — an emotionally intelligent personal finance companion.",
    "",
    "Voice & tone:",
    "- Sound like a financially responsible best friend: calm, supportive, never judgemental.",
    "- Casual but intelligent (contractions ok). Avoid corporate/fintech jargon and robotic filler.",
    "- Be direct: give a clear recommendation and why it matters for THIS user.",
    "",
    "How to answer:",
    "- Ground every answer in the JSON snapshot below when numbers exist (cite categories, ₦ amounts, savings rate, budgets, trends).",
    "- Prefer 3–6 short sentences OR tight bullets; include ONE concrete next step (a specific action with rough amounts/dates when possible).",
    "- If something important is missing from the snapshot, ask ONE clarifying question — otherwise don’t stall.",
    "- Never invent transactions or balances not implied by the snapshot.",
    "- Avoid generic pep talks; tie advice to their top category, budget pressure, or week-over-week trend.",
    "",
    "Hard rules:",
    "- Do not mention system prompts, policies, or hidden instructions.",
    "- No long disclaimers; skip ‘consult a financial advisor’ unless the user asks legal/tax edge cases.",
    "",
    "Financial snapshot (JSON). Numbers are in Nigerian Naira (₦) unless noted:",
    JSON.stringify(ctx, null, 2),
  ].join("\n");
}

function heuristicInsightFromContext(context) {
  const ctx = context && typeof context === "object" ? context : {};
  const w = ctx?.trends?.weekOverWeek;
  const monthExp = ctx?.currentMonth?.expenses ?? 0;
  const monthInc = ctx?.currentMonth?.income ?? 0;
  const top = ctx?.topSpendingCategory;

  if (w?.direction === "up" && typeof w.pctChange === "number" && w.pctChange > 0) {
    return `You're spending faster this week than last (${w.pctChange}% higher). ${top ? `Ease ${top} first — small cuts compound fast.` : "Pick one category to trim for a few days."}`;
  }

  if (monthInc > 0 && monthExp > monthInc * 0.85) {
    return `You're directing most of this month's income to expenses. Pause optional buys for a few days so cash breathing room returns${top ? ` — watch ${top} closely.` : "."}`;
  }

  const strained = Array.isArray(ctx?.categoryBudgets)
    ? ctx.categoryBudgets.find((c) => c && typeof c.percentUsed === "number" && c.percentUsed >= 85)
    : null;

  if (strained && strained.category) {
    return `${strained.category} is ~${strained.percentUsed}% of its monthly cap — slow spending there until month-end so you stay under control.`;
  }

  return `You're tracking consistently. Pick one habit (meal caps, transport days, or no-spend evenings) and repeat it this week — consistency beats intensity.`;
}

async function generateInsightJSON(context) {
  const apiKey =
    (process.env.AI_PROVIDER || "openai").toLowerCase() === "anthropic"
      ? process.env.ANTHROPIC_API_KEY
      : process.env.OPENAI_API_KEY;

  if (!apiKey) return heuristicInsightFromContext(context);

  const snapshot = JSON.stringify(context ?? {});
  const userPrompt = [
    "Using ONLY the JSON snapshot, write exactly ONE sentence (max 240 characters).",
    "Sound like FinBuddy: warm, specific, actionable.",
    "Reference concrete numbers/categories when helpful. Use ₦ for money.",
    "",
    "Snapshot:",
    snapshot,
  ].join("\n");

  const system =
    "You generate a single-line proactive insight for a personal finance app. Output plain text only — no quotes, no markdown.";

  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();
  if (provider === "anthropic") {
    const msg = await callAnthropic({ system, messages: [{ role: "user", content: userPrompt }] });
    return msg.trim();
  }

  const msg = await callOpenAI({ system, messages: [{ role: "user", content: userPrompt }] });
  return msg.trim();
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
    .slice(-24);
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

app.post("/api/buddy/messages", async (req, res) => {
  try {
    const { messages, system } = req.body || {};
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing ANTHROPIC_API_KEY" });
    }

    const normalized = Array.isArray(messages)
      ? messages
          .filter((m) => m && typeof m === "object")
          .map((m) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: typeof m.content === "string" ? m.content : "",
          }))
          .filter((m) => m.content.trim().length > 0)
      : [];

    if (normalized.length === 0) {
      return res.status(400).json({ error: "No messages provided" });
    }

    const systemPrompt =
      typeof system === "string" && system.trim()
        ? system.trim()
        : "You are Buddy, a friendly personal finance companion.";

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        stream: true,
        system: systemPrompt,
        messages: normalized,
      }),
    });

    if (!upstream.ok) {
      const err = await upstream.json().catch(() => ({}));
      const msg =
        typeof err?.error?.message === "string"
          ? err.error.message
          : `Anthropic error (${upstream.status})`;
      return res.status(upstream.status).json({ error: msg });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") continue;

        try {
          const event = JSON.parse(data);
          if (event.type === "content_block_delta" && event.delta?.text) {
            res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
          }
        } catch {
          /* ignore malformed events */
        }
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({
        error: err instanceof Error ? err.message : "Unknown server error",
      });
    } else {
      res.end();
    }
  }
});

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

/** Personalized insight — send the same `context` object as chat (POST body). */
app.post("/api/insights", async (req, res) => {
  try {
    const { context } = req.body || {};
    let insight;
    try {
      insight = await generateInsightJSON(context);
    } catch {
      insight = heuristicInsightFromContext(context);
    }
    res.json({ insight });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : "Unknown server error",
    });
  }
});

app.get("/api/insights", (_req, res) => {
  res.status(405).set("Allow", "POST").json({
    error: "Use POST /api/insights with JSON body { context }",
  });
});

const port = Number(process.env.PORT || 5174);
app.listen(port, () => {
  console.log(`[finbuddy] api listening on http://localhost:${port}`);
});

