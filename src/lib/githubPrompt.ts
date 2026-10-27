import type { Challenge } from "@/data/challenges";
import {
  GITHUB_CLONE,
  GITHUB_REPO,
  getGithubMeta,
  type ProjectBriefFields,
} from "@/data/github";
import { getProjectNotes } from "@/data/projectNotes";

/** Local fallback when Claude is unavailable — still paste-ready for Cursor Agent. */
export function buildFallbackGithubPrompt(
  challenge: Challenge,
  fields: ProjectBriefFields = {},
): string {
  const meta = getGithubMeta(challenge);
  const notes = getProjectNotes(challenge.slug);
  const project = fields.project?.trim() || challenge.name;
  const problem =
    fields.problem?.trim() || challenge.suggestion || challenge.problem;
  const audience = fields.audience?.trim() || "Workshop participant";
  const data =
    fields.data?.trim() ||
    `Fictional sample data in ${meta.path}/data/sample_data.csv (inspired by ${challenge.source.name})`;
  const goals =
    fields.goals?.trim() ||
    challenge.ideas.join("; ") ||
    "Ship a usable decision dashboard";

  return `You are my Cursor coding agent. Work end-to-end on this open-source Decision Lab project.

## GitHub (clone / open this)
- Repo: ${GITHUB_REPO}
- Project path (work ONLY here unless I say otherwise): \`${meta.path}/\`
- Tree: ${meta.treeUrl}
- Clone: \`${GITHUB_CLONE}\`

## First actions
1. If the repo is not open yet: clone it, then open the workspace root.
2. \`cd\` focus / read files under \`${meta.path}/\` (README.md, AGENT.md, data/).
3. Also use the live Next.js app routes for reference UI:
   - Challenge: \`${meta.challengeRoute}\`
   - Dashboard: \`${meta.dashboardRoute}\`
   - ClickOps: \`${meta.opsRoute}\`
4. Do not invent secrets. Use env placeholders only.

## Customized brief (from Decision Lab form)
- Project name: ${project}
- Audience: ${audience}
- Decision / problem: ${problem}
- Data available: ${data}
- Dashboard should show: ${goals}
${fields.source ? `- Preferred dataset: ${fields.source}` : ""}
${fields.model ? `- Model to explore: ${fields.model}` : ""}

## Challenge context
- ${challenge.number} · ${challenge.name} · ${challenge.category}
- Title: ${challenge.title}
- Question: ${challenge.question}
- Problem: ${challenge.problem}
- Ideas: ${challenge.ideas.join("; ")}
- Measure: ${challenge.measure} (${challenge.unit})
- Categories: ${challenge.categories.join(", ")}
- Statuses: ${challenge.statuses.join(", ")}
- Source pointer: ${challenge.source.name} — ${challenge.source.url}

${
  notes
    ? `## Facilitator notes / requirements
Outcomes:
${notes.outcomes.map((o) => `- ${o}`).join("\n")}
Watch-outs:
${notes.watchouts.map((w) => `- ${w}`).join("\n")}
Notes:
${notes.notes.map((n) => `- ${n}`).join("\n")}
`
    : ""
}

## Your job now
1. Inspect \`${meta.path}/\` and extend the starter (HTML/React as documented in AGENT.md).
2. Customize the dashboard/UI to the brief above — decision-first, not chart decoration.
3. Keep fictional data unless I paste real CSV; never commit API keys.
4. When done, summarize files changed and how to run/preview.

Start by listing \`${meta.path}/\` and proposing a short plan, then implement.
`;
}

export function buildClaudeSystemForGithubPrompt(challenge: Challenge) {
  const meta = getGithubMeta(challenge);
  const notes = getProjectNotes(challenge.slug);
  return `You write paste-ready prompts for Cursor Agent / Claude Code.
Output ONLY the prompt text (no markdown fences around the whole reply).
The prompt MUST:
- Start with clear agent instructions
- Include repo ${GITHUB_REPO} and path ${meta.path}/
- Include clone command
- Embed the user's customized brief fields
- Embed challenge requirements and watch-outs
- Tell the agent to work primarily in ${meta.path}/
- Tell the agent to run immediately after paste (inspect → plan → implement)
- Forbid committing secrets
- Stay concrete and decision-centered
Language: match the user's brief language (Turkish if they wrote Turkish; otherwise English).
Challenge: ${challenge.number} ${challenge.name}
Question: ${challenge.question}
Ideas: ${challenge.ideas.join("; ")}
${notes ? `Outcomes: ${notes.outcomes.join(" | ")}` : ""}
${notes ? `Watch-outs: ${notes.watchouts.join(" | ")}` : ""}`;
}
