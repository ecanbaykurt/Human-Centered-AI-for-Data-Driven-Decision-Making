import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { challenges, getChallenge } from "@/data/challenges";
import ClickOpsStudio from "@/components/ClickOpsStudio";

export const instant = false;

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return challenges.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const challenge = getChallenge(slug);
  if (!challenge) return { title: "ClickOps · Decision Lab" };
  return {
    title: `ClickOps · ${challenge.name} · Decision Lab`,
    description: `Build websites and dashboards for ${challenge.title} with Claude API.`,
  };
}

export default async function OpsPage({ params }: PageProps) {
  const { slug } = await params;
  const challenge = getChallenge(slug);
  if (!challenge) notFound();
  return <ClickOpsStudio challenge={challenge} />;
}
