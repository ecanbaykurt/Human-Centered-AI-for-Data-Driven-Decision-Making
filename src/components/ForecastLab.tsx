"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
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
import {
  buildSampleDemandSeries,
  compareForecasts,
  parseDailyCsv,
  type ForecastResult,
} from "@/lib/forecast";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ChartFrame from "@/components/dashboards/ChartFrame";

const MAX_CSV_BYTES = 5 * 1024 * 1024;

const HORIZONS = [
  "Next 7 days",
  "Next 4 weeks",
  "Next quarter",
] as const;

const DATASETS = [
  {
    name: "UCI Online Retail",
    blurb: "Transactions, quantities and dates; aggregate by product and day.",
    url: "https://archive.ics.uci.edu/dataset/352/online+retail",
  },
  {
    name: "UCI Online Retail II",
    blurb: "Two years of transactions; overlapping source with Online Retail.",
    url: "https://archive.ics.uci.edu/dataset/502/online+retail+ii",
  },
  {
    name: "Hierarchical Sales Data",
    blurb: "Daily grocery SKU sales and promotions.",
    url: "https://archive.ics.uci.edu/dataset/611/hierarchical+sales+data",
  },
  {
    name: "Weekly Sales Transactions",
    blurb:
      "52 weekly periods for over 800 products; useful for a weekly model, not this daily demo without adaptation.",
    url: "https://archive.ics.uci.edu/dataset/396/sales+transactions+dataset+weekly",
  },
  {
    name: "Seoul Bike Sharing Demand",
    blurb:
      "Hourly bike rentals and weather; capacity-planning proxy, not retail inventory.",
    url: "https://archive.ics.uci.edu/dataset/560/seoul+bike+sharing+demand",
  },
] as const;

const MODEL_ROWS = [
  {
    family: "Baselines",
    examples: "Seasonal naive, moving average",
    availability: "Runs locally",
  },
  {
    family: "Linear ML",
    examples: "Linear trend regression",
    availability: "Runs locally",
  },
  {
    family: "Statistical",
    examples: "ETS, ARIMA, SARIMA, Croston",
    availability: "Build separately",
  },
  {
    family: "Tree based ML",
    examples: "Random Forest, XGBoost, LightGBM, CatBoost",
    availability: "Build separately",
  },
  {
    family: "Neural forecasting",
    examples: "LSTM, GRU, N-BEATS, Temporal Fusion Transformer",
    availability: "Build separately",
  },
  {
    family: "Foundation models",
    examples: "Chronos, TimesFM",
    availability: "Build separately",
  },
] as const;

type ChartRow = {
  date: string;
  label: string;
  observed: number | null;
  forecast: number | null;
};

