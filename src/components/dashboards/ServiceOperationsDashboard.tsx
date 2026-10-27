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
import {
  generateSampleRows,
  serviceFieldTickets,
} from "@/data/sampleData";
import DashboardShell, {
  CHART,
  Panel,
  StatCard,
  StatusPill,
} from "./DashboardShell";
import ChartFrame from "./ChartFrame";

export default function ServiceOperationsDashboard({
  challenge,
}: {
  challenge: Challenge;
}) {
  const volumeRows = useMemo(() => generateSampleRows(challenge), [challenge]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [query, setQuery] = useState("");

  const tickets = serviceFieldTickets;

  const openCount = tickets.filter((t) => t.status !== "Closed").length;
  const closedCount = tickets.filter((t) => t.status === "Closed").length;

  const backlogByCategory = useMemo(() => {
    const map = new Map<string, number>();
    tickets
      .filter((t) => t.status !== "Closed")
      .forEach((t) => {
        map.set(t.category, (map.get(t.category) || 0) + 1);
      });
    return [...map.entries()]
      .map(([category, open]) => ({ category, open }))
      .sort((a, b) => b.open - a.open);
  }, [tickets]);

  const volumeBars = useMemo(() => {
    const map = new Map<string, number>();
    volumeRows.forEach((r) => {
      map.set(r.category, (map.get(r.category) || 0) + r.value);
    });
    return [...map.entries()]
      .map(([category, volume]) => ({ category, volume }))
      .sort((a, b) => b.volume - a.volume);
  }, [volumeRows]);

  const priorityQueue = useMemo(() => {
    const q = query.trim().toLowerCase();
    const volumeRank = new Map(
      volumeBars.map((v, i) => [v.category, volumeBars.length - i]),
    );
    return tickets
      .filter((t) => {
        if (statusFilter !== "All" && t.status !== statusFilter) return false;
        if (categoryFilter !== "All" && t.category !== categoryFilter)
          return false;
        if (!q) return true;
        return (
          t.id.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.neighborhood.toLowerCase().includes(q) ||
          t.priority.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const vol =
          (volumeRank.get(b.category) || 0) - (volumeRank.get(a.category) || 0);
        if (vol !== 0) return vol;
        const pOrder = { P1: 0, P2: 1, P3: 2 };
        return pOrder[a.priority] - pOrder[b.priority] || b.ageDays - a.ageDays;
      });
  }, [tickets, statusFilter, categoryFilter, query, volumeBars]);

  return (
    <DashboardShell
      challenge={challenge}
      title="Service request backlog"
      banner="Sample service tickets for prioritization practice. Age and priority are fictional — confirm SLA definitions with your operations team."
    >
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Open / in progress"
          value={openCount}
          hint="Needs attention in the queue"
        />
        <StatCard
          label="Closed"
          value={closedCount}
          hint="Completed in the sample set"
        />
        <StatCard
          label="Top backlog category"
          value={backlogByCategory[0]?.category ?? "—"}
          hint={
            backlogByCategory[0]
              ? `${backlogByCategory[0].open} open requests`
              : "No open backlog"
          }
        />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel tag="Backlog" title="Open requests by category">
          <ChartFrame className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={backlogByCategory} layout="vertical">
                <CartesianGrid stroke={CHART.border} horizontal={false} />
                <XAxis type="number" tick={{ fill: CHART.muted, fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={100}
                  tick={{ fill: CHART.muted, fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: CHART.border,
                    fontSize: 13,
                  }}
                />
                <Bar dataKey="open" fill={CHART.purple} radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </Panel>

        <Panel tag="Volume" title="Historical volume by category">
          <ChartFrame className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeBars}>
                <CartesianGrid stroke={CHART.border} vertical={false} />
                <XAxis
                  dataKey="category"
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
                  dataKey="volume"
                  fill={CHART.purpleDeep}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </Panel>
      </div>

      <Panel tag="Priority queue" title="High-volume categories first">
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5 text-[12px] font-bold">
            Status
            <select
              className="field-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Open">Open</option>
              <option value="In progress">In progress</option>
              <option value="Closed">Closed</option>
            </select>
          </label>
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
              placeholder="ID, category, area…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-border bg-soft-purple/50">
                <th className="px-3 py-2.5 font-bold">Ticket</th>
                <th className="px-3 py-2.5 font-bold">Category</th>
                <th className="px-3 py-2.5 font-bold">Priority</th>
                <th className="px-3 py-2.5 font-bold">Area</th>
                <th className="px-3 py-2.5 font-bold">Age (days)</th>
                <th className="px-3 py-2.5 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {priorityQueue.map((t) => (
                <tr key={t.id} className="border-b border-border-soft">
                  <td className="px-3 py-2.5 font-mono text-[12px] font-bold">
                    {t.id}
                  </td>
                  <td className="px-3 py-2.5">{t.category}</td>
                  <td className="px-3 py-2.5">
                    <StatusPill
                      tone={
                        t.priority === "P1"
                          ? "danger"
                          : t.priority === "P2"
                            ? "warn"
                            : "default"
                      }
                    >
                      {t.priority}
                    </StatusPill>
                  </td>
                  <td className="px-3 py-2.5 text-muted">{t.neighborhood}</td>
                  <td className="px-3 py-2.5">{t.ageDays}</td>
                  <td className="px-3 py-2.5">
                    <StatusPill
                      tone={
                        t.status === "Closed"
                          ? "ok"
                          : t.status === "In progress"
                            ? "warn"
                            : "default"
                      }
                    >
                      {t.status}
                    </StatusPill>
                  </td>
                </tr>
              ))}
              {priorityQueue.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-6 text-center text-muted"
                  >
                    No tickets match these filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Panel>
    </DashboardShell>
  );
}
