# AGENT.md — Housing & Community Impact

Open-source Decision Lab starter. Paste a **Copy GitHub** prompt from the workshop site into Cursor Agent and work in this folder.

## Paths
- GitHub tree: https://github.com/ecanbaykurt/Human-Centered-AI-for-Data-Driven-Decision-Making/tree/main/projects/housing-community
- This folder: `projects/housing-community/`
- Live dashboard (monorepo app): `/dashboard/housing-community`
- ClickOps: `/ops/housing-community`

## Goal
Compare housing indicators and plan where to learn more.

**Decision question:** Where are housing and community needs emerging?

## Ideas
- Inquiries by neighborhood
- Over time
- What cannot be inferred

## Data
- `data/sample_data.csv` — fictional housing inquiries (inquiries)
- Columns: date, category, value, status
- Categories: Roxbury, Dorchester, Mattapan, South End

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
