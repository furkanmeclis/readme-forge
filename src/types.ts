export interface ContributionDay {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface RepoLanguage {
  name: string;
  color: string | null;
  size: number;
}

export interface ProfileData {
  login: string;
  name: string;
  createdAt: string;
  followers: number;
  stars: number;
  repos: number;
  contributedTo: number;
  pullRequests: number;
  issues: number;
  /** Contributions in the last year (the number GitHub shows on the profile). */
  yearContributions: number;
  yearCommits: number;
  /** All-time daily calendar, oldest first, contiguous. */
  calendar: ContributionDay[];
  /** One entry per repo per language. */
  languages: RepoLanguage[];
}
