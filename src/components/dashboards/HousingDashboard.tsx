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
import { housingInquirySeries } from "@/data/sampleData";
import DashboardShell, {
  CHART,
  Panel,
  StatCard,
  StatusPill,
} from "./DashboardShell";
import ChartFrame, { monthLabel } from "./ChartFrame";

export default function HousingDashboard({
  challenge,
}: {
  challenge: Challenge;
}) {
  const rows = housingInquirySeries;
  const [neighborhood, setNeighborhood] = useState("All");
  const [query, setQuery] = useState("");

  const neighborhoods = useMemo(
    () => [...new Set(rows.map((r) => r.neighborhood))],
    [rows],
  );

  const byNeighborhood = useMemo(() => {
    const map = new Map<string, { inquiries: number; waitlist: number }>();
    rows.forEach((r) => {
      const cur = map.get(r.neighborhood) || { inquiries: 0, waitlist: 0 };
      cur.inquiries += r.inquiries;
      cur.waitlist += r.waitlist;
      map.set(r.neighborhood, cur);
    });
    return [...map.entries()]
      .map(([name, vals]) => ({ name, ...vals }))
      .sort((a, b) => b.inquiries - a.inquiries);
  }, [rows]);

  const trend = useMemo(() => {
    const dates = [...new Set(rows.map((r) => r.date))].sort();
    return dates.map((date) => {
      const point: Record<string, string | number> = {
        date: monthLabel(date),
      };
      neighborhoods.forEach((n) => {
        if (neighborhood !== "All" && n !== neighborhood) return;
        const row = rows.find(
          (r) => r.date === date && r.neighborhood === n,
        );
        point[n] = row?.inquiries ?? 0;
      });
      return point;
    });
  }, [rows, neighborhoods, neighborhood]);

  const latest = useMemo(() => {
    const maxDate = rows.reduce(
      (m, r) => (r.date > m ? r.date : m),
      rows[0]?.date ?? "",
    );
    return rows.filter((r) => r.date === maxDate);
  }, [rows]);

  const emerging = useMemo(() => {
    const firstDate = [...new Set(rows.map((r) => r.date))].sort()[0];
    return neighborhoods
      .map((n) => {
        const first = rows.find(
          (r) => r.neighborhood === n && r.date === firstDate,
        );
        const last = latest.find((r) => r.neighborhood === n);
        const growth =
          first && last
            ? Math.round(
                ((last.inquiries - first.inquiries) /
                  Math.max(1, first.inquiries)) *
                  100,
              )
            : 0;
        return {
          neighborhood: n,
          growth,
          inquiries: last?.inquiries ?? 0,
          waitlist: last?.waitlist ?? 0,
          status: last?.status ?? "Open",
        };
      })
      .sort((a, b) => b.growth - a.growth);
  }, [neighborhoods, rows, latest]);

  const filteredTable = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((r) => {
        if (neighborhood !== "All" && r.neighborhood !== neighborhood)
          return false;
        if (!q) return true;
        return (
          r.neighborhood.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q) ||
          r.date.includes(q)
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [rows, neighborhood, query]);

  const totalInquiries = byNeighborhood.reduce((s, r) => s + r.inquiries, 0);

  return (
    <DashboardShell
      challenge={challenge}
      title="Housing & community inquiries"
      banner="Sample inquiry and waitlist proxies. ACS-style estimates have margins of error — do not infer individual household need from aggregates alone."
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={`filter-pill ${neighborhood === "All" ? "active" : ""}`}
          aria-pressed={neighborhood === "All"}
          onClick={() => setNeighborhood("All")}
        >
          All neighborhoods
        </button>
        {neighborhoods.map((n) => (
          <button
            key={n}
            type="button"
            className={`filter-pill ${neighborhood === n ? "active" : ""}`}
            aria-pressed={neighborhood === n}
            onClick={() => setNeighborhood(n)}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total inquiries"
          value={totalInquiries.toLocaleString()}
          hint="Sum across months & neighborhoods"
        />
        <StatCard
          label="Fastest growth"
          value={emerging[0]?.neighborhood ?? "—"}
          hint={
            emerging[0]
              ? `+${emerging[0].growth}% vs first sample month`
              : undefined
          }
        />
        <StatCard
          label="Latest waitlist sum"
          value={latest
            .reduce((s, r) => s + r.waitlist, 0)
            .toLocaleString()}
          hint="Proxy queue size — not verified capacity"
        />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel tag="By area" title="Inquiries by neighborhood">
          <ChartFrame className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byNeighborhood}>
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
                <Legend />
                <Bar
                  dataKey="inquiries"
                  name="Inquiries"
                  fill={CHART.purple}
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="waitlist"
                  name="Waitlist"
                  fill={CHART.lavender}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </Panel>

        <Panel tag="Trend" title="Inquiries over time">
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
                {(neighborhood === "All" ? neighborhoods : [neighborhood]).map(
                  (n, i) => (
                    <Line
                      key={n}
                      type="monotone"
                      dataKey={n}
                      stroke={CHART.series[i % CHART.series.length]}
                      strokeWidth={2}
                      dot={false}
                    />
                  ),
                )}
              </LineChart>
            </ResponsiveContainer>
          </ChartFrame>
        </Panel>
      </div>

      <div className="mb-5">
        <h3 className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-purple">
          Emerging needs callouts
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {emerging.slice(0, 4).map((e) => (
            <div
              key={e.neighborhood}
              className="rounded-[14px] border border-[#ded5ff] bg-soft-purple px-4 py-3.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-ink">{e.neighborhood}</span>
                <StatusPill tone={e.growth > 20 ? "warn" : "default"}>
                  {e.growth >= 0 ? `+${e.growth}%` : `${e.growth}%`}
                </StatusPill>
              </div>
              <p className="mt-1.5 text-[13px] text-[#56478e]">
                Latest month: {e.inquiries} inquiries, waitlist proxy{" "}
                {e.waitlist}. Growth alone cannot confirm unmet need — check
                service capacity and referral pathways.
              </p>
            </div>
          ))}
        </div>
      </div>

      <Panel tag="Inquiries" title="Monthly inquiry records">
        <div className="mb-4">
          <label className="flex max-w-md flex-col gap-1.5 text-[12px] font-bold">
            Search
            <input
              className="field-control"
              placeholder="Neighborhood, status, date"
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
                <th className="px-3 py-2.5 font-bold">Neighborhood</th>
                <th className="px-3 py-2.5 font-bold">Inquiries</th>
                <th className="px-3 py-2.5 font-bold">Waitlist</th>
                <th className="px-3 py-2.5 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTable.slice(0, 24).map((r) => (
                <tr
                  key={`${r.date}-${r.neighborhood}`}
                  className="border-b border-border-soft"
                >
                  <td className="px-3 py-2.5 text-muted">{r.date}</td>
                  <td className="px-3 py-2.5 font-semibold">
                    {r.neighborhood}
                  </td>
                  <td className="px-3 py-2.5">{r.inquiries}</td>
                  <td className="px-3 py-2.5">{r.waitlist}</td>
                  <td className="px-3 py-2.5">
                    <StatusPill
                      tone={
                        r.status === "Referral"
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
