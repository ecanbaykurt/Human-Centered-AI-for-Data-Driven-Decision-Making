# AGENT.md — Market & Risk Intelligence

Open-source Decision Lab starter. Paste a **Copy GitHub** prompt from the workshop site into Cursor Agent and work in this folder.

## Paths
- GitHub tree: https://github.com/ecanbaykurt/Human-Centered-AI-for-Data-Driven-Decision-Making/tree/main/projects/market-risk-intelligence
- This folder: `projects/market-risk-intelligence/`
- Live dashboard (monorepo app): `/dashboard/market-risk-intelligence`
- ClickOps: `/ops/market-risk-intelligence`

## Goal
Compare selected business indicators requiring human review.

**Decision question:** What signals help assess changing markets and risks?

## Ideas
- Indicators over time
- Compare categories
- Context before interpretation

## Data
- `data/sample_data.csv` — fictional indicator score (points)
- Columns: date, category, value, status
- Categories: Liquidity, Activity, Profitability, Leverage

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
