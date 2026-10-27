"use client";

import { useCallback, useState } from "react";
import type { Challenge } from "@/data/challenges";
import ChallengeGrid from "@/components/ChallengeGrid";
import ProjectKitModal from "@/components/ProjectKitModal";

export default function HomeCatalog() {
  const [active, setActive] = useState<Challenge | null>(null);
  const [open, setOpen] = useState(false);

  const onCustomize = useCallback((challenge: Challenge) => {
    setActive(challenge);
    setOpen(true);
  }, []);

  return (
    <>
      <ChallengeGrid onCustomize={onCustomize} />
      <ProjectKitModal
        challenge={active}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