function formatShortDate(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function buildChartRows(result: ForecastResult): ChartRow[] {
  const observed = result.observedTail.map((p) => ({
    date: p.date,
    label: formatShortDate(p.date),
    observed: p.value,
    forecast: null as number | null,
  }));

  const bridge = observed[observed.length - 1];
  if (bridge) {
    bridge.forecast = bridge.observed;
  }

  const forecast = result.forecast.map((p) => ({
    date: p.date,
    label: formatShortDate(p.date),
    observed: null as number | null,
    forecast: p.value,
  }));

  return [...observed, ...forecast];
}

function SectionTag({ children }: { children: string }) {
  return (
    <div className="font-mono text-[10px] font-bold tracking-[0.16em] text-purple uppercase">
      {children}
    </div>
  );
}

function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[16px] border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:p-7 ${className}`}
    >
      {children}
    </section>
  );
}

export default function ForecastLab() {
  const [goal, setGoal] = useState("");
  const [horizon, setHorizon] =
    useState<(typeof HORIZONS)[number]>("Next 7 days");
  const [framework, setFramework] = useState<string | null>(null);
  const [frameworkError, setFrameworkError] = useState<string | null>(null);

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [message, setMessage] = useState("Select a method to begin.");
  const [result, setResult] = useState<ForecastResult | null>(null);
  const [seriesLength, setSeriesLength] = useState<number | null>(null);

  const chartData = useMemo(
    () => (result ? buildChartRows(result) : []),
    [result],
  );

  function createFramework() {
    const trimmed = goal.trim();
    if (!trimmed) {
      setFramework(null);
      setFrameworkError("Please describe your decision first.");
      return;
    }
    setFrameworkError(null);
    setFramework(
      `Planning template for “${trimmed}” (${horizon}): define the target and unit → choose and inspect a dataset → establish a chronological holdout → compare baselines and candidate models → review errors, stockouts and business constraints → deploy a decision dashboard. This is a rule-based outline, not an AI agent result.`,
    );
  }

  function runComparison(data: ReturnType<typeof buildSampleDemandSeries>) {
    const next = compareForecasts(data);
    setResult(next);
    setSeriesLength(data.length);
    setMessage(
      "Comparison complete. Select a dataset source and review its limitations before applying this to a real decision.",
    );
  }

  function runSample() {
    try {
      runComparison(buildSampleDemandSeries(112));
    } catch (err) {
      setResult(null);
      setSeriesLength(null);
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function runUploaded() {
    if (!csvFile) {
      setMessage("Please choose a CSV first.");
      return;
    }
    if (csvFile.size > MAX_CSV_BYTES) {
      setMessage("Please use a CSV smaller than 5 MB.");
      return;
    }
    try {
      const text = await csvFile.text();
      const data = parseDailyCsv(text);
      runComparison(data);
    } catch (err) {
      setResult(null);
      setSeriesLength(null);
      const msg = err instanceof Error ? err.message : "Invalid CSV.";
      setMessage(
        msg === "Invalid time value"
          ? "Please provide valid YYYY-MM-DD dates."
          : msg,
      );
    }
  }

  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-[1250px] flex-1 px-[5%] pb-16 pt-10 sm:pt-12">
        <Link
          href="/"
          className="inline-flex text-[13px] font-bold text-purple-deep no-underline transition-opacity hover:opacity-75"
        >
          ← All ideas
        </Link>

        <div className="animate-fade-up mt-6">
          <div className="eyebrow">
            <span className="eyebrow-dot" aria-hidden />
            TRACK 01 / SUPPLY CHAIN &amp; DEMAND
          </div>
          <h1 className="mt-4 max-w-[18ch] text-[clamp(36px,5vw,62px)] font-extrabold leading-[1.02] tracking-[-0.05em] text-ink">
            Forecast what comes next.
          </h1>
          <p className="mt-4 max-w-[750px] text-base leading-relaxed text-muted">
            Explore demand, compare forecasting baselines, and build a decision
            framework for inventory or resource planning. Start with sample data
            or use your own prepared daily series.
          </p>
        </div>

        {/* 01 Define */}
        <Panel className="animate-fade-up animate-delay-1 mt-10">
          <SectionTag>01 / DEFINE THE DECISION</SectionTag>
          <h2 className="mt-3 text-[clamp(24px,3vw,28px)] font-extrabold tracking-[-0.03em] text-ink">
            Start with the problem.
          </h2>

          <label htmlFor="forecast-goal" className="field-label mt-5 block">
            What are you trying to forecast or improve?
          </label>
          <textarea
            id="forecast-goal"
            className="field-control mt-1.5 min-h-[96px] resize-y"
            placeholder="Example: Forecast weekly beverage demand to plan inventory and replenishment."
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />

          <label htmlFor="forecast-horizon" className="field-label mt-4 block">
            Decision horizon
          </label>
          <select
            id="forecast-horizon"
            className="field-control mt-1.5"
            value={horizon}
            onChange={(e) =>
              setHorizon(e.target.value as (typeof HORIZONS)[number])
            }
          >
            {HORIZONS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>

          <div className="mt-5">
            <button type="button" className="btn-primary" onClick={createFramework}>
              Create framework →
            </button>
          </div>

          <div className="mt-4" aria-live="polite">
            {frameworkError ? (
              <p className="text-sm font-medium text-[#8b3a4a]">{frameworkError}</p>
            ) : null}
            {framework ? (
              <p className="rounded-[9px] bg-soft-purple px-3.5 py-3 text-[13px] leading-relaxed text-[#574e75]">
                {framework}
              </p>
            ) : null}
          </div>
        </Panel>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="flex flex-col gap-5">
            {/* 02 Data */}
            <Panel>
              <SectionTag>02 / CHOOSE YOUR DATA</SectionTag>
              <h2 className="mt-3 text-[clamp(24px,3vw,28px)] font-extrabold tracking-[-0.03em] text-ink">
                Five open datasets.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Explore the original sources. These datasets are not imported
                automatically. Follow attribution requirements and transform the
                data to daily{" "}
                <strong className="font-bold text-ink">date,value</strong>{" "}
                columns before using this lab.
              </p>

              <div className="mt-2">
                {DATASETS.map((ds, i) => (
                  <div
                    key={ds.url}
                    className="border-b border-[#eeeaf5] py-4 last:border-b-0"
                  >
                    <span className="inline-flex rounded-lg bg-soft-purple px-2.5 py-1.5 text-[12px] font-bold text-purple-deep">
                      0{i + 1} / CC BY 4.0
                    </span>
                    <h3 className="mt-3 text-base font-extrabold tracking-[-0.02em] text-ink">
                      {ds.name}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">
                      {ds.blurb}
                    </p>
                    <a
                      href={ds.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex text-[13px] font-bold text-purple-deep no-underline hover:opacity-80"
                    >
                      Open original dataset ↗
                    </a>
                    <br />
                    <small className="text-[12px] text-[#797589]">
                      UCI Machine Learning Repository · attribution required
                    </small>
                  </div>
                ))}
              </div>
            </Panel>

            {/* 03 Models */}
            <Panel>
              <SectionTag>03 / COMPARE MODELS</SectionTag>
              <h2 className="mt-3 text-[clamp(24px,3vw,28px)] font-extrabold tracking-[-0.03em] text-ink">
                A practical model toolkit.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Choose a baseline before testing more complex methods. No model
                is best for every dataset.
              </p>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr>
                      {["Family", "Examples", "Available here"].map((h) => (
                        <th
                          key={h}
                          className="border-b border-[#eceaf1] px-0 py-2.5 text-left font-mono text-[11px] font-bold tracking-[0.08em] text-[#777187] uppercase"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MODEL_ROWS.map((row) => (
                      <tr key={row.family}>
                        <td className="border-b border-[#eceaf1] py-2.5 pr-3 font-semibold text-ink">
                          {row.family}
                        </td>
                        <td className="border-b border-[#eceaf1] py-2.5 pr-3 text-muted">
                          {row.examples}
                        </td>
                        <td className="border-b border-[#eceaf1] py-2.5">
                          <span
                            className={
                              row.availability === "Runs locally"
                                ? "font-bold text-purple-deep"
                                : "text-muted"
                            }
                          >
                            {row.availability}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-4 rounded-[9px] bg-soft-purple px-3.5 py-3 text-[13px] leading-relaxed text-[#574e75]">
                Advanced models are ideas for a future build, not installed or
                trained on this site. Model availability, licensing, compute and
                suitability must be assessed independently.
              </p>
            </Panel>
          </div>

          <div className="flex flex-col gap-5">
            {/* 04 Run */}
            <Panel>
              <SectionTag>04 / RUN A FORECAST</SectionTag>
              <h2 className="mt-3 text-[clamp(24px,3vw,28px)] font-extrabold tracking-[-0.03em] text-ink">
                Try it yourself.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                The calculation happens in your browser. The demo uses a
                synthetic daily series; upload a CSV with{" "}
                <code className="rounded bg-soft-purple px-1 py-0.5 font-mono text-[12px] text-purple-deep">
                  date,value
                </code>{" "}
                headers, one observation per day and at least 28 consecutive
                days.
              </p>

              <label htmlFor="forecast-csv" className="field-label mt-5 block">
                Optional CSV (max 5 MB)
              </label>
              <input
                id="forecast-csv"
                type="file"
                accept=".csv,text/csv"
                className="field-control mt-1.5 py-2.5 file:mr-3 file:rounded-full file:border-0 file:bg-soft-purple file:px-3 file:py-1 file:text-xs file:font-bold file:text-purple"
                onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
              />

              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="btn-primary" onClick={runSample}>
                  Run sample comparison
                </button>
                <button
                  type="button"
                  onClick={() => void runUploaded()}
                  className="inline-flex items-center justify-center rounded-full bg-soft-purple px-[18px] py-[14px] text-[14px] font-bold text-purple-deep transition hover:brightness-[0.98]"
                >
                  Run uploaded CSV
                </button>
              </div>

              <p className="mt-4 text-sm text-muted" role="status">
                {message}
              </p>

              {result && seriesLength !== null ? (
                <div className="mt-5 space-y-5 overflow-x-auto">
                  <table className="w-full border-collapse text-[13px]">
                    <thead>
                      <tr>
                        {["Model", "MAE ↓", "WAPE ↓"].map((h) => (
                          <th
                            key={h}
                            className="border-b border-[#eceaf1] px-0 py-2.5 text-left font-mono text-[11px] font-bold tracking-[0.08em] text-[#777187] uppercase"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.metrics.map((row, i) => {
                        const isBest = i === 0;
                        return (
                          <tr
                            key={row.method}
                            className={isBest ? "text-purple-deep" : undefined}
                          >
                            <td
                              className={`border-b border-[#eceaf1] py-2.5 pr-3 ${isBest ? "font-bold" : "font-medium text-ink"}`}
                            >
                              {row.label}
                              {isBest ? " • lowest MAE" : ""}
                            </td>
                            <td
                              className={`border-b border-[#eceaf1] py-2.5 pr-3 ${isBest ? "font-bold" : "text-muted"}`}
                            >
                              {row.mae.toFixed(2)}
                            </td>
                            <td
                              className={`border-b border-[#eceaf1] py-2.5 ${isBest ? "font-bold" : "text-muted"}`}
                            >
                              {row.wape === null
                                ? "N/A"
                                : `${row.wape.toFixed(1)}%`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <p className="text-[13px] text-muted">
                    {seriesLength} daily observations · {result.holdoutCount}{" "}
                    holdout days · one-step rolling evaluation
                  </p>

                  <div>
                    <h3 className="text-base font-extrabold tracking-[-0.02em] text-ink">
                      Next 7 days
                    </h3>
                    <div aria-label="Last 21 observed values and next 7 forecast values">
                    <ChartFrame className="mt-3 h-[220px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={chartData}
                          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid
                            stroke="#eceaf1"
                            strokeDasharray="3 3"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="label"
                            tick={{ fill: "#777187", fontSize: 11 }}
                            tickLine={false}
                            axisLine={{ stroke: "#e1e0ec" }}
                            interval="preserveStartEnd"
                            minTickGap={28}
                          />
                          <YAxis
                            tick={{ fill: "#777187", fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            width={36}
                          />
                          <Tooltip
                            contentStyle={{
                              borderRadius: 10,
                              border: "1px solid #e1e0ec",
                              fontSize: 12,
                            }}
                          />
                          <Legend
                            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="observed"
                            name="Observed"
                            stroke="#7450e8"
                            strokeWidth={2.5}
                            dot={false}
                            connectNulls={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="forecast"
                            name="Forecast"
                            stroke="#d7fb52"
                            strokeWidth={2.5}
                            strokeDasharray="5 4"
                            dot={{ r: 3, fill: "#d7fb52", stroke: "#17152b" }}
                            connectNulls={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartFrame>
                    </div>
                    <p className="mt-2 text-[13px] text-muted">
                      Observed = purple · Forecast = lime
                    </p>
                  </div>

                  <table className="w-full border-collapse text-[13px]">
                    <thead>
                      <tr>
                        {["Day ahead", "Predicted value"].map((h) => (
                          <th
                            key={h}
                            className="border-b border-[#eceaf1] px-0 py-2.5 text-left font-mono text-[11px] font-bold tracking-[0.08em] text-[#777187] uppercase"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.forecast.map((point, i) => (
                        <tr key={point.date}>
                          <td className="border-b border-[#eceaf1] py-2.5 pr-3 font-medium text-ink">
                            {i + 1}
                          </td>
                          <td className="border-b border-[#eceaf1] py-2.5 text-muted">
                            {point.value.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </Panel>

            {/* 05 Human review */}
            <Panel>
              <SectionTag>05 / HUMAN REVIEW</SectionTag>
              <h2 className="mt-3 text-[clamp(24px,3vw,28px)] font-extrabold tracking-[-0.03em] text-ink">
                Before you act.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Observed sales may be limited by stockouts. Review data quality,
                promotions, holidays, lead times and changes in demand before
                using a forecast for purchasing decisions.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                MAE and WAPE reflect one chronological holdout in this demo, not
                a guarantee of future performance. The chart shows seven
                recursive forecasts from the best holdout model.
              </p>
              <Link
                href="/#explore"
                className="mt-5 inline-flex text-[13px] font-bold text-purple-deep no-underline hover:opacity-80"
              >
                Create your personalized project kit →
              </Link>
            </Panel>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
