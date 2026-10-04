#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseArgs } from "node:util";
import {
  CARD_NAMES,
  DEFAULT_RENDER_OPTIONS,
  THEME_NAMES,
  fetchProfile,
  isTheme,
  renderCard,
  type CardName,
  type ThemeName,
} from "./index.ts";
import { demoProfile } from "./demo.ts";

const HELP = `readme-forge — render GitHub profile cards as SVG

Usage: readme-forge --user <login> [options]

  --user <login>        GitHub username (default: $GITHUB_REPOSITORY_OWNER)
  --out <dir>           output directory (default: readme-forge)
  --cards <list>        comma list of ${CARD_NAMES.join(", ")} (default: all)
  --themes <list>       comma list of ${THEME_NAMES.join(", ")} (default: midnight,light)
  --top <n>             languages to show (default: ${DEFAULT_RENDER_OPTIONS.top})
  --exclude <list>      languages to ignore, e.g. "Blade,HTML"
  --days <n>            activity window (default: ${DEFAULT_RENDER_OPTIONS.days})
  --hide-border         no card border
  --no-animate          static SVGs
  --demo                use built-in demo data (no token needed)

Token: $GITHUB_TOKEN (a PAT with read:user + repo scope also counts private work).`;

function list(v: string | undefined): string[] {
  return (v ?? "").split(",").map((s) => s.trim()).filter(Boolean);
}

function fail(msg: string): never {
  console.error(`readme-forge: ${msg}`);
  process.exit(1);
}

async function main() {
  const { values: a } = parseArgs({
    options: {
      user: { type: "string" },
      out: { type: "string", default: "readme-forge" },
      cards: { type: "string" },
      themes: { type: "string", default: "midnight,light" },
      top: { type: "string" },
      exclude: { type: "string" },
      days: { type: "string" },
      "hide-border": { type: "boolean", default: false },
      "no-animate": { type: "boolean", default: false },
      demo: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });
  if (a.help) return console.log(HELP);

  const cards = (a.cards ? list(a.cards) : [...CARD_NAMES]) as CardName[];
  for (const c of cards) if (!CARD_NAMES.includes(c)) fail(`unknown card "${c}"`);
  const themes = list(a.themes);
  for (const t of themes) if (!isTheme(t)) fail(`unknown theme "${t}" (available: ${THEME_NAMES.join(", ")})`);

  const intOpt = (v: string | undefined, d: number, name: string) => {
    if (v === undefined || v === "") return d;
    const n = Number(v);
    if (!Number.isInteger(n) || n < 1) fail(`--${name} must be a positive integer`);
    return n;
  };
  const top = intOpt(a.top, DEFAULT_RENDER_OPTIONS.top, "top");
  const days = intOpt(a.days, DEFAULT_RENDER_OPTIONS.days, "days");

  let profile;
  if (a.demo) {
    profile = demoProfile();
  } else {
    const user = a.user || process.env.GITHUB_REPOSITORY_OWNER;
    if (!user) fail("missing --user");
    const token = process.env.GITHUB_TOKEN;
    if (!token) fail("missing GITHUB_TOKEN environment variable");
    profile = await fetchProfile(token, user);
  }

  // Render everything before touching disk so a failure never leaves half-written cards.
  const files: [string, string][] = [];
  for (const card of cards) {
    for (const theme of themes) {
      const svg = renderCard(card, profile, {
        theme: theme as ThemeName,
        top,
        days,
        exclude: list(a.exclude),
        hideBorder: a["hide-border"],
        animate: !a["no-animate"],
      });
      files.push([`${card}-${theme}.svg`, svg]);
    }
  }
  await mkdir(a.out, { recursive: true });
  await Promise.all(files.map(([name, svg]) => writeFile(join(a.out, name), svg)));
  console.log(`readme-forge: wrote ${files.length} cards for @${profile.login} → ${a.out}/`);
}

main().catch((e: unknown) => fail(e instanceof Error ? e.message : String(e)));
