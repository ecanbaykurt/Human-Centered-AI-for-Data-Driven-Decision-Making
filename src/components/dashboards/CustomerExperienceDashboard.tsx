"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Challenge } from "@/data/challenges";
import {
  customerFeedbackThemes,
  generateSampleRows,
} from "@/data/sampleData";
import DashboardShell, {
  CHART,
  Panel,
  StatCard,
  StatusPill,
} from "./DashboardShell";
import ChartFrame, { monthLabel } from "./ChartFrame";

const SENTIMENT_TONE = {
  positive: "ok" as const,
  neutral: "default" as const,
  negative: "danger" as const,
};

export default function CustomerExperienceDashboard({
  challenge,
}: {
  challenge: Challenge;
}) {
  const volumeRows = useMemo(() => generateSampleRows(challenge), [challenge]);
  const [theme, setTheme] = useState("All");
  const [query, setQuery] = useState("");

  const themes = customerFeedbackThemes;

  const filteredThemes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return themes.filter((t) => {
      if (theme !== "All" && t.theme !== theme) return false;
      if (!q) return true;
      return (
        t.theme.toLowerCase().includes(q) ||
        t.example.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q)
      );
    });
  }, [themes, theme, query]);

  const volumeOverTime = useMemo(() => {
    const map = new Map<string, number>();
    volumeRows.forEach((r) => {
      if (theme !== "All" && r.category !== theme) return;
      map.set(r.date, (map.get(r.date) || 0) + r.value);
    });
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, reports]) => ({
        date: monthLabel(date),
        reports,
      }));
  }, [volumeRows, theme]);

  const pieData = themes.map((t) => ({
    name: t.theme,
    value: t.mentions,
  }));

  const totalMentions = themes.reduce((s, t) => s + t.mentions, 0);
  const investigating = themes.filter((t) => t.status === "Investigating");
  const negative = themes.filter((t) => t.sentiment === "negative");

  return (
    <DashboardShell
      challenge={challenge}
      title="Customer feedback themes"
      banner="Sample theme counts and comments for workshop practice. Sentiment labels are illustrative — not a production NLP model."
    >
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Theme mentions"
          value={totalMentions}
          hint="Across all sample themes"
        />
        <StatCard
          label="Under investigation"
          value={investigating.length}
          hint={investigating.map((t) => t.theme).join(", ") || "None"}
        />
        <StatCard
          label="Negative themes"
          value={negative.length}
          hint="Prioritize for follow-up review"
        />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel tag="Breakdown" title="Mentions by theme">
          <ChartFrame className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={100}
                  paddingAngle={3}
                >
                  {pieData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={CHART.series[i % CHART.series.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: CHART.border,
                    fontSize: 13,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartFrame>
          <div className="mt-1 flex flex-wrap gap-2">
            {pieData.map((d, i) => (
              <button
                key={d.name}
                type="button"
                className={`filter-pill ${theme === d.name ? "active" : ""}`}
                aria-pressed={theme === d.name}
                onClick={() =>
                  setTheme((prev) => (prev === d.name ? "All" : d.name))
                }
              >
                <span
                  className="mr-1.5 inline-block h-2 w-2 rounded-full"
                  style={{
                    background: CHART.series[i % CHART.series.length],
                  }}
                />
                {d.name}
              </button>
            ))}
            {theme !== "All" ? (
              <button
                type="button"
                className="filter-pill"
                onClick={() => setTheme("All")}
              >
                Clear filter
              </button>
            ) : null}
          </div>
        </Panel>

        <Panel tag="Volume" title="Feedback volume over time">
          <ChartFrame className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeOverTime}>
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
                <Bar
                  dataKey="reports"
                  fill={CHART.purple}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </Panel>
      </div>

      {(investigating.length > 0 || negative.length > 0) && (
        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          {[...new Set([...investigating, ...negative])].map((t) => (
            <div
              key={t.theme}
              className="rounded-[14px] border border-[#f0d4a8] bg-[#fff8ea] px-4 py-3.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-ink">
                  Priority: {t.theme}
                </span>
                <StatusPill tone={SENTIMENT_TONE[t.sentiment]}>
                  {t.sentiment}
                </StatusPill>
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                {t.example} · {t.mentions} mentions · status {t.status}
              </p>
            </div>
          ))}
        </div>
      )}

      <Panel tag="Feedback table" title="Filterable theme detail">
        <div className="mb-4">
          <label className="flex flex-col gap-1.5 text-[12px] font-bold sm:max-w-md">
            Search themes
            <input
              className="field-control"
              placeholder="Theme, example text, or status"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-border bg-soft-purple/50">
                <th className="px-3 py-2.5 font-bold">Theme</th>
                <th className="px-3 py-2.5 font-bold">Mentions</th>
                <th className="px-3 py-2.5 font-bold">Sentiment</th>
                <th className="px-3 py-2.5 font-bold">Example</th>
                <th className="px-3 py-2.5 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredThemes.map((t) => (
                <tr key={t.theme} className="border-b border-border-soft">
                  <td className="px-3 py-2.5 font-semibold">{t.theme}</td>
                  <td className="px-3 py-2.5">{t.mentions}</td>
                  <td className="px-3 py-2.5">
                    <StatusPill tone={SENTIMENT_TONE[t.sentiment]}>
                      {t.sentiment}
                    </StatusPill>
                  </td>
                  <td className="max-w-[320px] px-3 py-2.5 text-muted">
                    {t.example}
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusPill
                      tone={
                        t.status === "Investigating"
                          ? "warn"
                          : t.status === "Open"
                            ? "default"
                            : "ok"
                      }
                    >
                      {t.status}
                    </StatusPill>
                  </td>
                </tr>
              ))}
              {filteredThemes.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-muted"
                  >
                    No themes match this filter.
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
