const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

function buildSystemPrompt(transactionsSummary) {
  return `You are Buddy, a friendly and smart personal finance companion inside the FinBuddy app. The user's current financial data is: ${transactionsSummary}. Answer questions about their finances clearly and concisely. Be warm, direct, and specific with naira amounts.`;
}

function normalizeHistory(messages) {
  return messages
    .filter((m) => m.role === "user" || m.role === "buddy")
    .map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.text,
    }))
    .filter((m) => m.content.trim().length > 0);
}

async function consumeSseStream(response, onDelta) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() || "";

    for (const chunk of chunks) {
      const line = chunk
        .split("\n")
        .find((l) => l.startsWith("data: "));
      if (!line) continue;

      const data = line.slice(6).trim();
      if (data === "[DONE]") return;

      try {
        const parsed = JSON.parse(data);
        if (typeof parsed.text === "string" && parsed.text) {
          onDelta(parsed.text);
        }
      } catch {
        /* ignore malformed chunks */
      }
    }
  }
}

async function consumeAnthropicStream(response, onDelta) {
  const reader = response.body.getReader();
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
      if (data === "[DONE]") return;

      try {
        const event = JSON.parse(data);
        if (event.type === "content_block_delta" && event.delta?.text) {
          onDelta(event.delta.text);
        }
      } catch {
        /* ignore */
      }
    }
  }
}

/**
 * Stream Buddy replies. Proxies via /api/buddy/messages (server holds API key).
 * Falls back to direct Anthropic call when VITE_ANTHROPIC_API_KEY is set.
 */
export async function streamBuddyReply({ messages, transactionsSummary, onDelta, signal }) {
  const system = buildSystemPrompt(transactionsSummary);
  const history = normalizeHistory(messages);

  const proxyRes = await fetch("/api/buddy/messages", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messages: history, system }),
    signal,
  });

  if (proxyRes.ok && proxyRes.headers.get("content-type")?.includes("text/event-stream")) {
    await consumeSseStream(proxyRes, onDelta);
    return;
  }

  if (proxyRes.status !== 404 && proxyRes.status !== 502) {
    const err = await proxyRes.json().catch(() => ({}));
    if (!import.meta.env.VITE_ANTHROPIC_API_KEY) {
      throw new Error(
        typeof err?.error === "string" ? err.error : `Chat request failed (${proxyRes.status})`,
      );
    }
  }

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Chat unavailable — set ANTHROPIC_API_KEY on the server or VITE_ANTHROPIC_API_KEY for dev.");
  }

  const directRes = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      stream: true,
      system,
      messages: history.map((m) => ({ role: m.role, content: m.content })),
    }),
    signal,
  });

  if (!directRes.ok) {
    const err = await directRes.json().catch(() => ({}));
    throw new Error(
      typeof err?.error?.message === "string" ? err.error.message : `Anthropic error (${directRes.status})`,
    );
  }

  await consumeAnthropicStream(directRes, onDelta);
}
