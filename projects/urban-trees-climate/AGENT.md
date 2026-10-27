# AGENT.md — Urban Trees & Climate

Open-source Decision Lab starter. Paste a **Copy GitHub** prompt from the workshop site into Cursor Agent and work in this folder.

## Paths
- GitHub tree: https://github.com/ecanbaykurt/Human-Centered-AI-for-Data-Driven-Decision-Making/tree/main/projects/urban-trees-climate
- This folder: `projects/urban-trees-climate/`
- Live dashboard (monorepo app): `/dashboard/urban-trees-climate`
- ClickOps: `/ops/urban-trees-climate`

## Goal
Compare tree records across neighborhoods.

**Decision question:** Where could urban greening have the greatest impact?

## Ideas
- Compare areas
- Population/area
- Missing coverage

## Data
- `data/sample_data.csv` — fictional tree records (trees)
- Columns: date, category, value, status
- Categories: Roxbury, Dorchester, Mattapan, Jamaica Plain

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
