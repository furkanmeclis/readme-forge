import type { ContributionDay, ProfileData } from "./types.ts";

/** Deterministic fake profile for previews and tests (no token needed). */
export function demoProfile(today = "2026-10-04"): ProfileData {
  let seed = 42;
  const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
  const end = Date.parse(today + "T00:00:00Z");
  const calendar: ContributionDay[] = [];
  for (let i = 730; i >= 0; i--) {
    const date = new Date(end - i * 86_400_000).toISOString().slice(0, 10);
    const wave = 1 + Math.sin(i / 9) * 0.8;
    const count = rand() < 0.18 && i > 40 ? 0 : Math.round(rand() * 14 * wave + (i < 30 ? 6 : 0));
    calendar.push({ date, count });
  }
  return {
    login: "octo-dev",
    name: "Octo Developer",
    createdAt: "2020-09-21T08:01:54Z",
    followers: 128,
    stars: 342,
    repos: 64,
    contributedTo: 18,
    pullRequests: 231,
    issues: 47,
    yearContributions: calendar.slice(-365).reduce((a, d) => a + d.count, 0),
    yearCommits: 1204,
    calendar,
    languages: [
      { name: "TypeScript", color: "#3178c6", size: 480 },
      { name: "PHP", color: "#4F5D95", size: 390 },
      { name: "Go", color: "#00ADD8", size: 210 },
      { name: "Python", color: "#3572A5", size: 120 },
      { name: "CSS", color: "#563d7c", size: 90 },
      { name: "Shell", color: "#89e051", size: 40 },
      { name: "Dockerfile", color: "#384d54", size: 20 },
      { name: "Vue", color: "#41b883", size: 15 },
      { name: "Lua", color: "#000080", size: 5 },
    ],
  };
}
