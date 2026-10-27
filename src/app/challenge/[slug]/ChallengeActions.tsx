"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import type { Challenge } from "@/data/challenges";
import { buildProjectKit } from "@/lib/zipKit";
import ProjectKitModal from "@/components/ProjectKitModal";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function buildStarterZip(challenge: Challenge) {
  return buildProjectKit({
    challenge,
    fields: {
      project: challenge.name,
      audience: "Workshop participant",
      problem: challenge.suggestion || challenge.problem,
      data: `Sample data inspired by ${challenge.source.name}`,
      goals: challenge.ideas.join("; "),
    },
  });
}

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
  const [busy, setBusy] = useState(false);
  const isSupply = challenge.slug === "supply-chain-demand";

  const downloadZip = useCallback(async () => {
    setBusy(true);
    try {
      const blob = await buildStarterZip(challenge);
      downloadBlob(blob, `${challenge.slug}-starter.zip`);
    } catch (err) {
      console.error(err);
      window.alert("Could not build the starter ZIP. Please try again.");
    } finally {
      setBusy(false);
    }
  }, [challenge]);

  if (variant === "kit") {
    return (
      <>
        <Link
          href={`/ops/${challenge.slug}`}
          className="mb-3 flex w-full items-center justify-center rounded-full bg-dark-strip px-4 py-3 text-[13px] font-bold text-lime no-underline hover:opacity-90"
        >
          ClickOps · Build with Claude →
        </Link>
        <button
          type="button"
          className="btn-primary w-full"
          onClick={() => setOpen(true)}
        >
          Customize project kit →
        </button>
        <button
          type="button"
          className="btn-secondary mt-3 w-full justify-center"
          onClick={() => void downloadZip()}
          disabled={busy}
        >
          {busy ? "Building ZIP…" : "Quick download ZIP ↓"}
        </button>
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
        <button
          type="button"
          className="btn-primary"
          onClick={() => void downloadZip()}
          disabled={busy}
        >
          {busy ? "Building ZIP…" : "Download starter ZIP ↓"}
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
        <button
          type="button"
          className="btn-secondary px-2 py-2"
          onClick={() => setOpen(true)}
        >
          Open build kit →
        </button>
      </div>
      <ProjectKitModal
        challenge={challenge}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
