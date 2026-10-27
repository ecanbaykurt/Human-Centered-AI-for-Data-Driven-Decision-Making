"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { GuideStep } from "@/data/projectNotes";

type SmartGuideProps = {
  title?: string;
  subtitle?: string;
  steps: GuideStep[];
  storageKey?: string;
};

export default function SmartGuide({
  title = "Smart guide",
  subtitle = "Step through squares — lights show where you are and what you’ve completed.",
  steps,
  storageKey,
}: SmartGuideProps) {
  const [active, setActive] = useState(0);
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, boolean>;
      setDone(parsed);
      const firstOpen = steps.findIndex((s) => !parsed[s.id]);
      if (firstOpen >= 0) setActive(firstOpen);
    } catch {
      /* ignore */
    }
  }, [storageKey, steps]);

  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(done));
    } catch {
      /* ignore */
    }
  }, [done, storageKey]);

  const current = steps[active];
  const completedCount = steps.filter((s) => done[s.id]).length;

  function markDone() {
    if (!current) return;
    setDone((prev) => ({ ...prev, [current.id]: true }));
    if (active < steps.length - 1) setActive(active + 1);
  }

  function reset() {
    setDone({});
    setActive(0);
  }

  return (
    <section
      id="smart-guide"
      className="scroll-mt-24 rounded-[20px] border border-border bg-surface p-5 shadow-[var(--shadow-card)] sm:p-7"
      aria-labelledby="smart-guide-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-dot" aria-hidden />
            Guided path
          </div>
          <h2
            id="smart-guide-title"
            className="mt-2 text-[clamp(24px,3.5vw,32px)] font-extrabold tracking-[-0.04em] text-ink"
          >
            {title}
          </h2>
          <p className="mt-2 max-w-[52ch] text-[14px] leading-relaxed text-muted">
            {subtitle}
          </p>
        </div>
        <div className="rounded-[14px] border border-[#ded5ff] bg-soft-purple px-4 py-3 text-right">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-purple">
            Progress
          </div>
          <div className="mt-1 text-[22px] font-extrabold tracking-[-0.04em] text-ink">
            {completedCount}/{steps.length}
          </div>
          <button
            type="button"
            className="mt-1 text-[11px] font-bold text-purple hover:opacity-75"
            onClick={reset}
          >
            Reset lights
          </button>
        </div>
      </div>

      {/* Square path with lights */}
      <ol className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {steps.map((step, i) => {
          const isActive = i === active;
          const isDone = Boolean(done[step.id]);
          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => setActive(i)}
                className={`group relative flex w-full flex-col items-start rounded-[16px] border-2 p-3.5 text-left transition ${
                  isActive
                    ? "border-purple bg-soft-purple shadow-[0_0_0_4px_rgba(116,80,232,0.12)]"
                    : isDone
                      ? "border-[#b8e08a] bg-[#f4fbe8]"
                      : "border-border bg-[#fbfaff] hover:border-purple/35"
                }`}
                aria-current={isActive ? "step" : undefined}
              >
                <span className="mb-3 flex w-full items-center justify-between">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-[10px] font-mono text-[12px] font-bold ${
                      isActive
                        ? "bg-purple text-white"
                        : isDone
                          ? "bg-[#d7fb52] text-lime-text"
                          : "bg-[#eceaf5] text-muted"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`guide-light ${isDone ? "is-on-lime" : ""} ${isActive ? "is-on-purple" : ""}`}
                    title={isDone ? "Completed" : isActive ? "Current" : "Upcoming"}
                    aria-hidden
                  />
                </span>
                <span className="text-[13px] font-extrabold leading-snug tracking-[-0.02em] text-ink">
                  {step.title}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Active step detail */}
      {current ? (
        <div className="mt-6 rounded-[16px] border border-border bg-[#fbfaff] p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="guide-light is-on-purple" aria-hidden />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-purple">
              Step {String(active + 1).padStart(2, "0")} · Live
            </span>
            {done[current.id] ? (
              <span className="rounded-full bg-[#d7fb52] px-2.5 py-1 font-mono text-[9px] font-bold uppercase text-lime-text">
                Light on · done
              </span>
            ) : null}
          </div>
          <h3 className="mt-3 text-xl font-extrabold tracking-[-0.03em] text-ink">
            {current.title}
          </h3>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            {current.detail}
          </p>
          <p className="mt-3 rounded-[12px] border border-[#ded5ff] bg-soft-purple/70 px-3.5 py-2.5 text-[13px] leading-relaxed text-[#56478e]">
            <strong className="text-purple-deep">Tip.</strong> {current.tip}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {current.href ? (
              <Link href={current.href} className="btn-primary text-[13px]">
                {current.hrefLabel ?? "Continue →"}
              </Link>
            ) : null}
            <button
              type="button"
              className="inline-flex items-center rounded-full border border-border bg-surface px-4 py-2.5 text-[13px] font-bold"
              onClick={markDone}
            >
              {done[current.id] ? "Mark again & next →" : "Light this square · Next →"}
            </button>
            <button
              type="button"
              className="btn-secondary px-2 py-2 text-[13px]"
              disabled={active === 0}
              onClick={() => setActive((a) => Math.max(0, a - 1))}
            >
              ← Back
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
