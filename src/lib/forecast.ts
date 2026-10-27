export type SeriesPoint = {
  date: string;
  value: number;
};

export type ForecastMethod =
  | "seasonal-naive"
  | "moving-average"
  | "linear-trend";

export type ForecastMethodLabel =
  | "Seasonal naive"
  | "Moving average"
  | "Linear trend";

export type HoldoutMetrics = {
  method: ForecastMethod;
  label: ForecastMethodLabel;
  mae: number;
  wape: number | null;
};

export type ForecastResult = {
  metrics: HoldoutMetrics[];
  best: HoldoutMetrics;
  holdoutStartIndex: number;
  holdoutCount: number;
  forecast: SeriesPoint[];
  observedTail: SeriesPoint[];
};

const METHOD_LABELS: Record<ForecastMethod, ForecastMethodLabel> = {
  "seasonal-naive": "Seasonal naive",
  "moving-average": "Moving average",
  "linear-trend": "Linear trend",
};

const METHODS: ForecastMethod[] = [
  "seasonal-naive",
  "moving-average",
  "linear-trend",
];

/** One-step forecast from a numeric history (no dates required). */
export function predictNext(
  method: ForecastMethod,
  history: number[],
): number {
  const n = history.length;
  if (n === 0) return 0;

  if (method === "seasonal-naive") {
    if (n < 7) return history[n - 1]!;
    return history[n - 7]!;
  }

  if (method === "moving-average") {
    const window = history.slice(-Math.min(7, n));
    return window.reduce((a, b) => a + b, 0) / window.length;
  }

  // Linear trend on the last up-to-28 observations.
  const xs = history.slice(-Math.min(28, n));
  const m = xs.length;
  if (m === 1) return Math.max(0, xs[0]!);

  const meanX = (m - 1) / 2;
  const meanY = xs.reduce((a, b) => a + b, 0) / m;
  let num = 0;
  let den = 0;
  xs.forEach((y, i) => {
    num += (i - meanX) * (y - meanY);
    den += (i - meanX) ** 2;
  });
  const slope = den === 0 ? 0 : num / den;
  return Math.max(0, meanY + slope * (m - meanX));
}

export function seasonalNaive(history: number[]): number {
  return predictNext("seasonal-naive", history);
}

export function movingAverage(history: number[], window = 7): number {
  if (history.length === 0) return 0;
  const slice = history.slice(-Math.min(window, history.length));
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

export function linearTrend(history: number[]): number {
  return predictNext("linear-trend", history);
}

function assertDailySeries(data: SeriesPoint[]): SeriesPoint[] {
  if (data.length === 0) {
    throw new Error("Series is empty.");
  }

  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
  for (const point of sorted) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(point.date)) {
      throw new Error("Dates must use YYYY-MM-DD format.");
    }
    if (!Number.isFinite(point.value) || point.value < 0) {
      throw new Error("Values must be nonnegative finite numbers.");
    }
  }

  for (let i = 1; i < sorted.length; i++) {
    const prev = Date.parse(`${sorted[i - 1]!.date}T00:00:00Z`);
    const curr = Date.parse(`${sorted[i]!.date}T00:00:00Z`);
    if (curr - prev !== 86_400_000) {
      throw new Error(
        "Dates must be unique and consecutive daily observations.",
      );
    }
  }

  return sorted;
}

function addDays(isoDate: string, days: number): string {
  const t = Date.parse(`${isoDate}T00:00:00Z`) + days * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}

/**
 * Rolling one-step holdout evaluation for the three local baselines,
 * then a recursive 7-day forecast using the lowest-MAE method.
 */
export function compareForecasts(
  data: SeriesPoint[],
  options?: { minTrain?: number; horizon?: number; tailObserved?: number },
): ForecastResult {
  const series = assertDailySeries(data);
  if (series.length < 28) {
    throw new Error("Please include at least 28 consecutive days.");
  }

  const values = series.map((p) => p.value);
  const minTrain = options?.minTrain ?? 21;
  const cut = Math.max(minTrain, Math.floor(values.length * 0.8));
  const horizon = options?.horizon ?? 7;
  const tailObserved = options?.tailObserved ?? 21;

  const metrics: HoldoutMetrics[] = METHODS.map((method) => {
    const errors: number[] = [];
    let absoluteSum = 0;

    for (let i = cut; i < values.length; i++) {
      const actual = values[i]!;
      const predicted = predictNext(method, values.slice(0, i));
      errors.push(Math.abs(actual - predicted));
      absoluteSum += Math.abs(actual);
    }

    const errorSum = errors.reduce((a, b) => a + b, 0);
    const mae = errors.length ? errorSum / errors.length : 0;
    const wape = absoluteSum === 0 ? null : (100 * errorSum) / absoluteSum;

    return {
      method,
      label: METHOD_LABELS[method],
      mae,
      wape,
    };
  }).sort((a, b) => a.mae - b.mae);

  const best = metrics[0]!;
  const hist = values.slice();
  const lastDate = series[series.length - 1]!.date;
  const forecast: SeriesPoint[] = [];

  for (let i = 0; i < horizon; i++) {
    const value = predictNext(best.method, hist);
    hist.push(value);
    forecast.push({
      date: addDays(lastDate, i + 1),
      value,
    });
  }

  return {
    metrics,
    best,
    holdoutStartIndex: cut,
    holdoutCount: values.length - cut,
    forecast,
    observedTail: series.slice(-tailObserved),
  };
}

/** Synthetic daily demand series used by the Forecast Lab sample run. */
export function buildSampleDemandSeries(
  days = 112,
  start = "2025-01-01",
): SeriesPoint[] {
  return Array.from({ length: days }, (_, i) => ({
    date: addDays(start, i),
    value: Math.round(
      50 +
        0.12 * i +
        9 * Math.sin((i * 2 * Math.PI) / 7) +
        3 * Math.sin(i * 0.33),
    ),
  }));
}

export function parseDailyCsv(text: string): SeriesPoint[] {
  const lines = text.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  if (lines.length < 2) {
    throw new Error("CSV needs a header and at least one data row.");
  }

  const headers = lines[0]!.split(",").map((h) => h.trim().toLowerCase());
  const di = headers.indexOf("date");
  const vi = headers.indexOf("value");
  if (di < 0 || vi < 0) {
    throw new Error("CSV headers must include date,value.");
  }

  const points: SeriesPoint[] = [];
  for (let r = 1; r < lines.length; r++) {
    const line = lines[r];
    if (!line?.trim()) continue;
    const cells = line.split(",");
    const date = (cells[di] ?? "").trim();
    const raw = (cells[vi] ?? "").trim();
    const value = Number(raw);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      raw === "" ||
      !Number.isFinite(value) ||
      value < 0 ||
      new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date
    ) {
      throw new Error("Use YYYY-MM-DD dates and nonnegative numeric values.");
    }
    points.push({ date, value });
  }

  return assertDailySeries(points);
}
