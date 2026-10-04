import type { ContributionDay } from "../types.ts";

export interface Streak {
  length: number;
  start: string | null;
  end: string | null;
}

export interface StreakStats {
  current: Streak;
  longest: Streak;
  total: number;
}

const none = (): Streak => ({ length: 0, start: null, end: null });

/** `calendar` must be contiguous and oldest-first; its last day is "today". */
export function computeStreaks(calendar: ContributionDay[]): StreakStats {
  let total = 0;
  let longest = none();
  let run = none();
  for (const day of calendar) {
    total += day.count;
    if (day.count > 0) {
      run = { length: run.length + 1, start: run.start ?? day.date, end: day.date };
      if (run.length > longest.length) longest = run;
    } else {
      run = none();
    }
  }

  // Today is not over yet, so an empty today does not break the current streak.
  let i = calendar.length - 1;
  if (i >= 0 && calendar[i].count === 0) i--;
  const current = none();
  for (; i >= 0 && calendar[i].count > 0; i--) {
    current.length++;
    current.end ??= calendar[i].date;
    current.start = calendar[i].date;
  }
  return { current, longest, total };
}
