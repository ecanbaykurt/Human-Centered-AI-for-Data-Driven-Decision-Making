"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import type { Challenge } from "@/data/challenges";
import { projectGithubUrl, projectPath } from "@/data/github";
import { getStoredApiKey } from "@/lib/apiKey";
import { copyTextToClipboard } from "@/lib/artifacts";

const SUPPLY_DATASETS = [
  "UCI Online Retail",
  "UCI Online Retail II",
  "UCI Hierarchical Sales",
  "UCI Sales Transactions Weekly",
  "UCI Seoul Bike Sharing",
  "My own dataset",
] as const;

const SUPPLY_MODELS = [
  "Compare all available demo models",
  "Seasonal naive",
  "Moving average",
  "Linear trend regression",
  "Neural network",
] as const;

const MAX_CSV_BYTES = 5 * 1024 * 1024;

type CsvState = {
  headers: string[];
  rows: string[][];
  raw: string;
  info: string;
};

type ProjectKitModalProps = {
  challenge: Challenge | null;
  open: boolean;
  onClose: () => void;
};

function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);
  if (!lines.length) return { headers: [], rows: [] };

  const split = (line: string) => {
    const cells: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        cells.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    cells.push(cur.trim());
    return cells;
  };

  const headers = split(lines[0]);
  const rows = lines.slice(1, 21).map(split);
  return { headers, rows };
}

function guessColumn(headers: string[], kinds: string[]) {
  const lower = headers.map((h) => h.toLowerCase());
  for (const kind of kinds) {
    const idx = lower.findIndex((h) => h.includes(kind));
    if (idx >= 0) return headers[idx];
  }
  return headers[0] ?? "";
}

