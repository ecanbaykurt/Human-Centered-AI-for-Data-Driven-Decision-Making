# AGENT.md — Supply Chain & Demand

Open-source Decision Lab starter. Paste a **Copy GitHub** prompt from the workshop site into Cursor Agent and work in this folder.

## Paths
- GitHub tree: https://github.com/ecanbaykurt/Human-Centered-AI-for-Data-Driven-Decision-Making/tree/main/projects/supply-chain-demand
- This folder: `projects/supply-chain-demand/`
- Live dashboard (monorepo app): `/dashboard/supply-chain-demand`
- ClickOps: `/ops/supply-chain-demand`

## Goal
Help an operations manager estimate next week’s demand by location.

**Decision question:** How can we predict demand and plan inventory?

## Ideas
- Compare demand across locations
- Monthly by location
- Replenishment view

## Data
- `data/sample_data.csv` — fictional monthly units sold (units)
- Columns: date, category, value, status
- Categories: North Office, Harbor Office, West Office, Central Depot

## Agent instructions
1. Read README.md + this file + sample CSV.
2. Customize `index.html` (or add React) to the user's brief from the pasted prompt.
3. Keep privacy: fictional data unless user supplies CSV; no secrets in git.
4. Prefer decision-first UX over decorative charts.
5. Summarize how to open the result (open index.html or run the Next app).

## Do not
- Commit API keys
- Claim real predictions from demo metrics
- Leave the project folder unless the user asks
