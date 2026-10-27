import type { ProjectNotes as Notes } from "@/data/projectNotes";

export default function ProjectNotes({ notes }: { notes: Notes }) {
  return (
    <section
      id="project-notes"
      className="scroll-mt-24 rounded-[20px] border border-border bg-surface p-5 shadow-[var(--shadow-card)] sm:p-7"
    >
      <div className="eyebrow">
        <span className="eyebrow-dot" aria-hidden />
        Project notes
      </div>
      <h2 className="mt-2 text-[clamp(24px,3.5vw,32px)] font-extrabold tracking-[-0.04em] text-ink">
        Read before you build
      </h2>
      <p className="mt-2 text-[14px] text-muted">
        Audience: <strong className="text-ink">{notes.audience}</strong>
        <span className="mx-2 text-border">·</span>
        About <strong className="text-ink">{notes.timeMinutes} min</strong>
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-[14px] border border-border bg-[#fbfaff] p-4">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-purple">
            Outcomes
          </div>
          <ul className="mt-3 space-y-2">
            {notes.outcomes.map((o) => (
              <li key={o} className="flex gap-2 text-[13px] leading-snug text-ink">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-[3px] bg-lime" aria-hidden />
                {o}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[14px] border border-[#f0d4a8] bg-[#fff8eb] p-4">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a6a12]">
            Watch-outs
          </div>
          <ul className="mt-3 space-y-2">
            {notes.watchouts.map((w) => (
              <li
                key={w}
                className="flex gap-2 text-[13px] leading-snug text-[#5c4a20]"
              >
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-[3px] bg-[#e2b84a]"
                  aria-hidden
                />
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5">
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-purple">
          Facilitator notes
        </div>
        <ul className="mt-3 space-y-2.5">
          {notes.notes.map((n, i) => (
            <li
              key={n}
              className="flex gap-3 rounded-[12px] border border-border-soft bg-bg px-3.5 py-3 text-[13px] leading-relaxed text-ink"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] bg-purple font-mono text-[10px] font-bold text-white">
                {String(i + 1).padStart(2, "0")}
              </span>
              {n}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
