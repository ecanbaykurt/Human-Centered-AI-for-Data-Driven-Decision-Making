import type { Challenge } from "./challenges";
import { getChallenge } from "./challenges";

export type SampleRow = {
  date: string;
  category: string;
  value: number;
  status: string;
};

export type EmailSample = {
  id: string;
  from: string;
  subject: string;
  preview: string;
  receivedAt: string;
  priority: "high" | "normal" | "low";
  status: "Needs reply" | "Read later" | "Archived";
};

export type CalendarEventSample = {
  id: string;
  title: string;
  with: string;
  startsAt: string;
  endsAt: string;
  location: string;
  status: "Upcoming" | "In progress" | "Done";
};

export type FeedbackTheme = {
  theme: string;
  mentions: number;
  sentiment: "positive" | "neutral" | "negative";
  example: string;
  status: string;
};

export type RiskSeriesPoint = {
  date: string;
  category: string;
  value: number;
  change: number;
  status: string;
};

export type ServiceTicket = {
  id: string;
  category: string;
  openedAt: string;
  priority: "P1" | "P2" | "P3";
  status: "Open" | "In progress" | "Closed";
  neighborhood: string;
  ageDays: number;
};

export type IntakeRequest = {
  id: string;
  type: string;
  submittedAt: string;
  status: "Open" | "Waiting" | "Closed";
  channel: "Web" | "Phone" | "Referral";
  slaHours: number;
};

export type LocationResourceRow = {
  date: string;
  location: string;
  electricity: number;
  water: number;
  waste: number;
  status: string;
};

export type NeighborhoodCoverage = {
  neighborhood: string;
  trees: number;
  canopyPct: number;
  populationProxy: number;
  status: string;
};

export type HousingInquirySeries = {
  date: string;
  neighborhood: string;
  inquiries: number;
  waitlist: number;
  status: string;
};

const MONTHS = [
  "2025-04-01",
  "2025-05-01",
  "2025-06-01",
  "2025-07-01",
  "2025-08-01",
  "2025-09-01",
] as const;

/** Deterministic pseudo-random in [0, 1) from a string seed. */
function hashUnit(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10_000) / 10_000;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function baseForChallenge(slug: string): number {
  const map: Record<string, number> = {
    "personal-ai-assistant": 1,
    "supply-chain-demand": 14,
    "customer-experience": 18,
    "service-field-operations": 20,
    "sustainability-impact": 24,
    "urban-trees-climate": 28,
    "housing-community": 30,
    "market-risk-intelligence": 36,
    "professional-services": 42,
  };
  return map[slug] ?? 20;
}

/**
 * Generate ~24–36 fictional monthly rows (date, category, value, status)
 * spanning 2025-04 through 2025-09 for a challenge.
 */
export function generateSampleRows(
  challenge: Challenge | string,
): SampleRow[] {
  const c =
    typeof challenge === "string" ? getChallenge(challenge) : challenge;
  if (!c) return [];

  const cats = c.categories;
  const statuses = c.statuses.length
    ? c.statuses
    : ["Open", "Closed"];
  const base = baseForChallenge(c.slug);
  const rows: SampleRow[] = [];

  cats.forEach((category, catIndex) => {
    MONTHS.forEach((date, monthIndex) => {
      const noise = hashUnit(`${c.slug}:${category}:${date}`);
      const seasonal = Math.sin((monthIndex / 6) * Math.PI * 2) * (base * 0.08);
      const trend = monthIndex * (base * 0.04);
      const offset = catIndex * (base * 0.22);
      let value: number;

      if (c.slug === "personal-ai-assistant") {
        value = Math.max(1, Math.round(1 + noise * 3 + (monthIndex % 2)));
      } else if (c.slug === "market-risk-intelligence") {
        value = round1(
          base + offset + trend + seasonal + (noise - 0.5) * 6,
        );
      } else {
        value = Math.max(
          1,
          Math.round(base + offset + trend + seasonal + (noise - 0.5) * 8),
        );
      }

      const statusRoll = hashUnit(`${c.slug}:status:${category}:${date}`);
      const status =
        statuses[Math.floor(statusRoll * statuses.length) % statuses.length];

      rows.push({ date, category, value, status });
    });
  });

  // Ensure we land in the 24–36 band when a challenge has fewer categories.
  if (rows.length < 24 && cats.length > 0) {
    const extras = 24 - rows.length;
    for (let i = 0; i < extras; i++) {
      const category = cats[i % cats.length];
      const date = MONTHS[i % MONTHS.length];
      const noise = hashUnit(`${c.slug}:extra:${i}`);
      rows.push({
        date,
        category,
        value: Math.max(
          1,
          Math.round(base + noise * 10 + (i % cats.length) * 3),
        ),
        status: statuses[i % statuses.length],
      });
    }
  }

  return rows.slice(0, 36).sort((a, b) => {
    const byDate = a.date.localeCompare(b.date);
    return byDate !== 0 ? byDate : a.category.localeCompare(b.category);
  });
}

