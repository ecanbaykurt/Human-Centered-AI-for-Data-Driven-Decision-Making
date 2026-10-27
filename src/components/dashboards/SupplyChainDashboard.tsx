"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
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
import { generateSampleRows } from "@/data/sampleData";
import DashboardShell, {
  CHART,
  Panel,
  StatCard,
  StatusPill,
} from "./DashboardShell";
import ChartFrame, { monthLabel } from "./ChartFrame";

export default function SupplyChainDashboard({
  challenge,
}: {
  challenge: Challenge;
}) {
  const rows = useMemo(() => generateSampleRows(challenge), [challenge]);
  const [location, setLocation] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (location !== "All" && r.category !== location) return false;
      if (!q) return true;
      return (
        r.category.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q) ||
        r.date.includes(q)
      );
    });
  }, [rows, location, query]);

  const totalUnits = filtered.reduce((s, r) => s + r.value, 0);
  const locations = new Set(filtered.map((r) => r.category)).size;
  const avg = filtered.length ? totalUnits / filtered.length : 0;

  const byLocation = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((r) => {
      map.set(r.category, (map.get(r.category) || 0) + r.value);
    });
    return [...map.entries()]
      .map(([name, units]) => ({ name, units }))
      .sort((a, b) => b.units - a.units);
  }, [filtered]);

  const monthlyTrend = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((r) => {
      map.set(r.date, (map.get(r.date) || 0) + r.value);
    });
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, units]) => ({ date: monthLabel(date, true), units }));
  }, [filtered]);

  const watchRows = useMemo(() => {
    const latestByCat = new Map<string, (typeof rows)[0]>();
    rows.forEach((r) => {
      const prev = latestByCat.get(r.category);
      if (!prev || r.date > prev.date) latestByCat.set(r.category, r);
    });
    return [...latestByCat.values()]
      .map((r) => {
        const catRows = rows.filter((x) => x.category === r.category);
        const avgCat =
          catRows.reduce((s, x) => s + x.value, 0) / Math.max(1, catRows.length);
        const gap = avgCat - r.value;
        return {
          ...r,
          avg: Math.round(avgCat),
          gap: Math.round(gap),
          watch: r.status === "Watch" || gap > avgCat * 0.12,
        };
      })
      .sort((a, b) => Number(b.watch) - Number(a.watch) || b.gap - a.gap);
  }, [rows]);

  return (
    <DashboardShell
      challenge={challenge}
      title="Demand & replenishment"
      banner="Fictional monthly units by location. Use the forecast lab to compare baseline models — this view does not predict inventory automatically."
      actions={
        <Link href="/forecast" className="btn-primary text-[13px]">
          Open forecast lab ↗
        </Link>
      }
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1.5 text-[12px] font-bold">
          Location
          <select
            className="field-control"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="All">All locations</option>
            {challenge.categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-[1.4] flex-col gap-1.5 text-[12px] font-bold">
          Search
          <input
            className="field-control"
            placeholder="Filter by location, status, date"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total units"
          value={totalUnits.toLocaleString()}
          hint={challenge.measure}
        />
        <StatCard
          label="Locations in view"
          value={locations}
          hint="Distinct locations after filters"
        />
        <StatCard
          label="Avg per record"
          value={avg.toFixed(1)}
          hint={`${challenge.unit} / monthly record`}
        />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel tag="Demand" title="Units by location">
          <ChartFrame>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byLocation} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={CHART.border} vertical={false} />
                <XAxis
                  dataKey="name"
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
                <Bar dataKey="units" fill={CHART.purple} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </Panel>

        <Panel tag="Trend" title="Monthly demand">
          <ChartFrame>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
                <Line
                  type="monotone"
                  dataKey="units"
                  name="Units"
                  stroke={CHART.purpleDeep}
                  strokeWidth={2.5}
                  dot={{ fill: CHART.purple, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartFrame>
        </Panel>
      </div>

      <Panel
        tag="Replenishment"
        title="Watch list by location"
        action={
          <Link
            href="/forecast"
            className="text-[13px] font-bold text-purple-deep no-underline hover:opacity-80"
          >
            Compare forecast models →
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-border bg-soft-purple/50">
                <th className="px-3 py-2.5 font-bold">Location</th>
                <th className="px-3 py-2.5 font-bold">Latest month</th>
                <th className="px-3 py-2.5 font-bold">Units</th>
                <th className="px-3 py-2.5 font-bold">6-mo avg</th>
                <th className="px-3 py-2.5 font-bold">Gap</th>
                <th className="px-3 py-2.5 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {watchRows.map((r) => (
                <tr key={r.category} className="border-b border-border-soft">
                  <td className="px-3 py-2.5 font-semibold">{r.category}</td>
                  <td className="px-3 py-2.5 text-muted">{monthLabel(r.date)}</td>
                  <td className="px-3 py-2.5">{r.value}</td>
                  <td className="px-3 py-2.5">{r.avg}</td>
                  <td className="px-3 py-2.5">{r.gap > 0 ? `↓ ${r.gap}` : "—"}</td>
                  <td className="px-3 py-2.5">
                    <StatusPill tone={r.watch ? "warn" : "ok"}>
                      {r.watch ? "Watch" : r.status}
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
