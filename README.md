# Decision Lab — Human-Centered AI for Data-Driven Decision Making

Open-source workshop: pick a decision challenge, preview a dashboard, **Copy GitHub** (Claude-customized Cursor Agent prompt), paste into Cursor / Claude, and build on the matching project path.

**Repo:** https://github.com/ecanbaykurt/Human-Centered-AI-for-Data-Driven-Decision-Making

## Open-source project paths

| # | Path | Project |
|---|---|---|
| 01 | [`projects/personal-ai-assistant/`](./projects/personal-ai-assistant/) | Personal AI Assistant |
| 02 | [`projects/supply-chain-demand/`](./projects/supply-chain-demand/) | Supply Chain & Demand |
| 03 | [`projects/customer-experience/`](./projects/customer-experience/) | Customer Experience |
| 04 | [`projects/service-field-operations/`](./projects/service-field-operations/) | Service & Field Operations |
| 05 | [`projects/sustainability-impact/`](./projects/sustainability-impact/) | Sustainability & Impact |
| 06 | [`projects/urban-trees-climate/`](./projects/urban-trees-climate/) | Urban Trees & Climate |
| 07 | [`projects/housing-community/`](./projects/housing-community/) | Housing & Community |
| 08 | [`projects/market-risk-intelligence/`](./projects/market-risk-intelligence/) | Market & Risk Intelligence |
| 09 | [`projects/professional-services/`](./projects/professional-services/) | Professional Services |

Each folder has `README.md`, `AGENT.md`, `index.html`, and `data/sample_data.csv`.

### Copy GitHub → Cursor Agent

1. Open a challenge on the site (or customize the brief modal).
2. Click **Copy GitHub** — Claude builds a paste-ready agent prompt using your form answers + dashboard requirements (falls back to a solid template if no API key).
3. Paste into **Cursor Agent** / Claude Code — it clones/opens this repo and works in `projects/<slug>/`.

```bash
git clone https://github.com/ecanbaykurt/Human-Centered-AI-for-Data-Driven-Decision-Making.git
```

## Run the workshop site locally

```bash
npm install
cp .env.local.example .env.local   # ANTHROPIC_API_KEY=sk-ant-...
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Claude API

- Browser: **Settings** → paste key (`localStorage`)
- Server: `ANTHROPIC_API_KEY` in `.env.local` (recommended for Vercel)
- Used by `/api/github-prompt` (Copy GitHub) and `/api/clickops` (ClickOps studio)

## App routes

| Route | Purpose |
|---|---|
| `/` | Catalog + smart guide entry |
| `/challenge/[slug]` | Notes, smart guide, Copy GitHub |
| `/dashboard/[slug]` | Live demo dashboard |
| `/ops/[slug]` | ClickOps studio |
| `/guide` | Workshop smart guide |
| `/settings` | API key |
| `/forecast` | Supply-chain forecast lab |
| `/api/github-prompt` | Claude-customized Cursor prompt |
| `/api/clickops` | Streaming ClickOps |

## Stack

Next.js 16 · React 19 · Tailwind CSS 4 · AI SDK · Anthropic Claude · Recharts · Outfit + Space Mono
