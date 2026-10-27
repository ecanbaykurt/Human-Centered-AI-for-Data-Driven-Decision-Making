import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SmartGuide from "@/components/SmartGuide";
import { challenges } from "@/data/challenges";
import { getProjectNotes } from "@/data/projectNotes";

export const metadata: Metadata = {
  title: "Smart Guide · Decision Lab",
  description:
    "Step-by-step workshop guide with lighted squares for every Decision Lab project.",
};

const WORKSHOP_STEPS = [
  {
    id: "orient",
    title: "Orient",
    detail:
      "Read the landing story: decision first, then data, then dashboard. Pick one challenge closest to your work.",
    tip: "Ignore chart polish until the decision question is clear.",
    href: "/#explore",
    hrefLabel: "Explore 9 ideas →",
  },
  {
    id: "notes",
    title: "Read project notes",
    detail:
      "Open a challenge. Review outcomes, watch-outs, and facilitator notes before clicking tools.",
    tip: "Watch-outs prevent over-claiming from fictional sample data.",
    href: "/challenge/personal-ai-assistant",
    hrefLabel: "Example challenge →",
  },
  {
    id: "dashboard",
    title: "Preview dashboard",
    detail:
      "Use filters and tables. Ask what decision the numbers support — and what they leave out.",
    tip: "Write one sentence of interpretation before generating more UI.",
  },
  {
    id: "api",
    title: "Add Claude API key",
    detail:
      "Settings → paste sk-ant-… (browser) or set ANTHROPIC_API_KEY in .env.local for deploy.",
    tip: "Never commit real keys. Rotate if shared in a workshop room.",
    href: "/settings",
    hrefLabel: "Open settings →",
  },
  {
    id: "clickops",
    title: "Run ClickOps",
    detail:
      "Build website, improve dashboard, or generate deploy checklist. Download HTML and preview.",
    tip: "Follow-up in chat to refine copy or layout.",
    href: "/ops/personal-ai-assistant",
    hrefLabel: "Try ClickOps →",
  },
  {
    id: "vercel",
    title: "Deploy to Vercel",
    detail:
      "Push this repo, import on Vercel, add ANTHROPIC_API_KEY, ship a preview URL for the cohort.",
    tip: "Confirm /ops and /api/clickops work on the preview before sharing.",
  },
] as const;

export default function GuidePage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[1100px] px-[5%] py-12 pb-20">
        <div className="eyebrow">
          <span className="eyebrow-dot" aria-hidden />
          Workshop playbook
        </div>
        <h1 className="mt-3 text-[clamp(36px,5.5vw,56px)] font-extrabold tracking-[-0.05em] text-ink">
          Smart guide
        </h1>
        <p className="mt-4 max-w-[60ch] text-[17px] leading-relaxed text-muted">
          Squares light up as you move. Purple means the active step; lime means
          completed. Use the workshop path below, then open each project’s own
          notes + guide.
        </p>

        <div className="mt-10">
          <SmartGuide
            title="Workshop path"
            subtitle="One lighted path from idea → Claude ClickOps → Vercel."
            steps={[...WORKSHOP_STEPS]}
            storageKey="decisionlab-guide-workshop"
          />
        </div>

        <section className="mt-14">
          <h2 className="text-[28px] font-extrabold tracking-[-0.04em] text-ink">
            Notes for every project
          </h2>
          <p className="mt-2 text-[14px] text-muted">
            Each card links to challenge notes, smart guide, dashboard, and
            ClickOps.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {challenges.map((c) => {
              const notes = getProjectNotes(c.slug);
              return (
                <li
                  key={c.slug}
                  className="rounded-[16px] border border-border bg-surface p-4 shadow-[var(--shadow-card)]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-purple">
                      {c.number}
                    </span>
                    <span className="guide-light is-on-lime" aria-hidden />
                  </div>
                  <h3 className="mt-2 text-[16px] font-extrabold tracking-[-0.03em]">
                    {c.name}
                  </h3>
                  <p className="mt-1 text-[12px] leading-snug text-muted">
                    {notes
                      ? `${notes.timeMinutes} min · ${notes.audience}`
                      : c.question}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-[12px] font-bold">
                    <Link
                      href={`/challenge/${c.slug}#project-notes`}
                      className="text-purple no-underline hover:opacity-75"
                    >
                      Notes
                    </Link>
                    <span className="text-border">·</span>
                    <Link
                      href={`/challenge/${c.slug}#smart-guide`}
                      className="text-purple no-underline hover:opacity-75"
                    >
                      Guide
                    </Link>
                    <span className="text-border">·</span>
                    <Link
                      href={`/ops/${c.slug}`}
                      className="text-purple no-underline hover:opacity-75"
                    >
                      ClickOps
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
