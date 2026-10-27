import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ApiKeyPanel from "@/components/ApiKeyPanel";
import { challenges } from "@/data/challenges";

export const metadata: Metadata = {
  title: "Settings · Decision Lab",
  description: "Add your Claude (Anthropic) API key for ClickOps builds.",
};

export default function SettingsPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[820px] px-[5%] py-12">
        <div className="eyebrow">
          <span className="eyebrow-dot" aria-hidden />
          Settings
        </div>
        <h1 className="mt-3 text-[clamp(32px,5vw,48px)] font-extrabold tracking-[-0.05em]">
          Claude API & ClickOps
        </h1>
        <p className="mt-3 max-w-[58ch] text-[15px] leading-relaxed text-muted">
          Her challenge için website, dashboard ve deploy checklist üretmek üzere
          Anthropic Claude kullanırız. Key’i tarayıcıda saklayabilir veya{" "}
          <code className="font-mono text-[13px]">.env.local</code> içine{" "}
          <code className="font-mono text-[13px]">ANTHROPIC_API_KEY</code> yazabilirsin.
        </p>

        <div className="mt-8">
          <ApiKeyPanel />
        </div>

        <section className="mt-10">
          <h2 className="text-lg font-extrabold tracking-[-0.03em]">
            Open ClickOps for a project
          </h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {challenges.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/ops/${c.slug}`}
                  className="flex items-center justify-between rounded-[14px] border border-border bg-surface px-4 py-3 text-[13px] font-bold no-underline transition hover:border-purple/35 hover:bg-soft-purple"
                >
                  <span>
                    <span className="font-mono text-[10px] text-purple">
                      {c.number}
                    </span>{" "}
                    {c.name}
                  </span>
                  <span aria-hidden>→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 rounded-[16px] border border-border bg-soft-purple/60 p-5 text-[13px] leading-relaxed text-[#56478e]">
          <strong className="text-purple-deep">Env (recommended for deploy)</strong>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-surface p-3 font-mono text-[12px] text-ink">{`ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-5-20250929`}</pre>
          <p className="mt-2">
            Server env key is used when the browser header is empty. Never commit
            real keys to git.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
