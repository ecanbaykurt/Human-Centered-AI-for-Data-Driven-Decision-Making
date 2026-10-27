import Link from "next/link";

export default function Hero() {
  return (
    <section className="mx-auto grid max-w-[1450px] grid-cols-1 items-center gap-8 px-[5%] pb-8 pt-10 md:grid-cols-[0.85fr_1.15fr] md:gap-8 md:pb-9 md:pt-10 lg:gap-8">
      <div className="animate-fade-up">
        <div className="eyebrow">
          <span className="eyebrow-dot" aria-hidden />
          Human-centered AI workshop
        </div>

        <h1 className="mt-5 font-extrabold leading-[0.98] tracking-[-0.06em] text-ink text-[clamp(48px,5.7vw,80px)]">
          Build ideas.
          <br />
          <em className="not-italic text-purple">Make impact.</em>
        </h1>

        <p className="mt-5 max-w-[570px] text-base leading-[1.7] text-muted">
          Turn a real problem into a dashboard you can make your own. Choose a
          challenge, explore the data, download a working starter, and make it
          your own in Cursor.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-5">
          <Link href="#explore" className="btn-primary">
            Explore the 9 ideas &nbsp;↗
          </Link>
          <Link href="#how" className="btn-secondary">
            How it works ↓
          </Link>
        </div>
      </div>

      <div className="animate-soft-scale animate-delay-1 relative flex min-h-[270px] flex-col justify-between overflow-hidden rounded-[18px] bg-[#22152b] bg-[url('/workshop-art.png')] bg-cover bg-center p-5 shadow-[var(--shadow-visual)] sm:min-h-[320px] md:min-h-[380px]">
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(11,11,23,0.72),transparent_40%,rgba(11,11,23,0.85))]"
          aria-hidden
        />

        <div className="relative z-10 flex justify-between font-mono text-[11px] font-bold tracking-[0.08em] text-white">
          <b>DECISION LAB</b>
          <span>DATA × PEOPLE × AI</span>
        </div>

        <div className="relative z-10 text-white">
          <span className="mb-2 inline-block bg-lime px-[9px] py-1.5 font-mono text-[10px] font-bold tracking-wide text-ink">
            CREATE WITH PURPOSE
          </span>
          <strong className="block font-extrabold leading-[0.9] tracking-[-0.05em] text-[clamp(36px,4vw,56px)]">
            YOUR IDEA
            <br />
            STARTS HERE.
          </strong>
          <small className="mt-2.5 block text-xs text-white/85">
            Explore. Build. Make it possible.
          </small>
        </div>
      </div>
    </section>
  );
}
