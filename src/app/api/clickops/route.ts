import { createAnthropic } from "@ai-sdk/anthropic";
import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";
import { getChallenge } from "@/data/challenges";
import {
  buildSystemPrompt,
  getClickOpsAction,
} from "@/data/clickOps";

export const maxDuration = 60;

type Body = {
  messages: UIMessage[];
  slug?: string;
  actionId?: string;
};

function resolveApiKey(req: Request): string | null {
  const header =
    req.headers.get("x-anthropic-api-key")?.trim() ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (header) return header;
  const env = process.env.ANTHROPIC_API_KEY?.trim();
  return env || null;
}

export async function POST(req: Request) {
  const apiKey = resolveApiKey(req);
  if (!apiKey) {
    return Response.json(
      {
        error:
          "Claude API key missing. Add ANTHROPIC_API_KEY in .env.local or paste your key in Settings / ClickOps.",
      },
      { status: 401 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { messages, slug, actionId } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "messages required" }, { status: 400 });
  }

  const challenge = slug ? getChallenge(slug) : undefined;
  const action =
    slug && actionId ? getClickOpsAction(slug, actionId) : undefined;

  const system = challenge
    ? buildSystemPrompt(challenge) +
      (action
        ? `\n\nActive ClickOps action: ${action.label} (${action.id}). Prefer ${action.artifactHint} artifacts.`
        : "")
    : `You are Decision Lab ClickOps. Help build websites and dashboards for human-centered AI workshop challenges. Prefer complete HTML/TSX artifacts in fenced code blocks.`;

  const anthropic = createAnthropic({ apiKey });
  const modelId =
    process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-5-20250929";

  try {
    const result = streamText({
      model: anthropic(modelId),
      system,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse({
      onError: (err) => {
        const message =
          err instanceof Error ? err.message : "Claude request failed";
        if (/api.?key|authentication|unauthorized|401|invalid/i.test(message)) {
          return "Claude API key is missing or invalid. Add a valid key from console.anthropic.com (usually starts with sk-ant-api03-) in Settings or .env.local. Copy GitHub still works with a template prompt.";
        }
        return message;
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Claude request failed";
    const auth = /api.?key|authentication|unauthorized|401|invalid/i.test(
      message,
    );
    return Response.json(
      {
        error: auth
          ? "Claude API key is missing or invalid. Use a key from console.anthropic.com (sk-ant-api03-…) in Settings or .env.local."
          : message,
      },
      { status: auth ? 401 : 502 },
    );
  }
}
