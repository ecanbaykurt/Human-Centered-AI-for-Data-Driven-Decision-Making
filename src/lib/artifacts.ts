export type ExtractedArtifact = {
  language: string;
  code: string;
  filename: string;
};

const LANG_EXT: Record<string, string> = {
  html: "index.html",
  htm: "index.html",
  tsx: "Component.tsx",
  ts: "module.ts",
  jsx: "Component.jsx",
  js: "script.js",
  css: "styles.css",
  json: "schema.json",
  md: "NOTES.md",
  markdown: "NOTES.md",
};

/** Pull the largest fenced code block from a model reply. */
export function extractPrimaryArtifact(text: string): ExtractedArtifact | null {
  const re = /```([a-zA-Z0-9_-]*)\s*\n([\s\S]*?)```/g;
  let best: ExtractedArtifact | null = null;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const language = (match[1] || "txt").toLowerCase();
    const code = match[2].trim();
    if (!code) continue;
    const filename = LANG_EXT[language] ?? `artifact.${language || "txt"}`;
    const candidate = { language, code, filename };
    if (!best || candidate.code.length > best.code.length) best = candidate;
  }
  return best;
}

/** Clipboard with textarea fallback when document is unfocused / denied. */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function messageTextFromParts(
  parts: Array<{ type: string; text?: string }>,
): string {
  return parts
    .filter((p) => p.type === "text" && typeof p.text === "string")
    .map((p) => p.text as string)
    .join("");
}
