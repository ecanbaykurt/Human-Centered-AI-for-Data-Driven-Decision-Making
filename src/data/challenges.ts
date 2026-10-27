export type ChallengeSource = {
  name: string;
  description: string;
  license: string;
  apiNote: string;
  url: string;
};

export type Challenge = {
  id: string;
  slug: string;
  number: string;
  category: string;
  title: string;
  question: string;
  name: string;
  problem: string;
  ideas: string[];
  measure: string;
  unit: string;
  statuses: string[];
  categories: string[];
  source: ChallengeSource;
  suggestion: string;
  artVariant: 0 | 1 | 2 | 3;
};

export const challenges: Challenge[] = [
  {
    id: "personal-ai-assistant",
    slug: "personal-ai-assistant",
    number: "01",
    category: "Productivity",
    title: "Build your personal work assistant",
    question:
      "How can you organize emails, meetings and priorities in one place?",
    name: "Personal AI Assistant",
    problem:
      "Create a personal assistant that helps someone review their inbox, understand upcoming meetings, and choose priorities for the day.",
    ideas: [
      "Create a morning view of messages and meetings",
      "Highlight follow-ups and upcoming deadlines",
      "Prepare a meeting brief or draft response for review",
    ],
    measure: "Example items",
    unit: "items",
    statuses: ["Needs reply", "Upcoming", "Planned", "Read later", "Done"],
    categories: ["Inbox", "Calendar", "Task", "Follow-up"],
    source: {
      name: "Google Workspace API documentation",
      description:
        "Official guides for implementing Gmail and Calendar access using OAuth. The starter uses fictional messages and events.",
      license:
        "Review applicable Google API terms and verification requirements.",
      apiNote:
        "Google Gmail and Calendar APIs support authorized access; this starter has no account connection.",
      url: "https://developers.google.com/workspace/guides/create-credentials",
    },
    suggestion:
      "Create a morning overview with emails that need attention, upcoming meetings, and my top priorities.",
    artVariant: 0,
  },
  {
    id: "supply-chain-demand",
    slug: "supply-chain-demand",
    number: "02",
    category: "Operations",
    title: "Forecast product demand",
    question: "How can we predict demand and plan inventory?",
    name: "Supply Chain & Demand",
    problem:
      "Help an operations manager estimate next week’s demand by location and spot where replenishment may need attention.",
    ideas: [
      "Compare demand across locations",
      "Compare monthly demand by location",
      "Design a replenishment view",
    ],
    measure: "Monthly units sold",
    unit: "units",
    statuses: ["Open", "Closed", "Watch"],
    categories: ["North Office", "Harbor Office", "West Office", "Central Depot"],
    source: {
      name: "UCI Online Retail",
      description:
        "Historical product transactions that can be aggregated into daily sales.",
      license: "CC BY 4.0; attribution required.",
      apiNote:
        "UCI provides downloadable data and Python access; no direct API is included in this starter.",
      url: "https://archive.ics.uci.edu/dataset/352/online+retail",
    },
    suggestion:
      "Forecast next month’s product demand and identify where inventory may run low.",
    artVariant: 1,
  },
  {
    id: "customer-experience",
    slug: "customer-experience",
    number: "03",
    category: "Customers",
    title: "Understand customer feedback",
    question: "What can feedback and research reveal about customer needs?",
    name: "Customer Experience & Research",
    problem:
      "Help a customer experience team see which feedback themes occur most often across locations.",
    ideas: [
      "Compare feedback themes",
      "Filter reports by theme",
      "Prioritize a follow-up investigation",
    ],
    measure: "Feedback submissions",
    unit: "reports",
    statuses: ["Open", "Closed", "Investigating"],
    categories: ["Taste", "Equipment", "Availability", "Service"],
    source: {
      name: "UCI Turkish User Reviews",
      description:
        "Product review text; useful as an optional text analysis extension.",
      license: "Review source license and citation requirements.",
      apiNote: "Download from source; no API included.",
      url: "https://archive.ics.uci.edu/dataset/769/turkish+user+review+dataset",
    },
    suggestion:
      "Find the most common customer feedback themes across locations.",
    artVariant: 2,
  },
  {
    id: "service-field-operations",
    slug: "service-field-operations",
    number: "04",
    category: "Operations",
    title: "Prioritize service requests",
    question: "Where should teams prioritize service requests?",
    name: "Service & Field Operations",
    problem:
      "Help a service manager understand the volume and status of requests across service categories.",
    ideas: [
      "Find high volume request categories",
      "Compare open and closed requests",
      "Design a backlog view",
    ],
    measure: "Service requests",
    unit: "requests",
    statuses: ["Open", "Closed", "In progress"],
    categories: ["Maintenance", "Refill", "Technical", "Installation"],
    source: {
      name: "UCI Bike Sharing",
      description:
        "Hourly and daily counts with weather; a capacity-planning proxy, not service tickets.",
      license: "CC BY 4.0; attribution required.",
      apiNote: "Download from source; no API included.",
      url: "https://archive.ics.uci.edu/dataset/275/bike+sharing+dataset",
    },
    suggestion:
      "Track open requests and find the categories with the greatest backlog.",
    artVariant: 3,
  },
  {
    id: "sustainability-impact",
    slug: "sustainability-impact",
    number: "05",
    category: "Environment",
    title: "Track resource use by location",
    question: "How can we measure and improve environmental impact?",
    name: "Sustainability & Impact",
    problem:
      "Help a sustainability team compare resource-use records and identify locations for further investigation.",
    ideas: [
      "Compare resource use by location",
      "Explore changes over time",
      "Explain what the measure leaves out",
    ],
    measure: "Resource use",
    unit: "units",
    statuses: ["Open", "Closed", "Review"],
    categories: ["North Site", "Central Site", "South Site", "East Site"],
    source: {
      name: "UCI Appliances Energy Prediction",
      description:
        "Residential energy-use observations; a proxy for practicing energy analysis.",
      license: "Review source license and citation requirements.",
      apiNote: "Download from source; no API included.",
      url: "https://archive.ics.uci.edu/dataset/374/appliances+energy+prediction",
    },
    suggestion:
      "Compare resource use and environmental impact across locations.",
    artVariant: 0,
  },
  {
    id: "urban-trees-climate",
    slug: "urban-trees-climate",
    number: "06",
    category: "Environment",
    title: "Explore urban tree coverage",
    question: "Where could urban greening have the greatest impact?",
    name: "Urban Trees & Climate",
    problem:
      "Help a community team compare tree records across neighborhoods and discuss where further research may be useful.",
    ideas: [
      "Compare tree records across areas",
      "Ask whether population or area should be considered",
      "Discuss missing coverage",
    ],
    measure: "Tree records",
    unit: "trees",
    statuses: ["Open", "Closed", "Needs survey"],
    categories: ["Roxbury", "Dorchester", "Mattapan", "Jamaica Plain"],
    source: {
      name: "Providence Tree Inventory",
      description:
        "Street tree inventory; excludes park trees and should not be treated as Boston data.",
      license:
        "Public access; review publisher terms and the date of the inventory.",
      apiNote: "CSV and JSON are available from the source catalog.",
      url: "https://catalog.data.gov/dataset/providence-tree-inventory",
    },
    suggestion:
      "Explore which neighborhoods could benefit most from more tree cover.",
    artVariant: 1,
  },
  {
    id: "housing-community",
    slug: "housing-community",
    number: "07",
    category: "Community",
    title: "Explore housing and community needs",
    question: "Where are housing and community needs emerging?",
    name: "Housing & Community Impact",
    problem:
      "Help a community organization compare housing indicators and plan where to learn more.",
    ideas: [
      "Compare inquiries by neighborhood",
      "Explore changes over time",
      "Identify what cannot be inferred",
    ],
    measure: "Housing inquiries",
    unit: "inquiries",
    statuses: ["Open", "Closed", "Referral"],
    categories: ["Roxbury", "Dorchester", "Mattapan", "South End"],
    source: {
      name: "American Community Survey",
      description:
        "Public demographic and housing estimates from the U.S. Census Bureau.",
      license: "Review documentation, margins of error and terms.",
      apiNote:
        "Census provides APIs; see official documentation for endpoint details.",
      url: "https://www.census.gov/programs-surveys/acs",
    },
    suggestion:
      "Compare community and housing indicators across neighborhoods.",
    artVariant: 2,
  },
  {
    id: "market-risk-intelligence",
    slug: "market-risk-intelligence",
    number: "08",
    category: "Finance",
    title: "Monitor business risk indicators",
    question: "What signals help assess changing markets and risks?",
    name: "Market & Risk Intelligence",
    problem:
      "Help an analyst compare selected business indicators and identify changes requiring human review.",
    ideas: [
      "Explore indicators over time",
      "Compare categories",
      "Add context before interpretation",
    ],
    measure: "Indicator score",
    unit: "points",
    statuses: ["Open", "Closed", "Flagged"],
    categories: ["Liquidity", "Activity", "Profitability", "Leverage"],
    source: {
      name: "UCI Polish Companies Bankruptcy",
      description:
        "Historical company financial ratios for exploratory modeling.",
      license: "CC BY 4.0; attribution required.",
      apiNote: "Download from source; no API included.",
      url: "https://archive.ics.uci.edu/dataset/365/polish+companies+bankruptcy+data",
    },
    suggestion:
      "Monitor market indicators and flag changes for human review.",
    artVariant: 3,
  },
  {
    id: "professional-services",
    slug: "professional-services",
    number: "09",
    category: "Services",
    title: "Organize professional service intake",
    question: "How can teams improve intake and service delivery?",
    name: "Legal & Professional Services",
    problem:
      "Help a service team track incoming requests by type and status without exposing private case details.",
    ideas: [
      "Compare request types",
      "Track open requests",
      "Improve an intake workflow",
    ],
    measure: "Intake requests",
    unit: "requests",
    statuses: ["Open", "Closed", "Waiting"],
    categories: [
      "Consultation",
      "Document Review",
      "Referral",
      "Compliance Check",
    ],
    source: {
      name: "UCI Bank Marketing",
      description:
        "Historical marketing call outcomes; a workflow data proxy, not legal case records.",
      license: "Review source license and citation requirements.",
      apiNote: "Download from source; no API included.",
      url: "https://archive.ics.uci.edu/dataset/222/bank+marketing",
    },
    suggestion:
      "Track service requests, case types, and response status.",
    artVariant: 0,
  },
];

/** Category pills for the catalog filter UI (All is UI-only). */
export const categories: string[] = [
  "Productivity",
  "Operations",
  "Customers",
  "Environment",
  "Community",
  "Finance",
  "Services",
];

export function getChallenge(slug: string): Challenge | undefined {
  return challenges.find((c) => c.slug === slug || c.id === slug);
}
