# AGENT.md — Sustainability & Impact

Open-source Decision Lab starter. Paste a **Copy GitHub** prompt from the workshop site into Cursor Agent and work in this folder.

## Paths
- GitHub tree: https://github.com/ecanbaykurt/Human-Centered-AI-for-Data-Driven-Decision-Making/tree/main/projects/sustainability-impact
- This folder: `projects/sustainability-impact/`
- Live dashboard (monorepo app): `/dashboard/sustainability-impact`
- ClickOps: `/ops/sustainability-impact`

## Goal
Compare resource-use records across locations.

**Decision question:** How can we measure and improve environmental impact?

## Ideas
- Compare by location
- Changes over time
- What measure leaves out

## Data
- `data/sample_data.csv` — fictional resource use (units)
- Columns: date, category, value, status
- Categories: North Site, Central Site, South Site, East Site

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
