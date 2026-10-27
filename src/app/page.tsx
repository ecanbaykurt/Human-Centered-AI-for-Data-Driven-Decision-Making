import Link from "next/link";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import StepsStrip from "@/components/StepsStrip";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import HomeCatalog from "@/components/HomeCatalog";

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <StepsStrip />
      <section className="border-b border-border bg-soft-purple/50 px-[5%] py-8">
        <div className="mx-auto flex max-w-[1300px] flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="guide-light is-on-purple mt-1.5" aria-hidden />
            <div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-purple">
                Smart guide
              </div>
              <p className="mt-1 max-w-[52ch] text-[15px] font-semibold tracking-[-0.02em] text-ink">
                Step-by-step squares with status lights for every project — notes,
                ClickOps, then Vercel.
              </p>
            </div>
          </div>
          <Link href="/guide" className="btn-primary shrink-0 text-[13px]">
            Open smart guide →
          </Link>
        </div>
      </section>
      <HomeCatalog />
      <HowItWorks />
      <Footer />
    </>
  );
}
