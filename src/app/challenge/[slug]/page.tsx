import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProjectNotes from "@/components/ProjectNotes";
import SmartGuide from "@/components/SmartGuide";
import { challenges, getChallenge } from "@/data/challenges";
import { getProjectNotes } from "@/data/projectNotes";
import { generateSampleRows } from "@/data/sampleData";
import ChallengeActions from "./ChallengeActions";

export const instant = false;

const CURSOR_STEPS = [
  "Open the downloaded kit in Cursor and read PROJECT_BRIEF.md.",
  "Ask the assistant to clarify the decision, audience, and success criteria.",
  "Inspect sample (or your) data — schema, gaps, and three defensible metrics.",
  "Adapt the dashboard UI to your brief; keep empty and error states.",
  "If connecting real data, plan auth, RLS, and secrets on the server only.",
  "Review calculations, attribution, and privacy before sharing or deploying.",
] as const;

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return challenges.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const challenge = getChallenge(slug);
  if (!challenge) return { title: "Challenge · Decision Lab" };
  return {
    title: `${challenge.title} · Decision Lab`,
    description: challenge.question,
  };
}

export default async function ChallengePage({ params }: PageProps) {
  const { slug } = await params;
  const challenge = getChallenge(slug);
  if (!challenge) notFound();

  const sampleRows = generateSampleRows(challenge).slice(0, 3);
  const notes = getProjectNotes(challenge.slug);

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[1280px] px-[5%] py-10 pb-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
          <div>
            <section className="animate-fade-up">
              <div className="eyebrow">
                <span className="eyebrow-dot" aria-hidden />
                {challenge.category} / Challenge {challenge.number}
              </div>
              <h1 className="mt-3 text-[clamp(36px,5.5vw,56px)] font-extrabold leading-[1.05] tracking-[-0.05em] text-ink">
                {challenge.title}
              </h1>
              <p className="mt-4 max-w-[58ch] text-[17px] leading-relaxed text-muted">
                {challenge.problem}
              </p>
              <div className="mt-6">
                <ChallengeActions challenge={challenge} />
              </div>
            </section>

            {notes ? (
              <div className="mt-12 space-y-8 animate-fade-up animate-delay-1">
                <ProjectNotes notes={notes} />
                <SmartGuide
                  title={`${challenge.name} · Smart guide`}
                  subtitle="Light each square as you finish. Purple = current step, lime = done."
                  steps={notes.guide}
                  storageKey={`decisionlab-guide-${challenge.slug}`}
                />
              </div>
            ) : null}

            <section className="mt-14 animate-fade-up animate-delay-1">
              <div className="font-mono text-[12px] font-bold text-purple">
                01
              </div>
              <h2 className="mt-2 text-[28px] font-extrabold tracking-[-0.04em] text-ink">
                Your challenge
              </h2>
              <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-muted">
                {challenge.problem}
              </p>
              <ul className="mt-5 space-y-2.5">
                {challenge.ideas.map((idea) => (
                  <li
                    key={idea}
                    className="flex gap-3 text-[14px] leading-relaxed text-ink"
                  >
                    <span
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-lime"
                      aria-hidden
                    />
                    {idea}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[13px] text-muted">
                <span className="font-bold text-ink">Decision question:</span>{" "}
                {challenge.question}
              </p>
            </section>

            <section className="mt-14 animate-fade-up animate-delay-2">
              <div className="font-mono text-[12px] font-bold text-purple">
                02
              </div>
              <h2 className="mt-2 text-[28px] font-extrabold tracking-[-0.04em] text-ink">
                Sample data
              </h2>
              <p className="mt-2 text-[14px] text-muted">
                Three fictional rows of {challenge.measure.toLowerCase()} (
                {challenge.unit}). Full sample ships in{" "}
                <code className="font-mono text-[12px]">
                  projects/{challenge.slug}/data/sample_data.csv
                </code>
                .
              </p>
              <div className="mt-5 overflow-x-auto rounded-[16px] border border-border bg-surface shadow-[var(--shadow-card)]">
                <table className="w-full min-w-[480px] border-collapse text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-border bg-soft-purple/60">
                      <th className="px-4 py-3 font-bold">Date</th>
                      <th className="px-4 py-3 font-bold">Category</th>
                      <th className="px-4 py-3 font-bold">Value</th>
                      <th className="px-4 py-3 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleRows.map((row) => (
                      <tr
                        key={`${row.date}-${row.category}-${row.value}`}
                        className="border-b border-border-soft last:border-0"
                      >
                        <td className="px-4 py-3 text-muted">{row.date}</td>
                        <td className="px-4 py-3 font-semibold">
                          {row.category}
                        </td>
                        <td className="px-4 py-3">{row.value}</td>
                        <td className="px-4 py-3">{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-14">
              <div className="font-mono text-[12px] font-bold text-purple">
                03
              </div>
              <h2 className="mt-2 text-[28px] font-extrabold tracking-[-0.04em] text-ink">
                Go further
              </h2>
              <div className="mt-5 rounded-[16px] border border-border bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
                <span className="inline-flex rounded-full bg-soft-purple px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-purple">
                  Source
                </span>
                <h3 className="mt-3 text-lg font-extrabold tracking-[-0.03em] text-ink">
                  {challenge.source.name}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">
                  {challenge.source.description}
                </p>
                <dl className="mt-4 space-y-2 text-[13px]">
                  <div>
                    <dt className="font-bold text-ink">License</dt>
                    <dd className="text-muted">{challenge.source.license}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-ink">API note</dt>
                    <dd className="text-muted">{challenge.source.apiNote}</dd>
                  </div>
                </dl>
                <a
                  href={challenge.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary mt-4 inline-flex"
                >
                  View source documentation ↗
                </a>
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[18px] border border-border bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
              <div className="eyebrow">
                <span className="eyebrow-dot" aria-hidden />
                Build kit
              </div>
              <h2 className="mt-2 text-[22px] font-extrabold tracking-[-0.03em] text-ink">
                Make it yours
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                Copy GitHub → Claude customizes a Cursor Agent prompt from your
                brief + this dashboard’s requirements. Paste into Cursor to
                work in{" "}
                <code className="font-mono text-[11px]">
                  projects/{challenge.slug}/
                </code>
                .
              </p>
              <div className="mt-5">
                <ChallengeActions challenge={challenge} variant="kit" />
              </div>
              <Link
                href={`/dashboard/${challenge.slug}`}
                className="mt-4 inline-flex text-[13px] font-bold text-purple no-underline hover:opacity-80"
              >
                Preview specialized dashboard →
              </Link>
            </div>

            <div className="mt-5 rounded-[18px] border border-border bg-dark-strip p-5 text-white sm:p-6">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-lime">
                6 Cursor steps
              </div>
              <ol className="mt-4 space-y-3">
                {CURSOR_STEPS.map((step, i) => (
                  <li key={step} className="flex gap-3 text-[13px] leading-snug">
                    <span className="font-mono text-[11px] font-bold text-lime">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-white/85">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
