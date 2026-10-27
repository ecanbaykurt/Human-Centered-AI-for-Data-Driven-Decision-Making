"use client";

import { useEffect, useState } from "react";
import {
  getStoredApiKey,
  looksLikeAnthropicKey,
  maskApiKey,
  setStoredApiKey,
} from "@/lib/apiKey";

type ApiKeyPanelProps = {
  compact?: boolean;
  onSaved?: (hasKey: boolean) => void;
};

export default function ApiKeyPanel({ compact, onSaved }: ApiKeyPanelProps) {
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState("");
  const [show, setShow] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    const k = getStoredApiKey();
    setSaved(k);
    onSaved?.(Boolean(k));
  }, [onSaved]);

  function save() {
    const next = value.trim();
    if (next && !looksLikeAnthropicKey(next)) {
      setNote("Key usually starts with sk-ant- — check and try again.");
      return;
    }
    setStoredApiKey(next);
    setSaved(next);
    setValue("");
    setNote(next ? "Saved in this browser only." : "Key cleared.");
    onSaved?.(Boolean(next));
  }

  function clear() {
    setStoredApiKey("");
    setSaved("");
    setValue("");
    setNote("Key cleared from this browser.");
    onSaved?.(false);
  }

  return (
    <div
      className={
        compact
          ? "rounded-[14px] border border-border bg-surface p-4"
          : "rounded-[18px] border border-border bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6"
      }
    >
      <div className="eyebrow">
        <span className="eyebrow-dot" aria-hidden />
        Claude API
      </div>
      <h2
        className={
          compact
            ? "mt-2 text-base font-extrabold tracking-[-0.03em]"
            : "mt-2 text-xl font-extrabold tracking-[-0.03em]"
        }
      >
        Bring your own key
      </h2>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">
        Use a Console API key (usually{" "}
        <code className="font-mono text-[12px]">sk-ant-api03-…</code>
        ). Key stays in{" "}
        <code className="font-mono text-[12px]">localStorage</code> on this
        device and is sent only to{" "}
        <code className="font-mono text-[12px]">/api/clickops</code> and{" "}
        <code className="font-mono text-[12px]">/api/github-prompt</code>. Prefer{" "}
        <code className="font-mono text-[12px]">ANTHROPIC_API_KEY</code> in{" "}
        <code className="font-mono text-[12px]">.env.local</code> for deploy.
      </p>

      {saved ? (
        <p className="mt-3 rounded-lg bg-soft-purple px-3 py-2 text-[12px] font-semibold text-purple-deep">
          Active: {maskApiKey(saved)}
        </p>
      ) : (
        <p className="mt-3 rounded-lg bg-[#fff4d6] px-3 py-2 text-[12px] font-semibold text-[#8a6a12]">
          No browser key yet — paste below or set env.
        </p>
      )}

      <label className="mt-4 flex flex-col gap-1.5 text-[12px] font-bold">
        Anthropic API key
        <div className="flex gap-2">
          <input
            className="field-control font-mono text-[13px]"
            type={show ? "text" : "password"}
            autoComplete="off"
            spellCheck={false}
            placeholder="sk-ant-…"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <button
            type="button"
            className="shrink-0 rounded-lg border border-border px-3 text-[12px] font-bold"
            onClick={() => setShow((s) => !s)}
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="btn-primary text-[13px]" onClick={save}>
          Save key
        </button>
        <button
          type="button"
          className="rounded-full border border-border bg-surface px-4 py-2 text-[13px] font-bold"
          onClick={clear}
        >
          Clear
        </button>
        <a
          href="https://console.anthropic.com/settings/keys"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary px-2 py-2 text-[13px]"
        >
          Get key ↗
        </a>
      </div>
      {note ? (
        <p className="mt-2 text-[12px] text-muted" role="status">
          {note}
        </p>
      ) : null}
    </div>
  );
}
