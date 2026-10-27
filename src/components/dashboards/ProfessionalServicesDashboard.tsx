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
  professionalIntakeQueue,
} from "@/data/sampleData";
import DashboardShell, {
  CHART,
  Panel,
  StatCard,
  StatusPill,
} from "./DashboardShell";
import ChartFrame from "./ChartFrame";

const STAGES = [
  { id: "intake", label: "Intake received", statuses: ["Open", "Waiting"] },
  { id: "triage", label: "Triage & assign", statuses: ["Open"] },
  { id: "waiting", label: "Waiting on client", statuses: ["Waiting"] },
  { id: "closed", label: "Closed / resolved", statuses: ["Closed"] },
] as const;

export default function ProfessionalServicesDashboard({
  challenge,
}: {
  challenge: Challenge;
}) {
  const volumeRows = useMemo(() => generateSampleRows(challenge), [challenge]);
  const intake = professionalIntakeQueue;
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [query, setQuery] = useState("");

  const byType = useMemo(() => {
    const map = new Map<string, number>();
    volumeRows.forEach((r) => {
      map.set(r.category, (map.get(r.category) || 0) + r.value);
    });
    return [...map.entries()]
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }, [volumeRows]);

  const openPipeline = intake.filter((r) => r.status !== "Closed");
  const waiting = intake.filter((r) => r.status === "Waiting");

  const stageCounts = STAGES.map((stage) => ({
    ...stage,
    count: intake.filter((r) =>
      (stage.statuses as readonly string[]).includes(r.status),
    ).length,
  }));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return intake
      .filter((r) => {
        if (statusFilter !== "All" && r.status !== statusFilter) return false;
        if (typeFilter !== "All" && r.type !== typeFilter) return false;
        if (!q) return true;
        return (
          r.id.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q) ||
          r.channel.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
      );
  }, [intake, statusFilter, typeFilter, query]);

  return (
    <DashboardShell
      challenge={challenge}
      title="Professional service intake"
      banner="Anonymized intake queue for workflow practice. No private case details are included — keep real client data off starter kits."
    >
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Open pipeline"
          value={openPipeline.length}
          hint="Open + waiting requests"
        />
        <StatCard
          label="Waiting on client"
          value={waiting.length}
          hint="SLA clocks may still be running"
        />
        <StatCard
          label="Top request type"
          value={byType[0]?.type ?? "—"}
          hint={
            byType[0]
              ? `${byType[0].count} sample volume units`
              : undefined
          }
        />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel tag="Intake mix" title="Requests by type">
          <ChartFrame className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byType}>
                <CartesianGrid stroke={CHART.border} vertical={false} />
                <XAxis
                  dataKey="type"
                  tick={{ fill: CHART.muted, fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-18}
                  textAnchor="end"
                  height={60}
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
                  dataKey="count"
                  fill={CHART.purple}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </Panel>

        <Panel tag="Workflow" title="Pipeline stages">
          <ol className="space-y-3">
            {stageCounts.map((stage, i) => (
              <li
                key={stage.id}
                className="flex items-center gap-4 rounded-[12px] border border-border-soft bg-surface-input px-4 py-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple font-mono text-[12px] font-bold text-white">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-ink">{stage.label}</div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-lavender">
                    <div
                      className="h-full rounded-full bg-lime"
                      style={{
                        width: `${Math.min(
                          100,
                          (stage.count / Math.max(1, intake.length)) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="font-mono text-[13px] font-bold text-purple">
                  {stage.count}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[12px] text-muted-soft">
            Stages overlap on purpose — a request can appear in triage while
            still “Open.” Adapt labels to your firm’s playbook.
          </p>
        </Panel>
      </div>

      <Panel tag="Queue" title="Intake request table">
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
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
          <label className="flex flex-col gap-1.5 text-[12px] font-bold">
            Type
            <select
              className="field-control"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
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
              placeholder="ID, type, channel…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-border bg-soft-purple/50">
                <th className="px-3 py-2.5 font-bold">Request</th>
                <th className="px-3 py-2.5 font-bold">Type</th>
                <th className="px-3 py-2.5 font-bold">Submitted</th>
                <th className="px-3 py-2.5 font-bold">Channel</th>
                <th className="px-3 py-2.5 font-bold">SLA (hrs)</th>
                <th className="px-3 py-2.5 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border-soft">
                  <td className="px-3 py-2.5 font-mono text-[12px] font-bold">
                    {r.id}
                  </td>
                  <td className="px-3 py-2.5 font-semibold">{r.type}</td>
                  <td className="px-3 py-2.5 text-muted">
                    {new Date(r.submittedAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-3 py-2.5">{r.channel}</td>
                  <td className="px-3 py-2.5">{r.slaHours}</td>
                  <td className="px-3 py-2.5">
                    <StatusPill
                      tone={
                        r.status === "Waiting"
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
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-6 text-center text-muted"
                  >
                    No intake requests match these filters.
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
