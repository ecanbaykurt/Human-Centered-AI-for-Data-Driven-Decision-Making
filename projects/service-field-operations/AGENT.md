# AGENT.md — Service & Field Operations

Open-source Decision Lab starter. Paste a **Copy GitHub** prompt from the workshop site into Cursor Agent and work in this folder.

## Paths
- GitHub tree: https://github.com/ecanbaykurt/Human-Centered-AI-for-Data-Driven-Decision-Making/tree/main/projects/service-field-operations
- This folder: `projects/service-field-operations/`
- Live dashboard (monorepo app): `/dashboard/service-field-operations`
- ClickOps: `/ops/service-field-operations`

## Goal
Understand volume and status of requests across categories.

**Decision question:** Where should teams prioritize service requests?

## Ideas
- High-volume categories
- Open vs closed
- Backlog view

## Data
- `data/sample_data.csv` — fictional service requests (requests)
- Columns: date, category, value, status
- Categories: Maintenance, Refill, Technical, Installation

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
