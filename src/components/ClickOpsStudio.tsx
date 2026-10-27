"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { Challenge } from "@/data/challenges";
import {
  clickOpsCategories,
  getClickOpsActions,
  buildActionUserMessage,
  type ClickOpsAction,
} from "@/data/clickOps";
import { getStoredApiKey } from "@/lib/apiKey";
import {
  downloadTextFile,
  extractPrimaryArtifact,
  messageTextFromParts,
} from "@/lib/artifacts";
import ApiKeyPanel from "@/components/ApiKeyPanel";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Loader2,
  Sparkles,
  Wand2,
} from "lucide-react";

type ClickOpsStudioProps = {
  challenge: Challenge;
};

function textOf(message: { parts?: Array<{ type: string; text?: string }> }) {
  return messageTextFromParts(message.parts ?? []);
}

export default function ClickOpsStudio({ challenge }: ClickOpsStudioProps) {
  const actions = useMemo(
    () => getClickOpsActions(challenge.slug),
    [challenge.slug],
  );
  const [filter, setFilter] = useState<string>("all");
  const [active, setActive] = useState<ClickOpsAction | null>(actions[0] ?? null);
  const [notes, setNotes] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [input, setInput] = useState("");
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    setHasKey(Boolean(getStoredApiKey()) || false);
  }, []);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/clickops",
        headers: () => {
          const key = getStoredApiKey();
          const h: Record<string, string> = {};
          if (key) h["x-anthropic-api-key"] = key;
          return h;
        },
        prepareSendMessagesRequest: ({ messages, id, body }) => ({
          body: {
            ...(body ?? {}),
            id,
            messages,
            slug: challenge.slug,
            actionId: activeRef.current?.id,
          },
        }),
      }),
    [challenge.slug],
  );

  const { messages, sendMessage, status, error, setMessages, stop } = useChat({
    transport,
  });

  const busy = status === "submitted" || status === "streaming";

  const filtered = useMemo(() => {
    if (filter === "all") return actions;
    return actions.filter((a) => a.category === filter);
  }, [actions, filter]);

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const lastText = lastAssistant ? textOf(lastAssistant) : "";
  const artifact = lastText ? extractPrimaryArtifact(lastText) : null;

  const runAction = useCallback(
    async (action: ClickOpsAction) => {
      setActive(action);
      if (!getStoredApiKey() && !hasKey) {
        // Still try — server may have ANTHROPIC_API_KEY
      }
      const text = buildActionUserMessage(challenge, action, notes);
      await sendMessage({ text });
    },
    [challenge, notes, sendMessage, hasKey],
  );

  async function onChatSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = input.trim();
    if (!t || busy) return;
    setInput("");
    await sendMessage({ text: t });
  }

  function copyArtifact() {
    if (!artifact) return;
    void navigator.clipboard.writeText(artifact.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function downloadArtifact() {
    if (!artifact) return;
    const name = `${challenge.slug}-${active?.id ?? "artifact"}-${artifact.filename}`;
    downloadTextFile(name, artifact.code);
  }

  function openHtmlPreview() {
    if (!artifact || artifact.language !== "html") return;
    const blob = new Blob([artifact.code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="border-b border-border/80 bg-[rgba(248,248,253,0.94)] backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-[4%] py-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href={`/challenge/${challenge.slug}`}
              className="text-[13px] font-bold text-purple no-underline hover:opacity-75"
            >
              ← Back to challenge
            </Link>
            <div className="eyebrow mt-3">
              <span className="eyebrow-dot" aria-hidden />
              ClickOps · Challenge {challenge.number}
            </div>
            <h1 className="mt-2 text-[clamp(28px,4vw,42px)] font-extrabold tracking-[-0.04em]">
              Build with Claude
            </h1>
            <p className="mt-2 max-w-[62ch] text-[14px] text-muted">
              {challenge.title} — tıkla, Claude üretsin: website, dashboard,
              şema, deploy checklist. API key ekle, aksiyon seç, çalıştır.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/dashboard/${challenge.slug}`}
              className="rounded-full border border-border bg-surface px-4 py-2.5 text-[13px] font-bold no-underline"
            >
              Preview dashboard
            </Link>
            <Link href="/settings" className="btn-primary text-[13px]">
              API key settings
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 px-[4%] py-6 lg:grid-cols-[300px_minmax(0,1fr)_minmax(280px,360px)]">
        {/* Actions */}
        <aside className="space-y-4">
          <ApiKeyPanel compact onSaved={setHasKey} />

          <div className="rounded-[16px] border border-border bg-surface p-4">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-purple">
              Actions
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <button
                type="button"
                className={`filter-pill !px-2.5 !py-1.5 text-[11px] ${filter === "all" ? "active" : ""}`}
                aria-pressed={filter === "all"}
                onClick={() => setFilter("all")}
              >
                All
              </button>
              {clickOpsCategories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`filter-pill !px-2.5 !py-1.5 text-[11px] ${filter === c.id ? "active" : ""}`}
                  aria-pressed={filter === c.id}
                  onClick={() => setFilter(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <ul className="mt-3 max-h-[52vh] space-y-2 overflow-y-auto pr-1">
              {filtered.map((action) => {
                const selected = active?.id === action.id;
                return (
                  <li key={action.id}>
                    <button
                      type="button"
                      onClick={() => setActive(action)}
                      className={`w-full rounded-[12px] border px-3 py-3 text-left transition ${
                        selected
                          ? "border-purple bg-soft-purple"
                          : "border-border bg-surface hover:border-purple/30"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-extrabold tracking-[-0.02em]">
                          {action.label}
                        </span>
                        <span className="font-mono text-[9px] uppercase tracking-wide text-muted">
                          {action.category}
                        </span>
                      </div>
                      <p className="mt-1 text-[12px] leading-snug text-muted">
                        {action.description}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Main run + chat */}
        <section className="min-w-0 space-y-4">
          <div className="rounded-[18px] border border-border bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-purple">
                  Selected
                </div>
                <h2 className="mt-1 text-xl font-extrabold tracking-[-0.03em]">
                  {active?.label ?? "Choose an action"}
                </h2>
                <p className="mt-1 text-[13px] text-muted">
                  {active?.description}
                </p>
              </div>
              <Sparkles className="h-5 w-5 text-purple" aria-hidden />
            </div>

            <label className="mt-4 flex flex-col gap-1.5 text-[12px] font-bold">
              Extra notes (optional)
              <textarea
                className="field-control min-h-[72px] resize-y"
                placeholder="Örn. Turkish copy, dark hero, include CSV upload…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-primary gap-2 text-[13px]"
                disabled={!active || busy}
                onClick={() => active && void runAction(active)}
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Running…
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" /> Run ClickOps
                  </>
                )}
              </button>
              {busy ? (
                <button
                  type="button"
                  className="rounded-full border border-border px-4 py-2.5 text-[13px] font-bold"
                  onClick={() => stop()}
                >
                  Stop
                </button>
              ) : null}
              <button
                type="button"
                className="rounded-full border border-border px-4 py-2.5 text-[13px] font-bold"
                onClick={() => setMessages([])}
                disabled={busy || messages.length === 0}
              >
                Clear chat
              </button>
            </div>

            {error ? (
              <p className="mt-3 rounded-lg bg-[#fde8e8] px-3 py-2 text-[13px] text-[#9b2c2c]">
                {error.message || "Request failed. Check API key and try again."}
              </p>
            ) : null}
          </div>

          <div className="flex min-h-[420px] flex-col rounded-[18px] border border-border bg-surface shadow-[var(--shadow-card)]">
            <div className="border-b border-border px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-purple">
              Conversation
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {messages.length === 0 ? (
                <p className="text-[13px] text-muted">
                  Soldan bir aksiyon seçip <strong>Run ClickOps</strong> de — Claude
                  website HTML, dashboard kodu veya checklist üretir.
                </p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-[12px] px-3.5 py-3 text-[13px] leading-relaxed ${
                      m.role === "user"
                        ? "ml-8 bg-soft-purple text-ink"
                        : "mr-4 border border-border bg-[#fbfaff]"
                    }`}
                  >
                    <div className="mb-1 font-mono text-[9px] font-bold uppercase tracking-wide text-purple">
                      {m.role === "user" ? "You" : "Claude"}
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-[13px]">
                      {textOf(m)}
                    </pre>
                  </div>
                ))
              )}
              {busy ? (
                <div className="flex items-center gap-2 text-[12px] font-semibold text-purple">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Claude çalışıyor…
                </div>
              ) : null}
            </div>
            <form
              onSubmit={onChatSubmit}
              className="flex gap-2 border-t border-border p-3"
            >
              <input
                className="field-control"
                placeholder="Follow-up: make the hero shorter, add Turkish…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={busy}
              />
              <button
                type="submit"
                className="btn-primary shrink-0 text-[13px]"
                disabled={busy || !input.trim()}
              >
                Send
              </button>
            </form>
          </div>
        </section>

        {/* Artifact */}
        <aside className="space-y-4">
          <div className="rounded-[18px] border border-border bg-dark-strip p-5 text-white">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-lime">
              Artifact
            </div>
            <h3 className="mt-2 text-lg font-extrabold tracking-[-0.03em]">
              {artifact
                ? `${artifact.language.toUpperCase()} ready`
                : "Henüz çıktı yok"}
            </h3>
            <p className="mt-2 text-[12px] leading-relaxed text-white/70">
              Claude cevabındaki en büyük kod bloğu burada toplanır. HTML ise
              tarayıcıda önizle; diğerlerini indir.
            </p>
            {artifact ? (
              <div className="mt-4 space-y-2">
                <p className="font-mono text-[11px] text-lime">{artifact.filename}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full bg-lime px-3 py-2 text-[12px] font-bold text-lime-text"
                    onClick={downloadArtifact}
                  >
                    <Download className="h-3.5 w-3.5" /> Download
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-2 text-[12px] font-bold"
                    onClick={copyArtifact}
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  {artifact.language === "html" ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-2 text-[12px] font-bold"
                      onClick={openHtmlPreview}
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Preview
                    </button>
                  ) : null}
                </div>
                <pre className="mt-3 max-h-[280px] overflow-auto rounded-xl bg-black/35 p-3 font-mono text-[10px] leading-relaxed text-white/85">
                  {artifact.code.slice(0, 4000)}
                  {artifact.code.length > 4000 ? "\n…" : ""}
                </pre>
              </div>
            ) : (
              <p className="mt-4 text-[12px] text-white/55">
                Run <em>Build website</em> or a project-specific action to generate
                a downloadable file.
              </p>
            )}
          </div>

          <div className="rounded-[16px] border border-border bg-surface p-4 text-[12px] leading-relaxed text-muted">
            <strong className="text-ink">Quick path</strong>
            <ol className="mt-2 list-decimal space-y-1 pl-4">
              <li>Save Claude API key</li>
              <li>Pick ClickOps action</li>
              <li>Run → download HTML / open preview</li>
              <li>Follow-up in chat to refine</li>
            </ol>
            <Link
              href={`/challenge/${challenge.slug}`}
              className="btn-secondary mt-3 inline-flex text-[12px]"
            >
              Challenge brief →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
