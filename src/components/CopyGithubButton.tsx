"use client";

import { useState } from "react";
import { Check, Copy, FolderGit2, Loader2 } from "lucide-react";
import type { Challenge } from "@/data/challenges";
import type { ProjectBriefFields } from "@/data/github";
import { getStoredApiKey } from "@/lib/apiKey";

type CopyGithubButtonProps = {
  challenge: Challenge;
  fields?: ProjectBriefFields;
  className?: string;
  label?: string;
  variant?: "primary" | "dark" | "secondary";
  /** Prefer Claude customization (default true) */
  useClaude?: boolean;
  onCopied?: (prompt: string) => void;
};

export default function CopyGithubButton({
  challenge,
  fields,
  className = "",
  label = "Copy GitHub",
  variant = "primary",
  useClaude = true,
  onCopied,
}: CopyGithubButtonProps) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [note, setNote] = useState("");

  const baseClass =
    variant === "dark"
      ? "inline-flex items-center justify-center gap-2 rounded-full bg-dark-strip px-4 py-2.5 text-[13px] font-bold text-lime"
      : variant === "secondary"
        ? "btn-secondary gap-2 text-[13px]"
        : "btn-primary gap-2 text-[13px]";

  async function copy() {
    setBusy(true);
    setNote("");
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      const key = getStoredApiKey();
      if (key) headers["x-anthropic-api-key"] = key;

      const res = await fetch("/api/github-prompt", {
        method: "POST",
        headers,
        body: JSON.stringify({
          slug: challenge.slug,
          fields: {
            project: fields?.project || challenge.name,
            audience: fields?.audience,
            problem: fields?.problem || challenge.suggestion || challenge.problem,
            data: fields?.data,
            goals: fields?.goals || challenge.ideas.join("; "),
            source: fields?.source,
            model: fields?.model,
          },
          fallbackOnly: useClaude === false,
        }),
      });

      const data = (await res.json()) as {
        prompt?: string;
        warning?: string;
        path?: string;
        error?: string;
      };

      if (!data.prompt) {
        throw new Error(data.error || "No prompt returned");
      }

      await navigator.clipboard.writeText(data.prompt);
      setCopied(true);
      onCopied?.(data.prompt);
      setNote(
        data.warning
          ? data.warning
          : `Copied · paste into Cursor Agent. Path: ${data.path}/`,
      );
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error(err);
      setNote(
        err instanceof Error
          ? err.message
          : "Copy failed. Check API key / network.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        className={baseClass}
        disabled={busy}
        onClick={() => void copy()}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : copied ? (
          <Check className="h-4 w-4" />
        ) : (
          <span className="inline-flex items-center gap-1.5">
            <FolderGit2 className="h-4 w-4" />
            <Copy className="h-3.5 w-3.5 opacity-80" />
          </span>
        )}
        {busy ? "Building prompt…" : copied ? "Copied!" : label}
      </button>
      {note ? (
        <p className="mt-2 max-w-[42ch] text-[11px] leading-snug text-muted" role="status">
          {note}
        </p>
      ) : null}
    </div>
  );
}
