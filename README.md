# Decision Lab — Dashboard Starter Kits

Human-centered AI workshop: pick a decision challenge, preview a finished dashboard, customize a project kit, and build further in Cursor.

## Run locally

```bash
npm install
cp .env.local.example .env.local   # add ANTHROPIC_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Claude API (ClickOps)

1. Create a key at [Anthropic Console](https://console.anthropic.com/settings/keys)
2. Either paste it in **Settings** (`/settings`) — stored in browser `localStorage` — or set `ANTHROPIC_API_KEY` in `.env.local`
3. Open any project → **ClickOps · Claude** (`/ops/[slug]`)
4. Click an action (Build website, Improve dashboard, …) → **Run ClickOps** → download / preview HTML

## What’s included

| Route | Purpose |
|---|---|
| `/` | Landing, catalog (9 ideas), how it works, project kit ZIP wizard |
| `/challenge/[slug]` | Challenge brief, sample data, sources, Cursor build steps |
| `/dashboard/[slug]` | Finished specialized starter dashboard for each idea |
| `/ops/[slug]` | ClickOps studio — Claude builds websites/dashboards per project |
| `/guide` | Smart guide — lighted squares + notes index for all 9 projects |
| `/settings` | Claude API key (BYOK) |
| `/forecast` | Supply-chain forecast lab (baselines + holdout metrics) |
| `/api/clickops` | Streaming Claude endpoint (header or env key) |

### The 9 finished projects

1. **Personal AI Assistant** — inbox, calendar, focus list (localStorage), integrations guidance in ZIP  
2. **Supply Chain & Demand** — location demand, trends, replenishment watch → Forecast Lab  
3. **Customer Experience** — theme breakdown, sentiment, investigation priorities  
4. **Service & Field Operations** — backlog, open/closed, priority queue  
5. **Sustainability & Impact** — resource use by site over time  
6. **Urban Trees & Climate** — neighborhood canopy / coverage gaps  
7. **Housing & Community** — inquiries by neighborhood and emerging needs  
8. **Market & Risk Intelligence** — multi-series risk indicators  
9. **Professional Services** — intake pipeline and workflow stages  

Kits are generated **client-side** (JSZip). No GitHub, Supabase, Vercel, or live OAuth is connected in this demo.

## Stack

Next.js 16 · React 19 · Tailwind CSS 4 · Recharts · JSZip · Outfit + Space Mono
