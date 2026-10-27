import Link from "next/link";
import type { Challenge } from "@/data/challenges";

const ART_POSITION: Record<number, string> = {
  0: "0% 50%",
  1: "34% 50%",
  2: "68% 50%",
  3: "100% 50%",
};

type ChallengeCardProps = {
  challenge: Challenge;
  onCustomize?: (challenge: Challenge) => void;
  onDownload?: (challenge: Challenge) => void;
};

export default function ChallengeCard({
  challenge,
  onCustomize,
  onDownload,
}: ChallengeCardProps) {
  const isPersonalAssistant = challenge.slug === "personal-ai-assistant";
  const artPosition = ART_POSITION[challenge.artVariant] ?? ART_POSITION[0];

  return (
    <article className="card-surface flex min-h-[300px] flex-col overflow-hidden px-[18px] pb-[17px] md:min-h-[335px]">
      <div
        className="relative mx-[-18px] mb-4 flex h-[125px] items-start justify-between overflow-hidden bg-cover px-4 py-3.5 text-white"
        style={{
          backgroundImage:
            "linear-gradient(0deg, rgba(25,17,39,0.533), rgba(25,17,39,0.067)), url('/workshop-art.png')",
          backgroundPosition: artPosition,
        }}
      >
        <span className="rounded-[3px] bg-ink px-2 py-1.5 font-mono text-[9px] font-bold uppercase tracking-wide">
          {challenge.category}
        </span>
        <strong className="font-extrabold tracking-[-0.08em] text-[42px] opacity-90">
          {challenge.number}
        </strong>
      </div>

      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-purple">
          {challenge.category} / STARTER KIT
        </span>
        <span className="text-sm text-muted-soft" aria-hidden>
          ↗
        </span>
      </div>

      <h3 className="mt-3 mb-1.5 text-[20px] font-extrabold tracking-[-0.03em] text-ink">
        {challenge.title}
      </h3>
      <p className="mb-4 text-[13px] leading-[1.5] text-muted-soft">
        {challenge.question}
      </p>

      <div className="mt-auto space-y-3 border-t border-border-soft pt-4 text-[13px] font-bold">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/challenge/${challenge.slug}`}
            className="text-purple no-underline transition-opacity hover:opacity-75"
          >
            Explore challenge →
          </Link>

          {isPersonalAssistant ? (
            <button
              type="button"
              className="btn-secondary text-[13px]"
              onClick={() => onDownload?.(challenge)}
            >
              Download ZIP ↓
            </button>
          ) : (
            <button
              type="button"
              className="btn-secondary text-[13px]"
              onClick={() => onCustomize?.(challenge)}
            >
              Customize →
            </button>
          )}
        </div>
        <Link
          href={`/ops/${challenge.slug}`}
          className="inline-flex w-full items-center justify-center rounded-full bg-dark-strip px-3 py-2.5 text-[12px] font-bold text-lime no-underline transition hover:opacity-90"
        >
          Open ClickOps · Claude →
        </Link>
      </div>
    </article>
  );
}
