"use client";

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
import { sustainabilityByLocation } from "@/data/sampleData";
import DashboardShell, {
  CHART,
  Panel,
  StatCard,
  StatusPill,
} from "./DashboardShell";
import ChartFrame, { monthLabel } from "./ChartFrame";

type Metric = "electricity" | "water" | "waste";

export default function SustainabilityDashboard({
  challenge,
}: {
  challenge: Challenge;
}) {
  const rows = sustainabilityByLocation;
  const [metric, setMetric] = useState<Metric>("electricity");
  const [site, setSite] = useState("All");

  const sites = useMemo(
    () => [...new Set(rows.map((r) => r.location))],
    [rows],
  );

  const byLocation = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((r) => {
      if (site !== "All" && r.location !== site) return;
      map.set(r.location, (map.get(r.location) || 0) + r[metric]);
    });
    return [...map.entries()]
      .map(([location, total]) => ({ location, total }))
      .sort((a, b) => b.total - a.total);
  }, [rows, metric, site]);

  const trend = useMemo(() => {
    const dates = [...new Set(rows.map((r) => r.date))].sort();
    return dates.map((date) => {
      const point: Record<string, string | number> = {
        date: monthLabel(date),
      };
      sites.forEach((loc) => {
        if (site !== "All" && loc !== site) return;
        const row = rows.find((r) => r.date === date && r.location === loc);
        point[loc] = row?.[metric] ?? 0;
      });
      return point;
    });
  }, [rows, sites, metric, site]);

  const latest = useMemo(() => {
    const maxDate = rows.reduce(
      (m, r) => (r.date > m ? r.date : m),
      rows[0]?.date ?? "",
    );
    return rows.filter((r) => r.date === maxDate);
  }, [rows]);

  const totals = latest.reduce(
    (acc, r) => ({
      electricity: acc.electricity + r.electricity,
      water: acc.water + r.water,
      waste: acc.waste + r.waste,
    }),
    { electricity: 0, water: 0, waste: 0 },
  );

  const reviewSites = latest.filter((r) => r.status === "Review");

  return (
    <DashboardShell
      challenge={challenge}
      title="Resource use by location"
      banner="Proxy resource metrics for learning. This measure leaves out supply-chain emissions, land use, and commuting — treat comparisons as starting points for investigation, not scores."
    >
      <div className="mb-5 flex flex-wrap gap-2">
        {(
          [
            ["electricity", "Electricity"],
            ["water", "Water"],
            ["waste", "Waste"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`filter-pill ${metric === key ? "active" : ""}`}
            aria-pressed={metric === key}
            onClick={() => setMetric(key)}
          >
            {label}
          </button>
        ))}
        <select
          className="field-control ml-auto w-auto min-w-[160px] py-2"
          value={site}
          onChange={(e) => setSite(e.target.value)}
          aria-label="Filter location"
        >
          <option value="All">All sites</option>
          {sites.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Latest electricity"
          value={totals.electricity.toLocaleString()}
          hint="Sum across sites (sample units)"
        />
        <StatCard
          label="Latest water"
          value={totals.water.toLocaleString()}
          hint="Sum across sites (sample units)"
        />
        <StatCard
          label="Latest waste"
          value={totals.waste.toLocaleString()}
          hint="Sum across sites (sample units)"
        />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel
          tag="Comparison"
          title={`${metric[0].toUpperCase()}${metric.slice(1)} by location`}
        >
          <ChartFrame className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byLocation}>
                <CartesianGrid stroke={CHART.border} vertical={false} />
                <XAxis
                  dataKey="location"
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
                <Bar
                  dataKey="total"
                  fill={CHART.purple}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </Panel>

        <Panel tag="Trend" title="Change over time">
          <ChartFrame className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
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
                {(site === "All" ? sites : [site]).map((loc, i) => (
                  <Line
                    key={loc}
                    type="monotone"
                    dataKey={loc}
                    stroke={CHART.series[i % CHART.series.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartFrame>
        </Panel>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {latest.map((r) => (
          <div
            key={r.location}
            className="rounded-[16px] border border-border bg-surface p-4 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="font-bold text-ink">{r.location}</div>
              <StatusPill tone={r.status === "Review" ? "warn" : "default"}>
                {r.status}
              </StatusPill>
            </div>
            <dl className="mt-3 space-y-1.5 text-[12px] text-muted">
              <div className="flex justify-between">
                <dt>Electricity</dt>
                <dd className="font-semibold text-ink">{r.electricity}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Water</dt>
                <dd className="font-semibold text-ink">{r.water}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Waste</dt>
                <dd className="font-semibold text-ink">{r.waste}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      <Panel tag="Caveats" title="What this measure leaves out">
        <ul className="space-y-2 text-[14px] leading-relaxed text-muted">
          <li>
            · Facility meters do not capture upstream manufacturing, freight, or
            employee commuting.
          </li>
          <li>
            · Site size and operating hours differ — raw totals are not intensity
            scores. Normalize before ranking.
          </li>
          <li>
            · “Review” flags are heuristic thresholds on sample data
            {reviewSites.length
              ? ` (currently ${reviewSites.map((s) => s.location).join(", ")})`
              : ""}
            — investigate with site managers before acting.
          </li>
          <li>
            · Source proxy: {challenge.source.name}. Confirm license and whether
            the schema matches your organization’s definitions.
          </li>
        </ul>
      </Panel>
    </DashboardShell>
  );
}
