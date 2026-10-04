export interface LevelInput {
  commits: number;
  pullRequests: number;
  issues: number;
  stars: number;
  followers: number;
  contributedTo: number;
}

export interface Level {
  label: string;
  /** 0–1 */
  percent: number;
}

const WEIGHTS: LevelInput = { commits: 1, pullRequests: 3, issues: 1, stars: 4, followers: 2, contributedTo: 6 };
/** Weighted score that maps to 50%. */
const MEDIAN = 900;

const TIERS: [number, string][] = [
  [0.95, "S"],
  [0.85, "A+"],
  [0.7, "A"],
  [0.55, "B+"],
  [0.4, "B"],
  [0.25, "C+"],
  [0, "C"],
];

export function computeLevel(input: LevelInput): Level {
  let score = 0;
  for (const k of Object.keys(WEIGHTS) as (keyof LevelInput)[]) score += input[k] * WEIGHTS[k];
  const percent = 1 - Math.pow(2, -score / MEDIAN);
  const label = TIERS.find(([min]) => percent >= min)![1];
  return { label, percent };
}
