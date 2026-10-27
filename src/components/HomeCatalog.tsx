"use client";

import { useCallback, useState } from "react";
import type { Challenge } from "@/data/challenges";
import { buildProjectKit } from "@/lib/zipKit";
import ChallengeGrid from "@/components/ChallengeGrid";
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

export default function HomeCatalog() {
  const [active, setActive] = useState<Challenge | null>(null);
  const [open, setOpen] = useState(false);

  const onCustomize = useCallback((challenge: Challenge) => {
    setActive(challenge);
    setOpen(true);
  }, []);

  const onDownload = useCallback(async (challenge: Challenge) => {
    try {
      const blob = await buildProjectKit({
        challenge,
        fields: {
          project: challenge.name,
          audience: "Individual contributor",
          problem: challenge.suggestion || challenge.problem,
          data: "Fictional sample inbox, calendar, and task items included in the kit.",
          goals:
            "Morning overview of messages, meetings, and priorities with clear next steps.",
        },
      });
      downloadBlob(blob, `${challenge.slug}-starter.zip`);
    } catch (err) {
      console.error(err);
      window.alert("Could not build the starter ZIP. Please try again.");
    }
  }, []);

  return (
    <>
      <ChallengeGrid onCustomize={onCustomize} onDownload={onDownload} />
      <ProjectKitModal
        challenge={active}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
