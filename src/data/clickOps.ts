import type { Challenge } from "./challenges";
import { challenges } from "./challenges";

export type ClickOpsAction = {
  id: string;
  label: string;
  description: string;
  category: "website" | "dashboard" | "data" | "product" | "deploy";
  /** Prompt appended after challenge context */
  prompt: string;
  /** Prefer extracting this kind of artifact from the reply */
  artifactHint: "html" | "markdown" | "tsx" | "json" | "css";
};

const SHARED: ClickOpsAction[] = [
  {
    id: "build-website",
    label: "Build website",
    description: "Tek sayfalık landing + dashboard preview HTML üret",
    category: "website",
    artifactHint: "html",
    prompt: `Build a complete, polished single-file HTML website for this challenge.
Requirements:
- Self-contained HTML with embedded CSS (no external deps except Google Fonts if needed)
- Outfit + Space Mono feel; purple #7450e8, lime #d7fb52, bg #f4f4fa
- Hero with decision question, CTA, and a demo dashboard section with realistic fictional KPIs/charts (SVG or CSS bars)
- Privacy note: fictional demo data
- Mobile responsive
Return ONLY the full HTML document in a fenced \`\`\`html code block, then a short Turkish+English note on how to open/publish it.`,
  },
  {
    id: "improve-dashboard",
    label: "Improve dashboard",
    description: "Mevcut dashboard UX/UI iyileştirme planı + bileşen kodu",
    category: "dashboard",
    artifactHint: "tsx",
    prompt: `Improve the starter dashboard for this challenge.
Provide:
1) UX critique (5 bullets)
2) A React+Tailwind TSX component that upgrades the view (filters, KPIs, chart layout, empty states)
3) Accessibility notes
Use fictional sample data inline. Prefer Recharts-style structure. Put the main component in a \`\`\`tsx fence.`,
  },
  {
    id: "generate-copy",
    label: "Product copy",
    description: "Landing metinleri, CTA, onboarding mikro-kopya",
    category: "product",
    artifactHint: "markdown",
    prompt: `Write product copy for this challenge as a workshop-ready brief in Markdown:
- Hero headline + subhead
- 3 value props
- CTA variants (primary/secondary)
- Empty states + error messages
- Privacy disclaimer
Keep tone human-centered, concrete, non-hype. Bilingual sections: TR then EN.`,
  },
  {
    id: "data-schema",
    label: "Data schema",
    description: "CSV/JSON şema + örnek satırlar + metrik tanımları",
    category: "data",
    artifactHint: "json",
    prompt: `Design the data model for this challenge:
1) JSON schema for core entities
2) 8 fictional sample records
3) Metric definitions (numerator/denominator, refresh cadence)
4) Caveats: what cannot be inferred
Return a \`\`\`json block for the schema+samples and markdown explanation.`,
  },
  {
    id: "cursor-prompts",
    label: "Cursor prompts",
    description: "Cursor’da adım adım build prompt paketi",
    category: "product",
    artifactHint: "markdown",
    prompt: `Create a CURSOR_PROMPTS.md style pack for this challenge with 6 sequential prompts:
Discovery → Data → Dashboard UI → Security/Auth → Deploy → Review.
Each prompt should be copy-paste ready, specific to this decision problem, and warn about secrets/PII.`,
  },
  {
    id: "deploy-plan",
    label: "Deploy plan",
    description: "Vercel + env + domain ClickOps checklist",
    category: "deploy",
    artifactHint: "markdown",
    prompt: `Write a ClickOps deployment checklist for publishing this challenge demo:
- Local verify
- Vercel project create (UI clicks)
- Env vars (ANTHROPIC_API_KEY etc.) — never commit secrets
- Preview vs production
- Smoke test checklist
- Rollback note
Format as numbered ClickOps steps a non-engineer can follow.`,
  },
];

