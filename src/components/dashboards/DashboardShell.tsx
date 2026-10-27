"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import type { Challenge } from "@/data/challenges";
import { projectPath } from "@/data/github";
import CopyGithubButton from "@/components/CopyGithubButton";

export const CHART = {
  purple: "#7450e8",
  purpleDeep: "#6540d6",
  lime: "#d7fb52",
  ink: "#17152b",
  muted: "#626278",
  border: "#e1e0ec",
  soft: "#eeeaff",
  lavender: "#e8e3fb",
  series: ["#7450e8", "#9b7ef0", "#b8a4f5", "#6540d6", "#d7fb52", "#88a58b"],
} as const;

type DashboardShellProps = {
  challenge: Challenge;
  title?: string;
  banner?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export default function DashboardShell({
  challenge,
  title,
  banner = "Fictional sample data for workshop learning. Totals and averages are illustrative — verify definitions before using real data.",
  actions,
  children,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="border-b border-border/80 bg-[rgba(248,248,253,0.94)] backdrop-blur-md">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-[5%] py-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <Link
              href={`/challenge/${challenge.slug}`}
              className="inline-flex items-center gap-1.5 text-[13px] font-bold text-purple no-underline transition-opacity hover:opacity-75"
            >
              ← Back to challenge
            </Link>
            <div className="eyebrow mt-3">
              <span className="eyebrow-dot" aria-hidden />
              {challenge.category} / Challenge {challenge.number}
            </div>
            <h1 className="mt-2 text-[clamp(28px,4vw,40px)] font-extrabold tracking-[-0.04em] text-ink">
              {title ?? challenge.name}
            </h1>
            <p className="mt-1 font-mono text-[11px] text-muted">
              {projectPath(challenge.slug)}/
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <CopyGithubButton challenge={challenge} label="Copy GitHub" />
            <Link
              href={`/ops/${challenge.slug}`}
              className="inline-flex items-center rounded-full bg-dark-strip px-4 py-2.5 text-[13px] font-bold text-lime no-underline hover:opacity-90"
            >
              ClickOps · Claude →
            </Link>
            {actions}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] px-[5%] pt-5">
        <div className="rounded-[14px] border border-[#ded5ff] bg-soft-purple px-4 py-3.5 text-[13px] leading-relaxed text-[#56478e]">
          <strong className="font-bold text-purple-deep">Demo data.</strong>{" "}
          {banner}
        </div>
      </div>

      <main className="mx-auto max-w-[1280px] px-[5%] py-6 pb-16">
        {children}
      </main>
    </div>
  );
}

export function Panel({
  tag,
  title,
  children,
  className = "",
  action,
}: {
  tag?: string;
  title: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section
      className={`rounded-[16px] border border-border bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6 ${className}`}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          {tag ? (
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-purple">
              {tag}
            </div>
          ) : null}
          <h2 className="mt-1 text-lg font-extrabold tracking-[-0.03em] text-ink">
            {title}
          </h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-[16px] border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-purple">
        {label}
      </div>
      <div className="mt-2 text-[32px] font-extrabold tracking-[-0.04em] text-ink">
        {value}
      </div>
      {hint ? (
        <p className="mt-1 text-[12px] leading-relaxed text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function StatusPill({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "warn" | "ok" | "danger" | "lime";
}) {
  const tones: Record<string, string> = {
    default: "bg-soft-purple text-purple-deep",
    warn: "bg-[#fff4d6] text-[#8a6a12]",
    ok: "bg-[#e8f6e8] text-[#2d6a3e]",
    danger: "bg-[#fde8e8] text-[#9b2c2c]",
    lime: "bg-lime text-lime-text",
  };
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/** Stable month labels (avoids SSR/client locale hydration mismatch). */
export function monthLabel(date: string, withYear = false) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const parts = date.slice(0, 10).split("-");
  const month = Number(parts[1] || 1) - 1;
  const year = (parts[0] || "").slice(2);
  const base = months[Math.max(0, Math.min(11, month))] || "Jan";
  return withYear && year ? `${base} ${year}` : base;
}

/** Mount Recharts only after layout so ResponsiveContainer gets real width. */
export function ChartFrame({
  children,
  height = 260,
}: {
  children: ReactNode;
  height?: number;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="w-full" style={{ height }} aria-busy={!ready}>
      {ready ? (
        children
      ) : (
        <div className="flex h-full items-center justify-center rounded-xl bg-soft-purple/40 text-[12px] font-semibold text-muted">
          Loading chart…
        </div>
      )}
    </div>
  );
}
