import type { ContributionDay, ProfileData, RepoLanguage } from "../types.ts";

const ENDPOINT = "https://api.github.com/graphql";

export class GitHubError extends Error {}

async function graphql<T>(token: string, query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "readme-forge",
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new GitHubError(`GitHub API ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new GitHubError(json.errors.map((e) => e.message).join("; "));
  if (!json.data) throw new GitHubError("GitHub API returned no data");
  return json.data;
}

const PROFILE_QUERY = `
query($login: String!, $cursor: String) {
  user(login: $login) {
    login name createdAt
    followers { totalCount }
    pullRequests { totalCount }
    issues { totalCount }
    repositoriesContributedTo(contributionTypes: [COMMIT, PULL_REQUEST, ISSUE, REPOSITORY]) { totalCount }
    repositories(ownerAffiliations: OWNER, isFork: false, first: 100, after: $cursor) {
      totalCount
      pageInfo { hasNextPage endCursor }
      nodes {
        stargazerCount
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
          edges { size node { name color } }
        }
      }
    }
    contributionsCollection {
      totalCommitContributions
      contributionCalendar { totalContributions }
    }
  }
}`;

const CALENDAR_QUERY = `
query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar { weeks { contributionDays { date contributionCount } } }
    }
  }
}`;

interface ProfileResponse {
  user: {
    login: string;
    name: string | null;
    createdAt: string;
    followers: { totalCount: number };
    pullRequests: { totalCount: number };
    issues: { totalCount: number };
    repositoriesContributedTo: { totalCount: number };
    repositories: {
      totalCount: number;
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      nodes: {
        stargazerCount: number;
        languages: { edges: { size: number; node: { name: string; color: string | null } }[] };
      }[];
    };
    contributionsCollection: {
      totalCommitContributions: number;
      contributionCalendar: { totalContributions: number };
    };
  } | null;
}

interface CalendarResponse {
  user: {
    contributionsCollection: {
      contributionCalendar: { weeks: { contributionDays: { date: string; contributionCount: number }[] }[] };
    };
  };
}

async function fetchCalendar(token: string, login: string, createdAt: string, now: Date): Promise<ContributionDay[]> {
  // contributionsCollection spans at most one year, so walk year-sized windows.
  const windows: { from: Date; to: Date }[] = [];
  let from = new Date(createdAt);
  while (from < now) {
    const to = new Date(Math.min(from.getTime() + 365 * 86_400_000, now.getTime()));
    windows.push({ from, to });
    from = new Date(to.getTime() + 1000);
  }
  const results = await Promise.all(
    windows.map((w) =>
      graphql<CalendarResponse>(token, CALENDAR_QUERY, {
        login,
        from: w.from.toISOString(),
        to: w.to.toISOString(),
      }),
    ),
  );
  const byDate = new Map<string, number>();
  for (const r of results) {
    for (const week of r.user.contributionsCollection.contributionCalendar.weeks) {
      for (const d of week.contributionDays) byDate.set(d.date, d.contributionCount);
    }
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

export async function fetchProfile(token: string, login: string, now = new Date()): Promise<ProfileData> {
  const languages: RepoLanguage[] = [];
  let stars = 0;
  let cursor: string | null = null;
  let first: NonNullable<ProfileResponse["user"]> | null = null;

  do {
    const data: ProfileResponse = await graphql<ProfileResponse>(token, PROFILE_QUERY, { login, cursor });
    if (!data.user) throw new GitHubError(`User "${login}" not found`);
    first ??= data.user;
    for (const repo of data.user.repositories.nodes) {
      stars += repo.stargazerCount;
      for (const e of repo.languages.edges) {
        languages.push({ name: e.node.name, color: e.node.color, size: e.size });
      }
    }
    const page = data.user.repositories.pageInfo;
    cursor = page.hasNextPage ? page.endCursor : null;
  } while (cursor);

  const calendar = await fetchCalendar(token, login, first.createdAt, now);

  return {
    login: first.login,
    name: first.name || first.login,
    createdAt: first.createdAt,
    followers: first.followers.totalCount,
    stars,
    repos: first.repositories.totalCount,
    contributedTo: first.repositoriesContributedTo.totalCount,
    pullRequests: first.pullRequests.totalCount,
    issues: first.issues.totalCount,
    yearContributions: first.contributionsCollection.contributionCalendar.totalContributions,
    yearCommits: first.contributionsCollection.totalCommitContributions,
    calendar,
    languages,
  };
}
