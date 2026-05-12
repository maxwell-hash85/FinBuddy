# FinBuddy

FinBuddy is a lightweight personal finance tracker with an AI buddy chat layer.

## Run locally

Install dependencies:

```bash
npm install
```

Create a `.env` file (copy from `.env.example`) and set **one** provider key:

- **Anthropic (Claude)** (recommended): set `ANTHROPIC_API_KEY` and `AI_PROVIDER=anthropic`
- **OpenAI**: set `OPENAI_API_KEY` and `AI_PROVIDER=openai`

Start UI + API together:

```bash
npm run dev
```

- UI: Vite dev server
- API: `http://localhost:5174` (proxied from the UI via `/api/*`)

## API

- `POST /api/chat` — `{ messages, context }` for conversational guidance.
- `POST /api/insights` — `{ context }` returns `{ insight }` (Claude/OpenAI when configured; heuristic fallback otherwise).

`GET /api/insights` returns **405** — use **POST** with the financial snapshot.
