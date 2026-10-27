# AGENT.md — Customer Experience & Research

Open-source Decision Lab starter. Paste a **Copy GitHub** prompt from the workshop site into Cursor Agent and work in this folder.

## Paths
- GitHub tree: https://github.com/ecanbaykurt/Human-Centered-AI-for-Data-Driven-Decision-Making/tree/main/projects/customer-experience
- This folder: `projects/customer-experience/`
- Live dashboard (monorepo app): `/dashboard/customer-experience`
- ClickOps: `/ops/customer-experience`

## Goal
See which feedback themes occur most often across locations.

**Decision question:** What can feedback and research reveal about customer needs?

## Ideas
- Compare themes
- Filter by theme
- Prioritize investigation

## Data
- `data/sample_data.csv` — fictional feedback submissions (reports)
- Columns: date, category, value, status
- Categories: Taste, Equipment, Availability, Service

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
