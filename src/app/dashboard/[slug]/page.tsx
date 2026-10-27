import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { challenges, getChallenge } from "@/data/challenges";
import PersonalAssistantDashboard from "@/components/dashboards/PersonalAssistantDashboard";
import SupplyChainDashboard from "@/components/dashboards/SupplyChainDashboard";
import CustomerExperienceDashboard from "@/components/dashboards/CustomerExperienceDashboard";
import ServiceOperationsDashboard from "@/components/dashboards/ServiceOperationsDashboard";
import SustainabilityDashboard from "@/components/dashboards/SustainabilityDashboard";
import UrbanTreesDashboard from "@/components/dashboards/UrbanTreesDashboard";
import HousingDashboard from "@/components/dashboards/HousingDashboard";
import MarketRiskDashboard from "@/components/dashboards/MarketRiskDashboard";
import ProfessionalServicesDashboard from "@/components/dashboards/ProfessionalServicesDashboard";

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
  if (!challenge) return { title: "Dashboard · Decision Lab" };
  return {
    title: `${challenge.name} dashboard · Decision Lab`,
    description: challenge.question,
  };
}

export default async function DashboardPage({ params }: PageProps) {
  const { slug } = await params;
  const challenge = getChallenge(slug);
  if (!challenge) notFound();

  switch (challenge.slug) {
    case "personal-ai-assistant":
      return <PersonalAssistantDashboard challenge={challenge} />;
    case "supply-chain-demand":
      return <SupplyChainDashboard challenge={challenge} />;
    case "customer-experience":
      return <CustomerExperienceDashboard challenge={challenge} />;
    case "service-field-operations":
      return <ServiceOperationsDashboard challenge={challenge} />;
    case "sustainability-impact":
      return <SustainabilityDashboard challenge={challenge} />;
    case "urban-trees-climate":
      return <UrbanTreesDashboard challenge={challenge} />;
    case "housing-community":
      return <HousingDashboard challenge={challenge} />;
    case "market-risk-intelligence":
      return <MarketRiskDashboard challenge={challenge} />;
    case "professional-services":
      return <ProfessionalServicesDashboard challenge={challenge} />;
    default:
      notFound();
  }
}
