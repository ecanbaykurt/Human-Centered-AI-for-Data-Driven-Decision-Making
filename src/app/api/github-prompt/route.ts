import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { getChallenge } from "@/data/challenges";
import type { ProjectBriefFields } from "@/data/github";
import { getGithubMeta } from "@/data/github";
import {
  buildClaudeSystemForGithubPrompt,
  buildFallbackGithubPrompt,
} from "@/lib/githubPrompt";

export const maxDuration = 45;

type Body = {
  slug: string;
  fields?: ProjectBriefFields;
  /** When true, skip Claude and return local template */
  fallbackOnly?: boolean;
};

function resolveApiKey(req: Request): string | null {
  const header =
    req.headers.get("x-anthropic-api-key")?.trim() ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (header) return header;
  return process.env.ANTHROPIC_API_KEY?.trim() || null;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const challenge = getChallenge(body.slug);
  if (!challenge) {
    return Response.json({ error: "Unknown challenge" }, { status: 404 });
  }

  const fields = body.fields ?? {};
  const fallback = buildFallbackGithubPrompt(challenge, fields);
  const meta = getGithubMeta(challenge);

  if (body.fallbackOnly) {
    return Response.json({
      prompt: fallback,
      source: "template",
      repo: meta.repo,
      path: meta.path,
      treeUrl: meta.treeUrl,
    });
  }

  const apiKey = resolveApiKey(req);
  if (!apiKey) {
    return Response.json({
      prompt: fallback,
      source: "template",
      repo: meta.repo,
      path: meta.path,
      treeUrl: meta.treeUrl,
      warning:
        "No Claude API key — copied template prompt. Add key for richer customization.",
    });
  }

  const anthropic = createAnthropic({ apiKey });
  const modelId =
    process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-5-20250929";

  try {
    const { text } = await generateText({
      model: anthropic(modelId),
      system: buildClaudeSystemForGithubPrompt(challenge),
      prompt: `Write the Cursor Agent paste prompt.

Repo path: ${meta.path}/
Tree URL: ${meta.treeUrl}

User brief JSON:
${JSON.stringify(
  {
    project: fields.project || challenge.name,
    audience: fields.audience || "",
    problem: fields.problem || challenge.suggestion || challenge.problem,
    data: fields.data || "",
    goals: fields.goals || challenge.ideas.join("; "),
    source: fields.source || "",
    model: fields.model || "",
  },
  null,
  2,
)}

Challenge JSON:
${JSON.stringify(
  {
    number: challenge.number,
    name: challenge.name,
    title: challenge.title,
    question: challenge.question,
    problem: challenge.problem,
    ideas: challenge.ideas,
    measure: challenge.measure,
    unit: challenge.unit,
    categories: challenge.categories,
    statuses: challenge.statuses,
    source: challenge.source,
  },
  null,
  2,
)}
`,
    });

    const prompt = text.trim() || fallback;
    return Response.json({
      prompt,
      source: "claude",
      repo: meta.repo,
      path: meta.path,
      treeUrl: meta.treeUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Claude failed";
    return Response.json({
      prompt: fallback,
      source: "template",
      repo: meta.repo,
      path: meta.path,
      treeUrl: meta.treeUrl,
      warning: `Claude unavailable (${message}). Copied template prompt instead.`,
    });
  }
}
