"use client";

import { useEffect, useState, type ReactNode } from "react";

/** Recharts ResponsiveContainer needs a laid-out client box; defer until mount. */
export default function ChartFrame({
  children,
  className = "h-[260px] w-full",
}: {
  children: ReactNode;
  className?: string;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div
        className={`${className} animate-pulse rounded-xl bg-soft-purple/60`}
        aria-hidden
      />
    );
  }

  return <div className={className}>{children}</div>;
}

const MONTHS = [
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
] as const;

/** Stable labels — avoids SSR/client locale hydration mismatches. */
export function monthLabel(date: string, withYear = false) {
  const [y, m] = date.split("-");
  const month = MONTHS[Math.max(0, Number(m) - 1)] ?? m;
  if (!withYear) return month;
  return `${month} ${String(y).slice(2)}`;
}
