# AGENT.md — Legal & Professional Services

Open-source Decision Lab starter. Paste a **Copy GitHub** prompt from the workshop site into Cursor Agent and work in this folder.

## Paths
- GitHub tree: https://github.com/ecanbaykurt/Human-Centered-AI-for-Data-Driven-Decision-Making/tree/main/projects/professional-services
- This folder: `projects/professional-services/`
- Live dashboard (monorepo app): `/dashboard/professional-services`
- ClickOps: `/ops/professional-services`

## Goal
Track incoming requests by type and status without private case details.

**Decision question:** How can teams improve intake and service delivery?

## Ideas
- Compare request types
- Track open
- Improve intake workflow

## Data
- `data/sample_data.csv` — fictional intake requests (requests)
- Columns: date, category, value, status
- Categories: Consultation, Document Review, Referral, Compliance Check

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
