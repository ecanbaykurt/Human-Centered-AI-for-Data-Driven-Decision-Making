export type GuideStep = {
  id: string;
  title: string;
  detail: string;
  tip: string;
  href?: string;
  hrefLabel?: string;
};

export type ProjectNotes = {
  slug: string;
  audience: string;
  timeMinutes: number;
  outcomes: string[];
  watchouts: string[];
  notes: string[];
  guide: GuideStep[];
};

const sharedTail = (slug: string): GuideStep[] => [
  {
    id: "clickops",
    title: "Open ClickOps",
    detail:
      "Paste your Claude API key (Settings), pick Build website or Improve dashboard, then Run ClickOps.",
    tip: "HTML artifacts can be previewed and downloaded from the right panel.",
    href: `/ops/${slug}`,
    hrefLabel: "Open ClickOps →",
  },
  {
    id: "kit",
    title: "Copy GitHub prompt",
    detail:
      "Fill your brief → Copy GitHub. Claude customizes a Cursor Agent prompt with the open-source path projects/" +
      slug +
      "/. Paste into Cursor to start building.",
    tip: "Never put secrets in prompts or commit API keys.",
    href: `/challenge/${slug}`,
    hrefLabel: "Challenge brief →",
  },
  {
    id: "ship",
    title: "Review & share",
    detail:
      "Check metrics definitions, fictional-data disclaimers, and accessibility. Share a preview or deploy to Vercel when ready.",
    tip: "Human review before any real decision or live mailbox connection.",
  },
];

