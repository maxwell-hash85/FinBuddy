function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Simulates streaming by emitting text character-by-character. */
export async function streamText(text, onDelta, signal, delayMs = 14) {
  for (const char of text) {
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }
    onDelta(char);
    await sleep(delayMs);
  }
}
