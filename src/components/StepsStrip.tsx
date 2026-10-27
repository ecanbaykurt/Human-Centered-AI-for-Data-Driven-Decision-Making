const STEPS = [
  { n: "01", label: "Choose a challenge" },
  { n: "02", label: "Copy GitHub prompt" },
  { n: "03", label: "Build in Cursor" },
  { n: "04", label: "Share what you build" },
] as const;

export default function StepsStrip() {
  return (
    <div className="bg-dark-strip px-[5%] py-4 text-xs font-bold text-[#ece5f8]">
      <div className="mx-auto flex max-w-[1450px] flex-wrap items-center justify-start gap-x-8 gap-y-3 md:justify-center md:gap-x-14">
        {STEPS.map((step) => (
          <span key={step.n} className="inline-flex items-center gap-2.5">
            <b className="rounded-[4px] bg-[#7955eb] px-2.5 py-1.5 font-extrabold text-white">
              {step.n}
            </b>
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
}