export const projectNotes: Record<string, ProjectNotes> = {
  "personal-ai-assistant": {
    slug: "personal-ai-assistant",
    audience: "Individual contributors & workshop facilitators",
    timeMinutes: 45,
    outcomes: [
      "Morning view of inbox, calendar, and priorities",
      "Safe path toward Gmail/Calendar (server-side OAuth later)",
      "ClickOps HTML brief you can open offline",
    ],
    watchouts: [
      "Demo uses fictional messages — no live accounts",
      "Never put OAuth tokens in the browser or git",
      "Draft-only before any send/write scopes",
    ],
    notes: [
      "Start with the decision: what should someone do in the first 10 minutes of the day?",
      "Priorities are saved in localStorage key decisionlab-personal-tasks-v1.",
      "See projects/personal-ai-assistant/AGENT.md for Google Workspace / Graph notes.",
      "Use ClickOps → Morning brief UI for a shareable single-file HTML demo.",
    ],
    guide: [
      {
        id: "decide",
        title: "Name the morning decision",
        detail:
          "Write one sentence: who is helped, and what they should prioritize after opening the assistant.",
        tip: "Example: “Help a program manager clear replies before 10am meetings.”",
      },
      {
        id: "preview",
        title: "Preview the dashboard",
        detail:
          "Open the personal assistant demo. Scan inbox pills, calendar blocks, and add a priority.",
        tip: "Treat status pills as workflow hints, not AI judgments.",
        href: "/dashboard/personal-ai-assistant",
        hrefLabel: "Open dashboard →",
      },
      ...sharedTail("personal-ai-assistant"),
    ],
  },
  "supply-chain-demand": {
    slug: "supply-chain-demand",
    audience: "Operations & inventory planners",
    timeMinutes: 50,
    outcomes: [
      "Location demand comparison + replenishment watch list",
      "Baseline forecasts (seasonal naive / MA / linear) in Forecast Lab",
      "ClickOps forecast UI or website you can share",
    ],
    watchouts: [
      "Holdout MAE/WAPE ≠ future guarantee",
      "Stockouts and promotions distort observed demand",
      "UCI datasets are links only — prep date,value yourself",
    ],
    notes: [
      "Start from replenishment decisions, not chart aesthetics.",
      "Filter by location before interpreting averages.",
      "Forecast Lab runs entirely in the browser on synthetic or uploaded CSV.",
      "Neural nets are suggested for Cursor later — not executed in the lab.",
    ],
    guide: [
      {
        id: "decide",
        title: "Define the inventory question",
        detail:
          "Pick a horizon (7 days / 4 weeks / quarter) and which location hurts most if stock runs out.",
        tip: "Write the decision on the challenge brief before opening charts.",
      },
      {
        id: "preview",
        title: "Explore demand dashboard",
        detail:
          "Compare units by location, monthly trend, and watch-list gaps.",
        tip: "Watch rows are cues for human follow-up, not auto-orders.",
        href: "/dashboard/supply-chain-demand",
        hrefLabel: "Open dashboard →",
      },
      {
        id: "forecast",
        title: "Run Forecast Lab",
        detail:
          "Compare baselines on the sample series or upload ≥28 consecutive daily rows.",
        tip: "Read the human-review caveats before acting on numbers.",
        href: "/forecast",
        hrefLabel: "Open Forecast Lab →",
      },
      ...sharedTail("supply-chain-demand"),
    ],
  },
  "customer-experience": {
    slug: "customer-experience",
    audience: "CX & research teams",
    timeMinutes: 40,
    outcomes: [
      "Theme + sentiment overview",
      "Investigation priority queue",
      "ClickOps theme explorer site",
    ],
    watchouts: [
      "Themes in the demo are fictional aggregates",
      "Sentiment labels are illustrative — validate with humans",
      "Text datasets need privacy review before import",
    ],
    notes: [
      "Ask what decision an investigation unlocks (fix, staffing, FAQ).",
      "Filter by theme before ranking “most mentions”.",
      "Pair quantitative themes with at least one qualitative quote.",
      "ClickOps → Theme explorer for a stakeholder-ready HTML page.",
    ],
    guide: [
      {
        id: "decide",
        title: "Pick the CX decision",
        detail:
          "Decide what “prioritize investigation” means for your team this week.",
        tip: "One decision > many charts.",
      },
      {
        id: "preview",
        title: "Scan themes & sentiment",
        detail:
          "Open the customer dashboard; note top themes and open investigations.",
        tip: "High volume ≠ highest severity.",
        href: "/dashboard/customer-experience",
        hrefLabel: "Open dashboard →",
      },
      ...sharedTail("customer-experience"),
    ],
  },
  "service-field-operations": {
    slug: "service-field-operations",
    audience: "Service & field ops leads",
    timeMinutes: 40,
    outcomes: [
      "Backlog by category and priority",
      "Open vs closed clarity",
      "ClickOps backlog board HTML",
    ],
    watchouts: [
      "Age days can hide seasonal spikes",
      "P1/P2/P3 need local definitions",
      "Bike-sharing source is a capacity proxy, not real tickets",
    ],
    notes: [
      "Define “done” before comparing open vs closed.",
      "Sort by age × priority for triage practice.",
      "Neighborhood fields are for routing discussions, not surveillance.",
      "Use ClickOps → Backlog board for facilitator printouts.",
    ],
    guide: [
      {
        id: "decide",
        title: "Set triage rules",
        detail:
          "Agree how P1 differs from P2 and who owns aging tickets.",
        tip: "Write rules in the project kit brief.",
      },
      {
        id: "preview",
        title: "Inspect the backlog",
        detail: "Open the service dashboard; compare categories and queue.",
        tip: "Call out what the measure leaves out (travel time, parts).",
        href: "/dashboard/service-field-operations",
        hrefLabel: "Open dashboard →",
      },
      ...sharedTail("service-field-operations"),
    ],
  },
  "sustainability-impact": {
    slug: "sustainability-impact",
    audience: "Sustainability & facilities teams",
    timeMinutes: 40,
    outcomes: [
      "Site-level resource comparison",
      "Trend view with caveats",
      "ClickOps site impact report",
    ],
    watchouts: [
      "Units are fictional proxies — not audited emissions",
      "Occupancy and weather confound comparisons",
      "Do not claim ESG compliance from this demo",
    ],
    notes: [
      "Separate electricity, water, and waste before rolling up.",
      "Always state what the measure leaves out.",
      "Prefer relative change + investigation over absolute ranking.",
      "ClickOps → Site impact report for workshop handouts.",
    ],
    guide: [
      {
        id: "decide",
        title: "Choose the impact question",
        detail:
          "Which site and resource deserve investigation first — and why?",
        tip: "Tie the answer to an owner and a follow-up date.",
      },
      {
        id: "preview",
        title: "Compare sites",
        detail: "Open the sustainability dashboard; review trends and caveats.",
        tip: "Document confounders before sharing externally.",
        href: "/dashboard/sustainability-impact",
        hrefLabel: "Open dashboard →",
      },
      ...sharedTail("sustainability-impact"),
    ],
  },
  "urban-trees-climate": {
    slug: "urban-trees-climate",
    audience: "Community climate & planning groups",
    timeMinutes: 40,
    outcomes: [
      "Neighborhood canopy comparison",
      "Missing-coverage discussion prompts",
      "ClickOps canopy story page",
    ],
    watchouts: [
      "Inventory data may exclude parks / private trees",
      "Population proxies are illustrative",
      "Source geography may differ from your city — treat as method practice",
    ],
    notes: [
      "Ask whether area or population should normalize counts.",
      "Missing coverage is a research cue, not a final map.",
      "Pair data with community knowledge before recommending plantings.",
      "ClickOps → Canopy story for narrative + numbers.",
    ],
    guide: [
      {
        id: "decide",
        title: "Frame the greening decision",
        detail:
          "Where could greening matter most — heat, equity, or stewardship capacity?",
        tip: "State the criterion explicitly in your brief.",
      },
      {
        id: "preview",
        title: "Explore coverage",
        detail:
          "Open the trees dashboard; compare neighborhoods and gap callouts.",
        tip: "Note inventory limits in the caveats box.",
        href: "/dashboard/urban-trees-climate",
        hrefLabel: "Open dashboard →",
      },
      ...sharedTail("urban-trees-climate"),
    ],
  },
  "housing-community": {
    slug: "housing-community",
    audience: "Community organizations & local partners",
    timeMinutes: 40,
    outcomes: [
      "Inquiry trends by neighborhood",
      "Emerging-needs discussion prompts",
      "ClickOps community brief site",
    ],
    watchouts: [
      "Inquiries ≠ prevalence of need",
      "ACS estimates have margins of error",
      "Avoid identifying individuals from thin samples",
    ],
    notes: [
      "Separate waitlist pressure from short-term spikes.",
      "List what cannot be inferred before recommending programs.",
      "Use the kit to capture partner questions, not just charts.",
      "ClickOps → Needs brief for meeting-ready HTML.",
    ],
    guide: [
      {
        id: "decide",
        title: "Name the community decision",
        detail:
          "What program, partnership, or research step are you informing?",
        tip: "Keep PII out of uploaded CSVs.",
      },
      {
        id: "preview",
        title: "Review housing signals",
        detail:
          "Open the housing dashboard; compare neighborhoods over time.",
        tip: "Mark emerging needs as hypotheses to verify with partners.",
        href: "/dashboard/housing-community",
        hrefLabel: "Open dashboard →",
      },
      ...sharedTail("housing-community"),
    ],
  },
  "market-risk-intelligence": {
    slug: "market-risk-intelligence",
    audience: "Analysts & risk reviewers",
    timeMinutes: 45,
    outcomes: [
      "Multi-series indicator monitor",
      "Context-before-action checklist",
      "ClickOps risk monitor HTML",
    ],
    watchouts: [
      "Scores are workshop fiction — not investment advice",
      "Bankruptcy datasets are historical proxies",
      "Flagged ≠ automated trade or credit decision",
    ],
    notes: [
      "Always add narrative context before interpreting a spike.",
      "Compare Liquidity / Activity / Profitability separately first.",
      "Document who reviews flags and within what SLA.",
      "ClickOps → Risk monitor for a portable demo.",
    ],
    guide: [
      {
        id: "decide",
        title: "Define review triggers",
        detail:
          "What change size or persistence requires a human review?",
        tip: "Write triggers into PROJECT_BRIEF.md via the kit.",
      },
      {
        id: "preview",
        title: "Watch the indicators",
        detail:
          "Open the risk dashboard; inspect series and flagged rows.",
        tip: "Practice explaining one flag without over-claiming.",
        href: "/dashboard/market-risk-intelligence",
        hrefLabel: "Open dashboard →",
      },
      ...sharedTail("market-risk-intelligence"),
    ],
  },
  "professional-services": {
    slug: "professional-services",
    audience: "Professional services & intake teams",
    timeMinutes: 40,
    outcomes: [
      "Intake pipeline by request type",
      "SLA-aware workflow sketch",
      "ClickOps intake workflow site",
    ],
    watchouts: [
      "Never load real client/case details into demos",
      "Bank marketing source is a workflow proxy only",
      "Status Waiting needs an owner and next action",
    ],
    notes: [
      "Improve intake before optimizing “productivity” metrics.",
      "Track request type mix to staff the right skills.",
      "Use fictional firm names in ClickOps outputs.",
      "ClickOps → Intake workflow for stakeholder walkthroughs.",
    ],
    guide: [
      {
        id: "decide",
        title: "Map the intake decision",
        detail:
          "Where do requests stall today — form, triage, or handoff?",
        tip: "One bottleneck per workshop pass.",
      },
      {
        id: "preview",
        title: "Walk the pipeline",
        detail:
          "Open the services dashboard; review types, stages, and open items.",
        tip: "Confirm statuses match your real vocabulary.",
        href: "/dashboard/professional-services",
        hrefLabel: "Open dashboard →",
      },
      ...sharedTail("professional-services"),
    ],
  },
};

export function getProjectNotes(slug: string): ProjectNotes | undefined {
  return projectNotes[slug];
}
