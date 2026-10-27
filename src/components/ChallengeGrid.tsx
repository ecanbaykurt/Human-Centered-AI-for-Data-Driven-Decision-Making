"use client";

import { useMemo, useState } from "react";
import { challenges, categories, type Challenge } from "@/data/challenges";
import ChallengeCard from "@/components/ChallengeCard";

type ChallengeGridProps = {
  onCustomize?: (challenge: Challenge) => void;
  onDownload?: (challenge: Challenge) => void;
};

export default function ChallengeGrid({
  onCustomize,
  onDownload,
}: ChallengeGridProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");

  const availableFilters = useMemo(() => ["All", ...categories], []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return challenges.filter((c) => {
      const matchesCategory =
        category === "All" || c.category.toLowerCase() === category.toLowerCase();
      if (!matchesCategory) return false;
      if (!q) return true;
      return [c.name, c.title, c.category, c.question, c.slug]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [query, category]);

  return (
    <main id="explore" className="scroll-mt-24 mx-auto max-w-[1450px] px-[5%] py-[72px]">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-dot" aria-hidden />
            Choose your track
          </div>
          <h2 className="mt-3 text-[clamp(32px,4vw,44px)] font-extrabold tracking-[-0.05em] text-ink">
            Explore the ideas.
          </h2>
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted">
            9 practical projects. One goal: turn information into action.
          </p>
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search ideas..."
          aria-label="Search dashboard ideas"
          className="w-full rounded-full border border-border bg-surface px-5 py-3.5 text-sm text-ink outline-none transition-[border-color] placeholder:text-[#9a97ad] focus:border-purple/40 md:w-[260px]"
        />
      </div>

      <div className="mt-7 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {availableFilters.map((filter) => (
          <button
            key={filter}
            type="button"
            className="filter-pill"
            aria-pressed={category === filter}
            onClick={() => setCategory(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      <div
        className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        aria-live="polite"
      >
        {filtered.map((challenge) => (
          <ChallengeCard
            key={challenge.slug}
            challenge={challenge}
            onCustomize={onCustomize}
            onDownload={onDownload}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-muted">
          No ideas match that search. Try another keyword or category.
        </p>
      )}

      <p className="mt-10 max-w-3xl text-[13px] leading-relaxed text-muted-soft">
        Each challenge includes a starter project with fictional sample data and
        Cursor prompts. The personal assistant includes a guide to email and
        calendar integrations.
      </p>
    </main>
  );
}