export function rowsToCsv(rows: SampleRow[]): string {
  const header = "date,category,value,status";
  const body = rows
    .map(
      (r) =>
        `${r.date},${csvEscape(r.category)},${r.value},${csvEscape(r.status)}`,
    )
    .join("\n");
  return `${header}\n${body}\n`;
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

/* -------------------------------------------------------------------------- */
/* Richer datasets for specialized dashboards                                 */
/* -------------------------------------------------------------------------- */

export const personalAssistantEmails: EmailSample[] = [
  {
    id: "em-1",
    from: "Jordan Lee",
    subject: "Project update",
    preview: "Could you review the plan before our meeting?",
    receivedAt: "2025-09-22T08:12:00Z",
    priority: "high",
    status: "Needs reply",
  },
  {
    id: "em-2",
    from: "Alex Rivera",
    subject: "Workshop materials",
    preview: "Sharing the slides for tomorrow’s session.",
    receivedAt: "2025-09-22T09:05:00Z",
    priority: "normal",
    status: "Read later",
  },
  {
    id: "em-3",
    from: "Taylor Kim",
    subject: "Weekly report",
    preview: "The latest draft is ready for your feedback.",
    receivedAt: "2025-09-22T10:41:00Z",
    priority: "normal",
    status: "Needs reply",
  },
  {
    id: "em-4",
    from: "Sam Ortiz",
    subject: "Vendor follow-up",
    preview: "Confirming availability for the Thursday walkthrough.",
    receivedAt: "2025-09-21T16:20:00Z",
    priority: "low",
    status: "Read later",
  },
  {
    id: "em-5",
    from: "Priya Shah",
    subject: "Budget checkpoint",
    preview: "Numbers look stable — can we lock assumptions by Friday?",
    receivedAt: "2025-09-21T14:02:00Z",
    priority: "high",
    status: "Needs reply",
  },
  {
    id: "em-6",
    from: "Chris Nguyen",
    subject: "Parking reminder",
    preview: "Visitor passes expire at noon for guests on site.",
    receivedAt: "2025-09-20T11:18:00Z",
    priority: "low",
    status: "Archived",
  },
];

export const personalAssistantEvents: CalendarEventSample[] = [
  {
    id: "ev-1",
    title: "Team planning",
    with: "Product & Ops",
    startsAt: "2025-09-23T09:30:00Z",
    endsAt: "2025-09-23T10:15:00Z",
    location: "Room 3A / Meet",
    status: "Upcoming",
  },
  {
    id: "ev-2",
    title: "Partner sync",
    with: "Harbor Partners",
    startsAt: "2025-09-23T11:00:00Z",
    endsAt: "2025-09-23T11:45:00Z",
    location: "Video call",
    status: "Upcoming",
  },
  {
    id: "ev-3",
    title: "Project review",
    with: "Core build team",
    startsAt: "2025-09-23T14:00:00Z",
    endsAt: "2025-09-23T15:00:00Z",
    location: "Studio B",
    status: "Upcoming",
  },
  {
    id: "ev-4",
    title: "Focus block",
    with: "Self",
    startsAt: "2025-09-23T15:30:00Z",
    endsAt: "2025-09-23T16:30:00Z",
    location: "Desk",
    status: "Upcoming",
  },
  {
    id: "ev-5",
    title: "Office hours",
    with: "Open roster",
    startsAt: "2025-09-24T13:00:00Z",
    endsAt: "2025-09-24T14:00:00Z",
    location: "Lobby pods",
    status: "Upcoming",
  },
];

export const customerFeedbackThemes: FeedbackTheme[] = [
  {
    theme: "Taste",
    mentions: 42,
    sentiment: "positive",
    example: "Flavor consistency improved since last quarter.",
    status: "Closed",
  },
  {
    theme: "Equipment",
    mentions: 31,
    sentiment: "negative",
    example: "Kiosk screens freeze during peak lunch hours.",
    status: "Investigating",
  },
  {
    theme: "Availability",
    mentions: 27,
    sentiment: "neutral",
    example: "Popular sizes sell out by mid-afternoon on Fridays.",
    status: "Open",
  },
  {
    theme: "Service",
    mentions: 19,
    sentiment: "positive",
    example: "Staff resolved a billing mix-up quickly.",
    status: "Closed",
  },
  {
    theme: "Wait time",
    mentions: 16,
    sentiment: "negative",
    example: "Lines stretch past the entrance after 12:15.",
    status: "Open",
  },
  {
    theme: "Cleanliness",
    mentions: 11,
    sentiment: "neutral",
    example: "Seating area varies by location and time of day.",
    status: "Investigating",
  },
];

export const marketRiskSeries: RiskSeriesPoint[] = (() => {
  const cats = ["Liquidity", "Activity", "Profitability", "Leverage"];
  const out: RiskSeriesPoint[] = [];
  MONTHS.forEach((date, mi) => {
    cats.forEach((category, ci) => {
      const noise = hashUnit(`risk:${category}:${date}`);
      const value = round1(36 + ci * 5 + mi * 1.4 + (noise - 0.5) * 7);
      const prev = round1(36 + ci * 5 + (mi - 1) * 1.4);
      out.push({
        date,
        category,
        value,
        change: round1(value - prev),
        status: Math.abs(value - prev) > 3 ? "Flagged" : "Closed",
      });
    });
  });
  return out;
})();

export const serviceFieldTickets: ServiceTicket[] = [
  {
    id: "SRV-1042",
    category: "Maintenance",
    openedAt: "2025-09-18",
    priority: "P2",
    status: "Open",
    neighborhood: "Harbor",
    ageDays: 5,
  },
  {
    id: "SRV-1048",
    category: "Technical",
    openedAt: "2025-09-20",
    priority: "P1",
    status: "In progress",
    neighborhood: "North",
    ageDays: 3,
  },
  {
    id: "SRV-1051",
    category: "Refill",
    openedAt: "2025-09-21",
    priority: "P3",
    status: "Open",
    neighborhood: "West",
    ageDays: 2,
  },
  {
    id: "SRV-1055",
    category: "Installation",
    openedAt: "2025-09-15",
    priority: "P2",
    status: "Closed",
    neighborhood: "Central",
    ageDays: 8,
  },
  {
    id: "SRV-1060",
    category: "Maintenance",
    openedAt: "2025-09-22",
    priority: "P1",
    status: "Open",
    neighborhood: "Harbor",
    ageDays: 1,
  },
  {
    id: "SRV-1063",
    category: "Technical",
    openedAt: "2025-09-12",
    priority: "P3",
    status: "Closed",
    neighborhood: "North",
    ageDays: 11,
  },
  {
    id: "SRV-1066",
    category: "Refill",
    openedAt: "2025-09-19",
    priority: "P2",
    status: "In progress",
    neighborhood: "West",
    ageDays: 4,
  },
  {
    id: "SRV-1070",
    category: "Installation",
    openedAt: "2025-09-23",
    priority: "P3",
    status: "Open",
    neighborhood: "Central",
    ageDays: 0,
  },
];

export const professionalIntakeQueue: IntakeRequest[] = [
  {
    id: "INT-220",
    type: "Consultation",
    submittedAt: "2025-09-20T13:10:00Z",
    status: "Open",
    channel: "Web",
    slaHours: 24,
  },
  {
    id: "INT-221",
    type: "Document Review",
    submittedAt: "2025-09-21T09:40:00Z",
    status: "Waiting",
    channel: "Referral",
    slaHours: 48,
  },
  {
    id: "INT-222",
    type: "Referral",
    submittedAt: "2025-09-21T15:05:00Z",
    status: "Open",
    channel: "Phone",
    slaHours: 24,
  },
  {
    id: "INT-223",
    type: "Compliance Check",
    submittedAt: "2025-09-22T10:22:00Z",
    status: "Open",
    channel: "Web",
    slaHours: 72,
  },
  {
    id: "INT-224",
    type: "Consultation",
    submittedAt: "2025-09-18T11:00:00Z",
    status: "Closed",
    channel: "Phone",
    slaHours: 24,
  },
  {
    id: "INT-225",
    type: "Document Review",
    submittedAt: "2025-09-23T08:55:00Z",
    status: "Waiting",
    channel: "Web",
    slaHours: 48,
  },
];

export const sustainabilityByLocation: LocationResourceRow[] = (() => {
  const sites = ["North Site", "Central Site", "South Site", "East Site"];
  const out: LocationResourceRow[] = [];
  MONTHS.forEach((date, mi) => {
    sites.forEach((location, li) => {
      const n = hashUnit(`sust:${location}:${date}`);
      out.push({
        date,
        location,
        electricity: Math.round(180 + li * 25 + mi * 6 + n * 20),
        water: Math.round(90 + li * 12 + mi * 3 + n * 10),
        waste: Math.round(40 + li * 8 + mi * 2 + n * 6),
        status: n > 0.72 ? "Review" : n > 0.35 ? "Open" : "Closed",
      });
    });
  });
  return out;
})();

export const urbanTreeCoverage: NeighborhoodCoverage[] = [
  {
    neighborhood: "Roxbury",
    trees: 412,
    canopyPct: 18.4,
    populationProxy: 52_000,
    status: "Needs survey",
  },
  {
    neighborhood: "Dorchester",
    trees: 538,
    canopyPct: 22.1,
    populationProxy: 96_000,
    status: "Open",
  },
  {
    neighborhood: "Mattapan",
    trees: 296,
    canopyPct: 15.7,
    populationProxy: 28_000,
    status: "Needs survey",
  },
  {
    neighborhood: "Jamaica Plain",
    trees: 610,
    canopyPct: 31.2,
    populationProxy: 41_000,
    status: "Closed",
  },
  {
    neighborhood: "South End",
    trees: 245,
    canopyPct: 12.9,
    populationProxy: 32_000,
    status: "Open",
  },
  {
    neighborhood: "East Boston",
    trees: 188,
    canopyPct: 9.6,
    populationProxy: 47_000,
    status: "Needs survey",
  },
];

export const housingInquirySeries: HousingInquirySeries[] = (() => {
  const neighborhoods = ["Roxbury", "Dorchester", "Mattapan", "South End"];
  const out: HousingInquirySeries[] = [];
  MONTHS.forEach((date, mi) => {
    neighborhoods.forEach((neighborhood, ni) => {
      const n = hashUnit(`house:${neighborhood}:${date}`);
      const inquiries = Math.round(26 + ni * 5 + mi * 2 + n * 9);
      out.push({
        date,
        neighborhood,
        inquiries,
        waitlist: Math.round(inquiries * (0.35 + n * 0.25)),
        status: n > 0.7 ? "Referral" : n > 0.4 ? "Open" : "Closed",
      });
    });
  });
  return out;
})();

/** Convenience map of richer datasets keyed by challenge slug. */
export const specializedDatasets = {
  "personal-ai-assistant": {
    emails: personalAssistantEmails,
    events: personalAssistantEvents,
  },
  "customer-experience": {
    themes: customerFeedbackThemes,
  },
  "market-risk-intelligence": {
    series: marketRiskSeries,
  },
  "service-field-operations": {
    tickets: serviceFieldTickets,
  },
  "professional-services": {
    intake: professionalIntakeQueue,
  },
  "sustainability-impact": {
    locations: sustainabilityByLocation,
  },
  "urban-trees-climate": {
    coverage: urbanTreeCoverage,
  },
  "housing-community": {
    inquiries: housingInquirySeries,
  },
} as const;
