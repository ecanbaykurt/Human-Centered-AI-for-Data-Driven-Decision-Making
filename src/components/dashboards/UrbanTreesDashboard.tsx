"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Challenge } from "@/data/challenges";
import { urbanTreeCoverage } from "@/data/sampleData";
import DashboardShell, {
  CHART,
  Panel,
  StatCard,
  StatusPill,
} from "./DashboardShell";
import ChartFrame from "./ChartFrame";

export default function UrbanTreesDashboard({
  challenge,
}: {
  challenge: Challenge;
}) {
  const rows = urbanTreeCoverage;
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const chartData = useMemo(
    () =>
      [...rows]
        .sort((a, b) => b.canopyPct - a.canopyPct)
        .map((r) => ({
          neighborhood: r.neighborhood,
          canopy: r.canopyPct,
          trees: r.trees,
        })),
    [rows],
  );

  const totalTrees = rows.reduce((s, r) => s + r.trees, 0);
  const avgCanopy =
    rows.reduce((s, r) => s + r.canopyPct, 0) / Math.max(1, rows.length);
  const lowest = [...rows].sort((a, b) => a.canopyPct - b.canopyPct).slice(0, 3);
  const needsSurvey = rows.filter((r) => r.status === "Needs survey");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "All" && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.neighborhood.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
      );
    });
  }, [rows, query, statusFilter]);

  return (
    <DashboardShell
      challenge={challenge}
      title="Urban tree coverage"
      banner="Neighborhood tree counts and canopy percentages are fictional workshop samples. Inventory sources often exclude parks and private lots — missing coverage is expected."
    >
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Tree records"
          value={totalTrees.toLocaleString()}
          hint="Sum across sample neighborhoods"
        />
        <StatCard
          label="Avg canopy %"
          value={`${avgCanopy.toFixed(1)}%`}
          hint="Unweighted neighborhood average"
        />
        <StatCard
          label="Needs survey"
          value={needsSurvey.length}
          hint={needsSurvey.map((n) => n.neighborhood).join(", ") || "None"}
        />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Panel tag="Coverage" title="Canopy % by neighborhood">
          <ChartFrame className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke={CHART.border} vertical={false} />
                <XAxis
                  dataKey="neighborhood"
                  tick={{ fill: CHART.muted, fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: CHART.muted, fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  unit="%"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: CHART.border,
                    fontSize: 13,
                  }}
                  formatter={(value) => [`${value}%`, "Canopy"]}
                />
                <Bar
                  dataKey="canopy"
                  fill={CHART.purple}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </Panel>

        <Panel tag="Context" title="Population & area proxies">
          <p className="mb-3 text-[13px] leading-relaxed text-muted">
            Absolute tree counts ignore population density. These cards pair
            canopy with a population proxy so you can ask which areas might need
            more greening research.
          </p>
          <ul className="space-y-3">
            {rows
              .slice()
              .sort(
                (a, b) =>
                  a.trees / a.populationProxy - b.trees / b.populationProxy,
              )
              .slice(0, 4)
              .map((r) => (
                <li
                  key={r.neighborhood}
                  className="rounded-[12px] border border-border-soft bg-surface-input px-3 py-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-ink">
                      {r.neighborhood}
                    </span>
                    <span className="font-mono text-[11px] text-purple">
                      {(
                        (r.trees / r.populationProxy) *
                        1000
                      ).toFixed(1)}{" "}
                      trees / 1k
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-muted">
                    Pop. proxy {r.populationProxy.toLocaleString()} · canopy{" "}
                    {r.canopyPct}%
                  </p>
                </li>
              ))}
          </ul>
        </Panel>
      </div>

      <div className="mb-5">
        <h3 className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-purple">
          Missing coverage highlights
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {lowest.map((r) => (
            <div
              key={r.neighborhood}
              className="rounded-[14px] border border-[#cfe0c4] bg-[#f4fbe8] px-4 py-3.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-ink">{r.neighborhood}</span>
                <StatusPill tone="warn">{r.canopyPct}% canopy</StatusPill>
              </div>
              <p className="mt-1.5 text-[13px] text-muted">
                {r.trees} tree records · status {r.status}. Discuss whether
                parks, private lots, or survey gaps explain the low figure.
              </p>
            </div>
          ))}
        </div>
      </div>

      <Panel tag="Records" title="Tree inventory table">
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-[12px] font-bold">
            Search
            <input
              className="field-control"
              placeholder="Neighborhood or status"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-[12px] font-bold">
            Status
            <select
              className="field-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All</option>
              {challenge.statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-border bg-soft-purple/50">
                <th className="px-3 py-2.5 font-bold">Neighborhood</th>
                <th className="px-3 py-2.5 font-bold">Trees</th>
                <th className="px-3 py-2.5 font-bold">Canopy %</th>
                <th className="px-3 py-2.5 font-bold">Pop. proxy</th>
                <th className="px-3 py-2.5 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.neighborhood} className="border-b border-border-soft">
                  <td className="px-3 py-2.5 font-semibold">
                    {r.neighborhood}
                  </td>
                  <td className="px-3 py-2.5">{r.trees}</td>
                  <td className="px-3 py-2.5">{r.canopyPct}%</td>
                  <td className="px-3 py-2.5 text-muted">
                    {r.populationProxy.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusPill
                      tone={
                        r.status === "Needs survey"
                          ? "warn"
                          : r.status === "Closed"
                            ? "ok"
                            : "default"
                      }
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
