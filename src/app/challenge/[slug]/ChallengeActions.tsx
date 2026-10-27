"use client";

import { useState } from "react";
import Link from "next/link";
import type { Challenge } from "@/data/challenges";
import { projectGithubUrl, projectPath } from "@/data/github";
import ProjectKitModal from "@/components/ProjectKitModal";
import CopyGithubButton from "@/components/CopyGithubButton";

type ChallengeActionsProps = {
  challenge: Challenge;
  /** `hero` = primary CTAs; `kit` = aside build-kit buttons */
  variant?: "hero" | "kit";
};

export default function ChallengeActions({
  challenge,
  variant = "hero",
}: ChallengeActionsProps) {
  const [open, setOpen] = useState(false);
  const isSupply = challenge.slug === "supply-chain-demand";

  if (variant === "kit") {
    return (
      <>
        <Link
          href={`/ops/${challenge.slug}`}
          className="mb-3 flex w-full items-center justify-center rounded-full bg-dark-strip px-4 py-3 text-[13px] font-bold text-lime no-underline hover:opacity-90"
        >
          ClickOps · Build with Claude →
        </Link>
        <CopyGithubButton
          challenge={challenge}
          className="mb-3 w-full [&_button]:w-full"
          label="Copy GitHub"
        />
        <button
          type="button"
          className="btn-primary w-full"
          onClick={() => setOpen(true)}
        >
          Customize brief → Copy GitHub
        </button>
        <a
          href={projectGithubUrl(challenge.slug)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary mt-3 w-full justify-center"
        >
          Open {projectPath(challenge.slug)}/ ↗
        </a>
        <ProjectKitModal
          challenge={challenge}
          open={open}
          onClose={() => setOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <CopyGithubButton challenge={challenge} label="Copy GitHub" />
        <button
          type="button"
          className="inline-flex items-center rounded-full border border-border bg-surface px-[18px] py-[13px] text-[13px] font-bold text-ink transition-colors hover:border-purple/30 hover:bg-soft-purple"
          onClick={() => setOpen(true)}
        >
          Customize brief →
        </button>
        <Link
          href={`/dashboard/${challenge.slug}`}
          className="inline-flex items-center rounded-full border border-border bg-surface px-[18px] py-[13px] text-[13px] font-bold text-ink no-underline transition-colors hover:border-purple/30 hover:bg-soft-purple"
        >
          Preview dashboard ↗
        </Link>
        <Link
          href={`/ops/${challenge.slug}`}
          className="inline-flex items-center rounded-full bg-dark-strip px-[18px] py-[13px] text-[13px] font-bold text-lime no-underline hover:opacity-90"
        >
          ClickOps · Claude →
        </Link>
        {isSupply ? (
          <Link
            href="/forecast"
            className="inline-flex items-center rounded-full border border-purple/30 bg-soft-purple px-[18px] py-[13px] text-[13px] font-bold text-purple-deep no-underline hover:opacity-90"
          >
            Forecast lab ↗
          </Link>
        ) : null}
      </div>
      <ProjectKitModal
        challenge={challenge}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
