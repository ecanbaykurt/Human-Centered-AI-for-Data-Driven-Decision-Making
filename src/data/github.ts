import type { Challenge } from "./challenges";
import { challenges } from "./challenges";

/** Public open-source workshop repo */
export const GITHUB_REPO =
  "https://github.com/ecanbaykurt/Human-Centered-AI-for-Data-Driven-Decision-Making";

export const GITHUB_REPO_SSH =
  "git@github.com:ecanbaykurt/Human-Centered-AI-for-Data-Driven-Decision-Making.git";

export const GITHUB_CLONE =
  "git clone https://github.com/ecanbaykurt/Human-Centered-AI-for-Data-Driven-Decision-Making.git";

export function projectPath(slug: string) {
  return `projects/${slug}`;
}

export function projectGithubUrl(slug: string) {
  return `${GITHUB_REPO}/tree/main/${projectPath(slug)}`;
}

export function projectGithubRawBase(slug: string) {
  return `https://raw.githubusercontent.com/ecanbaykurt/Human-Centered-AI-for-Data-Driven-Decision-Making/main/${projectPath(slug)}`;
}

export type ProjectBriefFields = {
  project?: string;
  audience?: string;
  problem?: string;
  data?: string;
  goals?: string;
  source?: string;
  model?: string;
};

export function getGithubMeta(challenge: Challenge) {
  const path = projectPath(challenge.slug);
  return {
    repo: GITHUB_REPO,
    path,
    treeUrl: projectGithubUrl(challenge.slug),
    clone: GITHUB_CLONE,
    dashboardRoute: `/dashboard/${challenge.slug}`,
    opsRoute: `/ops/${challenge.slug}`,
    challengeRoute: `/challenge/${challenge.slug}`,
  };
}

export const githubProjects = challenges.map((c) => ({
  slug: c.slug,
  number: c.number,
  name: c.name,
  path: projectPath(c.slug),
  url: projectGithubUrl(c.slug),
}));
