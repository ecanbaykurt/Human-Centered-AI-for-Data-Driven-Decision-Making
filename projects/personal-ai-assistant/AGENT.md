# AGENT.md — Personal AI Assistant

Open-source Decision Lab starter. Paste a **Copy GitHub** prompt from the workshop site into Cursor Agent and work in this folder.

## Paths
- GitHub tree: https://github.com/ecanbaykurt/Human-Centered-AI-for-Data-Driven-Decision-Making/tree/main/projects/personal-ai-assistant
- This folder: `projects/personal-ai-assistant/`
- Live dashboard (monorepo app): `/dashboard/personal-ai-assistant`
- ClickOps: `/ops/personal-ai-assistant`

## Goal
Create a personal assistant that helps someone review their inbox, understand upcoming meetings, and choose priorities for the day.

**Decision question:** How can you organize emails, meetings and priorities in one place?

## Ideas
- Morning view of messages and meetings
- Highlight follow-ups
- Meeting brief or draft reply

## Data
- `data/sample_data.csv` — fictional example items (items)
- Columns: date, category, value, status
- Categories: Inbox, Calendar, Task, Follow-up

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
