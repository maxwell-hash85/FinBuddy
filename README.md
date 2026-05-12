# FinBuddy

FinBuddy is a lightweight personal finance tracker with an AI buddy chat layer.

## Run locally

Install dependencies:

```bash
npm install
```

Create a `.env` file (copy from `.env.example`) and set **one** provider key:

- **OpenAI**: set `OPENAI_API_KEY` (default, `AI_PROVIDER=openai`)
- **Anthropic (Claude)**: set `ANTHROPIC_API_KEY` and `AI_PROVIDER=anthropic`

Start UI + API together:

```bash
npm run dev
```

- UI: Vite dev server
- API: `http://localhost:5174` (proxied from the UI via `/api/*`)