export default function ProjectKitModal({
  challenge,
  open,
  onClose,
}: ProjectKitModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [projectName, setProjectName] = useState("");
  const [audience, setAudience] = useState("");
  const [problem, setProblem] = useState("");
  const [dataset, setDataset] = useState("");
  const [goals, setGoals] = useState("");
  const [sourceChoice, setSourceChoice] =
    useState<(typeof SUPPLY_DATASETS)[number]>(SUPPLY_DATASETS[0]);
  const [modelChoice, setModelChoice] =
    useState<(typeof SUPPLY_MODELS)[number]>(SUPPLY_MODELS[0]);
  const [csv, setCsv] = useState<CsvState | null>(null);
  const [mapDate, setMapDate] = useState("");
  const [mapCategory, setMapCategory] = useState("");
  const [mapValue, setMapValue] = useState("");
  const [status, setStatus] = useState(
    "Brief stays on this device. Copy GitHub pastes a Cursor Agent prompt.",
  );
  const [busy, setBusy] = useState(false);

  const isSupply = challenge?.slug === "supply-chain-demand";

  const resetForChallenge = useCallback((c: Challenge) => {
    setProjectName(c.name);
    setAudience("");
    setProblem("");
    setDataset("");
    setGoals("");
    setSourceChoice(SUPPLY_DATASETS[0]);
    setModelChoice(SUPPLY_MODELS[0]);
    setCsv(null);
    setMapDate("");
    setMapCategory("");
    setMapValue("");
    setStatus(
      "Brief stays on this device. Copy GitHub pastes a Cursor Agent prompt.",
    );
    setBusy(false);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && challenge) {
      resetForChallenge(challenge);
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open, challenge, resetForChallenge]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    dialog.addEventListener("cancel", onCancel);
    return () => dialog.removeEventListener("cancel", onCancel);
  }, [onClose]);

  const suggestion = challenge?.suggestion ?? "";

  const previewRows = useMemo(() => {
    if (!csv) return [];
    const di = csv.headers.indexOf(mapDate);
    const ci = csv.headers.indexOf(mapCategory);
    const vi = csv.headers.indexOf(mapValue);
    return csv.rows.slice(0, 5).map((row) => ({
      date: row[di] ?? "",
      category: row[ci] ?? "",
      value: row[vi] ?? "",
    }));
  }, [csv, mapDate, mapCategory, mapValue]);

  async function handleFile(file: File | null) {
    if (!file) {
      setCsv(null);
      return;
    }
    if (file.size > MAX_CSV_BYTES) {
      setStatus("CSV must be 5 MB or smaller.");
      setCsv(null);
      return;
    }
    const text = await file.text();
    const parsed = parseCsv(text);
    if (!parsed.headers.length) {
      setStatus("Could not read CSV headers.");
      setCsv(null);
      return;
    }
    const dateCol = guessColumn(parsed.headers, ["date", "day", "period", "month", "week"]);
    const catCol = guessColumn(parsed.headers, ["category", "type", "theme", "region", "location"]);
    const valCol = guessColumn(parsed.headers, ["value", "amount", "count", "measure", "qty", "units"]);
    setMapDate(dateCol);
    setMapCategory(catCol);
    setMapValue(valCol);
    setCsv({
      headers: parsed.headers,
      rows: parsed.rows,
      raw: text,
      info: `${file.name} · ${parsed.rows.length}+ rows detected (previewing first rows)`,
    });
    setStatus("CSV mapped locally. Preview below.");
  }

  function openPreviewDashboard() {
    if (!csv || !challenge) return;
    const payload = {
      challenge: challenge.slug,
      map: { date: mapDate, category: mapCategory, value: mapValue },
      rows: previewRows,
    };
    const blob = new Blob(
      [
        `<!doctype html><html><head><meta charset="utf-8"/><title>CSV Preview</title>
<style>body{font-family:system-ui;padding:24px;background:#f4f4fa;color:#17152b}
table{border-collapse:collapse;width:100%;background:#fff;border-radius:12px;overflow:hidden}
th,td{border:1px solid #e1e0ec;padding:8px 10px;text-align:left;font-size:13px}
th{background:#eeeaff}</style></head><body>
<h1>Dashboard preview (local)</h1>
<p>Mapped columns for <strong>${challenge.name}</strong>. This preview stays on your device.</p>
<pre>${JSON.stringify(payload.map, null, 2)}</pre>
<table><thead><tr><th>Date</th><th>Category</th><th>Value</th></tr></thead>
<tbody>${previewRows
          .map(
            (r) =>
              `<tr><td>${escapeHtml(r.date)}</td><td>${escapeHtml(r.category)}</td><td>${escapeHtml(r.value)}</td></tr>`,
          )
          .join("")}</tbody></table></body></html>`,
      ],
      { type: "text/html" },
    );
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!challenge) return;
    setBusy(true);
    setStatus("Claude is customizing your Cursor Agent prompt…");
    try {
      const dataNote = [
        dataset.trim(),
        csv
          ? `Optional CSV mapped locally: date=${mapDate}, category=${mapCategory}, value=${mapValue} (${csv.rows.length} preview rows). Keep PII off git.`
          : "",
      ]
        .filter(Boolean)
        .join(" ");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      const key = getStoredApiKey();
      if (key) headers["x-anthropic-api-key"] = key;

      const res = await fetch("/api/github-prompt", {
        method: "POST",
        headers,
        body: JSON.stringify({
          slug: challenge.slug,
          fields: {
            project: projectName.trim(),
            audience: audience.trim() || undefined,
            problem: problem.trim(),
            data: dataNote || undefined,
            goals: goals.trim() || undefined,
            source: isSupply ? sourceChoice : undefined,
            model: isSupply ? modelChoice : undefined,
          },
        }),
      });
      const data = (await res.json()) as {
        prompt?: string;
        warning?: string;
        path?: string;
        error?: string;
      };
      if (!data.prompt) throw new Error(data.error || "No prompt returned");

      const ok = await copyTextToClipboard(data.prompt);
      setStatus(
        ok
          ? data.warning
            ? data.warning
            : `Copied GitHub + Cursor prompt. Paste into Cursor Agent. Path: ${data.path || projectPath(challenge.slug)}/`
          : "Clipboard blocked — prompt was generated; allow clipboard or use Copy GitHub on the card (shows selectable text).",
      );
    } catch (err) {
      console.error(err);
      setStatus(
        err instanceof Error
          ? err.message
          : "Could not copy prompt. Check Claude API key and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (!challenge || !open) return null;

  return (
    <dialog
      ref={dialogRef}
      className="m-auto w-[calc(100%-32px)] max-w-[730px] max-h-[90vh] overflow-auto rounded-[18px] border border-[#e4dff1] bg-surface p-0 shadow-[0_20px_80px_rgba(23,18,43,0.35)] backdrop:bg-[rgba(23,18,43,0.67)] open:flex open:flex-col"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-5">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-dot" aria-hidden />
              Copy GitHub · Cursor Agent
            </div>
            <h2
              id={titleId}
              className="mt-2.5 text-[clamp(26px,4vw,32px)] font-extrabold tracking-[-0.04em] text-ink"
            >
              {challenge.name}
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">
              {challenge.question}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-xl leading-none text-muted transition-colors hover:bg-soft-purple hover:text-ink"
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="kit-project" className="field-label">
                Project name
              </label>
              <input
                id="kit-project"
                className="field-control"
                required
                maxLength={100}
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="kit-audience" className="field-label">
                Who will use it?
              </label>
              <input
                id="kit-audience"
                className="field-control"
                placeholder="e.g. program manager"
                maxLength={150}
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="kit-problem" className="field-label">
                What decision or problem are you working on?
              </label>
              <textarea
                id="kit-problem"
                className="field-control min-h-[76px] resize-y"
                required
                maxLength={1500}
                placeholder="Describe the decision you want the dashboard to support."
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
              />
              {suggestion ? (
                <small className="text-[12px] leading-relaxed text-muted-soft">
                  Suggestion:{" "}
                  <button
                    type="button"
                    className="border-0 bg-transparent p-0 text-left font-semibold text-purple cursor-pointer"
                    onClick={() => setProblem(suggestion)}
                  >
                    {suggestion}
                  </button>
                </small>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="kit-dataset" className="field-label">
                What data do you have or want to find?
              </label>
              <textarea
                id="kit-dataset"
                className="field-control min-h-[76px] resize-y"
                maxLength={1500}
                placeholder="Describe your dataset, columns, or a public source you want to explore."
                value={dataset}
                onChange={(e) => setDataset(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="kit-goals" className="field-label">
                What should the dashboard show?
              </label>
              <textarea
                id="kit-goals"
                className="field-control min-h-[76px] resize-y"
                maxLength={1500}
                placeholder="Metrics, filters, charts, questions, or workflows..."
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
              />
            </div>

            {isSupply ? (
              <div className="flex flex-col gap-3 sm:col-span-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="kit-source" className="field-label">
                    Choose an open dataset to explore
                  </label>
                  <select
                    id="kit-source"
                    className="field-control"
                    value={sourceChoice}
                    onChange={(e) =>
                      setSourceChoice(
                        e.target.value as (typeof SUPPLY_DATASETS)[number],
                      )
                    }
                  >
                    {SUPPLY_DATASETS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <small className="text-[12px] leading-relaxed text-muted-soft">
                    These are links to source datasets. They are not automatically
                    loaded or transformed. Review attribution and prepare
                    date/value columns before forecasting.
                  </small>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="kit-model" className="field-label">
                    Model to explore
                  </label>
                  <select
                    id="kit-model"
                    className="field-control"
                    value={modelChoice}
                    onChange={(e) =>
                      setModelChoice(
                        e.target.value as (typeof SUPPLY_MODELS)[number],
                      )
                    }
                  >
                    {SUPPLY_MODELS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <small className="text-[12px] leading-relaxed text-muted-soft">
                    The forecast lab runs seasonal naive, moving average and
                    linear trend. Neural networks and advanced models are
                    suggested for your AI coding assistant, not executed here.
                  </small>
                </div>

                <a
                  href="/forecast"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] font-bold text-purple-deep no-underline hover:opacity-80"
                >
                  Open the forecast lab and dataset sources ↗
                </a>
              </div>
            ) : null}

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="kit-csv" className="field-label">
                Optional dataset (CSV, up to 5 MB)
              </label>
              <input
                id="kit-csv"
                type="file"
                accept=".csv,text/csv"
                className="field-control py-2.5 file:mr-3 file:rounded-full file:border-0 file:bg-soft-purple file:px-3 file:py-1 file:text-xs file:font-bold file:text-purple"
                onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
              />
              <small className="text-[12px] leading-relaxed text-muted-soft">
                Your file stays on this device. Select the columns below to
                preview your data and build a dashboard. Avoid sharing sensitive
                data without permission.
              </small>

              {csv ? (
                <div className="mt-2 rounded-[12px] border border-border bg-soft-purple/40 p-3">
                  <p className="mb-3 text-[12px] text-muted">{csv.info}</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <label className="flex flex-col gap-1 text-[12px] font-bold">
                      Date or period
                      <select
                        className="field-control"
                        value={mapDate}
                        onChange={(e) => setMapDate(e.target.value)}
                      >
                        {csv.headers.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-[12px] font-bold">
                      Category
                      <select
                        className="field-control"
                        value={mapCategory}
                        onChange={(e) => setMapCategory(e.target.value)}
                      >
                        {csv.headers.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-[12px] font-bold">
                      Numeric value
                      <select
                        className="field-control"
                        value={mapValue}
                        onChange={(e) => setMapValue(e.target.value)}
                      >
                        {csv.headers.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="mt-3 max-h-[150px] overflow-auto rounded-lg border border-border bg-surface">
                    <table className="w-full border-collapse text-left text-[12px]">
                      <thead>
                        <tr className="bg-soft-purple">
                          <th className="border-b border-border px-2 py-1.5">
                            Date
                          </th>
                          <th className="border-b border-border px-2 py-1.5">
                            Category
                          </th>
                          <th className="border-b border-border px-2 py-1.5">
                            Value
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row, i) => (
                          <tr key={i}>
                            <td className="border-b border-border-soft px-2 py-1.5">
                              {row.date}
                            </td>
                            <td className="border-b border-border-soft px-2 py-1.5">
                              {row.category}
                            </td>
                            <td className="border-b border-border-soft px-2 py-1.5">
                              {row.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    className="btn-primary mt-3 text-[13px]"
                    onClick={openPreviewDashboard}
                  >
                    Preview your dashboard ↗
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <span className="text-[12px] text-muted">{status}</span>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? "Customizing with Claude…" : "Copy GitHub prompt →"}
            </button>
          </div>

          <p className="mt-4 text-[12px] leading-relaxed text-muted-soft">
            Copies an open-source GitHub path plus a Claude-customized Cursor
            Agent prompt from your brief. Paste into Cursor / Claude to start
            building in{" "}
            <code className="font-mono text-[11px]">
              {challenge ? projectPath(challenge.slug) : "projects/…"}/
            </code>
            . Tree:{" "}
            {challenge ? (
              <a
                href={projectGithubUrl(challenge.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-purple no-underline"
              >
                GitHub ↗
              </a>
            ) : null}
          </p>
        </form>
      </div>
    </dialog>
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
