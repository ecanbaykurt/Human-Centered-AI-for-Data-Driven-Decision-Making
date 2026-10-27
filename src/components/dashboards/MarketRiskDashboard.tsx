"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Challenge } from "@/data/challenges";
import { marketRiskSeries } from "@/data/sampleData";
import DashboardShell, {
  CHART,
  Panel,
  StatCard,
  StatusPill,
} from "./DashboardShell";
import ChartFrame, { monthLabel } from "./ChartFrame";

const FOCUS = ["Liquidity", "Activity", "Profitability"] as const;

export default function MarketRiskDashboard({
  challenge,
}: {
  challenge: Challenge;
}) {
  const series = marketRiskSeries;
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [query, setQuery] = useState("");

  const multiSeries = useMemo(() => {
    const dates = [...new Set(series.map((r) => r.date))].sort();
    return dates.map((date) => {
      const point: Record<string, string | number> = {
        date: monthLabel(date, true),
      };
      FOCUS.forEach((cat) => {
        const row = series.find((r) => r.date === date && r.category === cat);
        point[cat] = row?.value ?? 0;
      });
      return point;
    });
  }, [series]);

  const latestScores = useMemo(() => {
    const maxDate = series.reduce(
      (m, r) => (r.date > m ? r.date : m),
      series[0]?.date ?? "",
    );
    return challenge.categories.map((cat) => {
      const row = series.find((r) => r.date === maxDate && r.category === cat);
      return {
        category: cat,
        value: row?.value ?? 0,
        change: row?.change ?? 0,
        status: row?.status ?? "Closed",
      };
    });
  }, [series, challenge.categories]);

  const flagged = latestScores.filter((s) => s.status === "Flagged");

  const tableRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return series
      .filter((r) => {
        if (categoryFilter !== "All" && r.category !== categoryFilter)
          return false;
        if (!q) return true;
        return (
          r.category.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q) ||
          r.date.includes(q)
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date) || a.category.localeCompare(b.category));
  }, [series, categoryFilter, query]);

  return (
    <DashboardShell
      challenge={challenge}
      title="Market & risk indicators"
      banner="Historical-style indicator scores for exploration only. Changes flagged here are not trading signals or credit decisions."
    >
      <Panel tag="Context first" title="Read before interpreting">
        <p className="text-[14px] leading-relaxed text-muted">
          These series compress many accounting ratios into simplified workshop
          scores. Seasonality, reporting lags, and industry mix can move the
          lines without a real risk event. Always pair charts with footnotes,
          peer context, and a human reviewer before escalating.
        </p>
      </Panel>

      <div className="my-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {latestScores.map((s) => (
          <div
            key={s.category}
            className="rounded-[16px] border border-border bg-surface p-5 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-purple">
                {s.category}
              </div>
              <StatusPill tone={s.status === "Flagged" ? "danger" : "ok"}>
                {s.status}
              </StatusPill>
            </div>
            <div className="mt-2 text-[32px] font-extrabold tracking-[-0.04em]">
              {s.value}
            </div>
            <p className="mt-1 text-[12px] text-muted">
              MoM change{" "}
              <span
                className={
                  Math.abs(s.change) > 3
                    ? "font-bold text-[#9b2c2c]"
                    : "font-semibold text-ink"
                }
              >
                {s.change > 0 ? `+${s.change}` : s.change}
              </span>
            </p>
          </div>
        ))}
      </div>

      {flagged.length > 0 ? (
        <div className="mb-5 rounded-[14px] border border-[#f0c4c4] bg-[#fdf2f2] px-4 py-3.5 text-[13px] text-[#7a2e2e]">
          <strong>Human review suggested:</strong>{" "}
          {flagged.map((f) => f.category).join(", ")} moved beyond the sample
          change threshold. Confirm data quality and business context before
          acting.
        </div>
      ) : null}

      <Panel
        tag="Multi-series"
        title="Liquidity · Activity · Profitability over time"
        className="mb-5"
      >
        <ChartFrame className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={multiSeries}>
              <CartesianGrid stroke={CHART.border} vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: CHART.muted, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: CHART.muted, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  borderColor: CHART.border,
                  fontSize: 13,
                }}
              />
              <Legend />
              {FOCUS.map((cat, i) => (
                <Line
                  key={cat}
                  type="monotone"
                  dataKey={cat}
                  stroke={CHART.series[i]}
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartFrame>
      </Panel>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Latest liquidity"
          value={latestScores.find((s) => s.category === "Liquidity")?.value ?? "—"}
          hint="Higher is not always safer — check definitions"
        />
        <StatCard
          label="Latest activity"
          value={latestScores.find((s) => s.category === "Activity")?.value ?? "—"}
          hint="Turnover-style sample score"
        />
        <StatCard
          label="Latest profitability"
          value={
            latestScores.find((s) => s.category === "Profitability")?.value ??
            "—"
          }
          hint="Margin-style sample score"
        />
      </div>

      <Panel tag="Indicators" title="Indicator table">
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-[12px] font-bold">
            Category
            <select
              className="field-control"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All</option>
              {challenge.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-[12px] font-bold">
            Search
            <input
              className="field-control"
              placeholder="Category, status, date"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-border bg-soft-purple/50">
                <th className="px-3 py-2.5 font-bold">Date</th>
                <th className="px-3 py-2.5 font-bold">Category</th>
                <th className="px-3 py-2.5 font-bold">Score</th>
                <th className="px-3 py-2.5 font-bold">Change</th>
                <th className="px-3 py-2.5 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.slice(0, 32).map((r) => (
                <tr
                  key={`${r.date}-${r.category}`}
                  className="border-b border-border-soft"
                >
                  <td className="px-3 py-2.5 text-muted">{r.date}</td>
                  <td className="px-3 py-2.5 font-semibold">{r.category}</td>
                  <td className="px-3 py-2.5">{r.value}</td>
                  <td className="px-3 py-2.5">
                    {r.change > 0 ? `+${r.change}` : r.change}
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusPill
                      tone={r.status === "Flagged" ? "danger" : "ok"}
                    >
                      {r.status}
                    </StatusPill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </DashboardShell>
  );
}
