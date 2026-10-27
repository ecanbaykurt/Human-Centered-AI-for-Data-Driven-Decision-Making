const STEPS = [
  {
    n: "01",
    title: "Choose a question",
    body: "Pick the challenge closest to your work. Start with the decision, not the chart.",
  },
  {
    n: "02",
    title: "Download & explore",
    body: "Describe your goal and data, then download a personalized project kit with a working demo and build prompts.",
  },
  {
    n: "03",
    title: "Make it your own",
    body: "Bring your data, check the results, and follow the guide to connect and publish your project.",
  },
] as const;

export default function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-24 bg-lavender px-[5%] py-[68px]">
      <div className="mx-auto grid max-w-[1300px] grid-cols-1 gap-10 lg:grid-cols-[1fr_2fr] lg:gap-[70px]">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-dot" aria-hidden />
            From idea to action
          </div>
          <h2 className="mt-3.5 text-[clamp(32px,4vw,40px)] font-extrabold leading-[1.1] tracking-[-0.05em] text-ink">
            Start small.
            <br />
            Build with purpose.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-5">
          {STEPS.map((step) => (
            <div key={step.n}>
              <b className="font-mono text-sm font-bold text-purple">{step.n}</b>
              <h3 className="mt-3 text-lg font-extrabold tracking-[-0.03em] text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