const BY_SLUG: Record<string, ClickOpsAction[]> = {
  "personal-ai-assistant": [
    {
      id: "pa-morning-brief",
      label: "Morning brief UI",
      description: "Inbox + calendar + priorities morning page HTML",
      category: "website",
      artifactHint: "html",
      prompt:
        "Build a self-contained HTML morning brief: inbox cards, calendar timeline, priority checklist with localStorage. Fictional data only. No OAuth. Return full HTML.",
    },
    {
      id: "pa-integrations",
      label: "Integrations guide",
      description: "Gmail/Calendar OAuth güvenli mimari",
      category: "deploy",
      artifactHint: "markdown",
      prompt:
        "Write INTEGRATIONS.md for Gmail + Google Calendar: OAuth consent, least privilege scopes, server-side tokens, draft-only sends, Microsoft Graph alternative. No secrets in client.",
    },
  ],
  "supply-chain-demand": [
    {
      id: "sc-forecast-ui",
      label: "Forecast UI",
      description: "Talep tahmini lab arayüzü HTML",
      category: "dashboard",
      artifactHint: "html",
      prompt:
        "Build a self-contained HTML forecast lab UI: horizon select, model compare table (seasonal naive/MA/linear), SVG chart for observed vs forecast, human-review caveats. Fictional series.",
    },
    {
      id: "sc-replenishment",
      label: "Replenishment view",
      description: "Lokasyon bazlı stok yenileme paneli",
      category: "dashboard",
      artifactHint: "tsx",
      prompt:
        "Design a React replenishment watchlist component: location, latest demand, avg, gap, watch flag, CTA to forecast. Include sample data and sorting.",
    },
  ],
  "customer-experience": [
    {
      id: "cx-themes",
      label: "Theme explorer",
      description: "Feedback tema + sentiment dashboard",
      category: "dashboard",
      artifactHint: "html",
      prompt:
        "Build HTML dashboard for feedback themes: theme chips, sentiment bars, investigation queue table, filters. Fictional reviews.",
    },
  ],
  "service-field-operations": [
    {
      id: "svc-backlog",
      label: "Backlog board",
      description: "Servis talebi öncelik panosu",
      category: "dashboard",
      artifactHint: "html",
      prompt:
        "Build HTML service backlog board: P1/P2/P3 columns or table, open vs closed KPIs, age days, neighborhood. Fictional tickets.",
    },
  ],
  "sustainability-impact": [
    {
      id: "sus-sites",
      label: "Site impact report",
      description: "Lokasyon kaynak kullanımı raporu",
      category: "website",
      artifactHint: "html",
      prompt:
        "Build HTML sustainability report: electricity/water/waste by site, trends, caveats about what the measure leaves out.",
    },
  ],
  "urban-trees-climate": [
    {
      id: "trees-map-story",
      label: "Canopy story page",
      description: "Mahalle örtüsü storytelling sayfası",
      category: "website",
      artifactHint: "html",
      prompt:
        "Build HTML urban canopy story: neighborhood cards with canopy %, missing coverage callouts, simple CSS map-like grid. Fictional Boston-area names ok.",
    },
  ],
  "housing-community": [
    {
      id: "housing-needs",
      label: "Needs brief site",
      description: "Konut ihtiyacı community brief",
      category: "website",
      artifactHint: "html",
      prompt:
        "Build HTML community housing needs brief: inquiry trends by neighborhood, emerging needs, what cannot be inferred from data alone.",
    },
  ],
  "market-risk-intelligence": [
    {
      id: "risk-monitor",
      label: "Risk monitor",
      description: "Likidite/aktivite/kârlılık monitörü",
      category: "dashboard",
      artifactHint: "html",
      prompt:
        "Build HTML market risk monitor: multi-series sparklines (SVG), score cards, interpretation caveats before acting on signals.",
    },
  ],
  "professional-services": [
    {
      id: "intake-flow",
      label: "Intake workflow",
      description: "Profesyonel hizmet intake sitesi",
      category: "website",
      artifactHint: "html",
      prompt:
        "Build HTML professional services intake: request types, pipeline stages, SLA hints, intake form mock (no backend). Fictional firm.",
    },
  ],
};

export function getClickOpsActions(slug: string): ClickOpsAction[] {
  return [...SHARED, ...(BY_SLUG[slug] ?? [])];
}

export function getClickOpsAction(
  slug: string,
  actionId: string,
): ClickOpsAction | undefined {
  return getClickOpsActions(slug).find((a) => a.id === actionId);
}

export function buildSystemPrompt(challenge: Challenge) {
  return `You are Decision Lab ClickOps — a senior product engineer + workshop facilitator.
You help participants turn decision challenges into usable websites, dashboards, and deploy checklists using Claude.

Challenge context:
- Number: ${challenge.number}
- Name: ${challenge.name}
- Title: ${challenge.title}
- Category: ${challenge.category}
- Decision question: ${challenge.question}
- Problem: ${challenge.problem}
- Ideas: ${challenge.ideas.join("; ")}
- Measure: ${challenge.measure} (${challenge.unit})
- Categories in sample data: ${challenge.categories.join(", ")}
- Suggested brief: ${challenge.suggestion}
- External source pointer: ${challenge.source.name} (${challenge.source.url})

Rules:
- Prefer actionable ClickOps (click-by-click) and copy-paste ready artifacts.
- Use fictional sample data only unless the user pastes their own.
- Never ask for or invent real API secrets; show placeholders like ANTHROPIC_API_KEY.
- When producing a website, return a complete HTML document in one fenced code block.
- Match Decision Lab brand: purple #7450e8, lime #d7fb52, bg #f4f4fa, Outfit/Space Mono vibe.
- Respond in Turkish when the user writes Turkish; keep code identifiers in English.
- Be concrete and shippable — not generic advice.`;
}

export function buildActionUserMessage(
  challenge: Challenge,
  action: ClickOpsAction,
  extra?: string,
) {
  return [
    `ClickOps action: ${action.label} (${action.id})`,
    `Goal: ${action.description}`,
    "",
    action.prompt,
    extra?.trim() ? `\nAdditional user notes:\n${extra.trim()}` : "",
    "",
    `Challenge slug: ${challenge.slug}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export const clickOpsCategories = [
  { id: "website", label: "Website" },
  { id: "dashboard", label: "Dashboard" },
  { id: "data", label: "Data" },
  { id: "product", label: "Product" },
  { id: "deploy", label: "Deploy" },
] as const;

export function allOpsPaths() {
  return challenges.map((c) => ({ slug: c.slug }));
}
