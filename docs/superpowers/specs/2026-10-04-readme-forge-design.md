# readme-forge — design

## Goal
Self-hosted, free replacement for paid / rate-limited README card services
(github-readme-stats, streak-stats …). Personal use first, open source later.
Full design freedom: cards should look distinctive ("afili"), not like clones.

## Delivery modes (one render core, two front-ends)
1. **GitHub Action / CLI (v1)** — a scheduled workflow fetches data with a PAT,
   renders SVGs and commits them into the profile repo. Zero servers, zero cost.
2. **HTTP API (later)** — the same `render*` functions behind a tiny handler
   (Vercel / Cloudflare / Dokploy) with URL params + cache. Not built in v1, but
   the core must not depend on fs/CLI so it can be wrapped without changes.

## Architecture
```
src/
  github/      GraphQL client + queries → normalized ProfileData (only I/O layer)
  stats/       pure computations: streaks, language aggregation, activity series
  render/      theme tokens, svg helpers, icons
  render/cards/{stats,languages,streak,activity}.ts  (data, opts) => svg string
  index.ts     public API (for future HTTP mode)
  cli.ts       args → fetch → render → write files
action.yml     composite action wrapping the CLI
```
- Runtime: Node ≥ 24 native TypeScript (type stripping). No runtime deps,
  no build step. Dev dep: `typescript` for `tsc --noEmit` only.
- Tests: `node --test` on pure stats functions and card renderers
  (well-formed XML, escaping, edge cases like zero data).

## Data
- Token: `GITHUB_TOKEN` env. Private repos/contributions included only when the
  token can see them (PAT); the default Actions token sees public only.
- Contribution calendar fetched per year from account creation → today
  (GraphQL limit is 1 year per `contributionsCollection`) for all-time streaks.
- Languages: owned, non-fork repos, weighted by bytes; `exclude` list option.

## Cards
| card | content |
|---|---|
| stats | name, total contributions (year), commits, PRs, issues, stars, repos, contributed-to; animated ring "level" |
| languages | donut chart + legend with percentages, top N (default 8) |
| streak | current streak (flame), longest streak with date ranges, total all-time |
| activity | last N days (default 60) smooth area chart, gradient + glow, peak marker |

Common options: `theme` (auto, midnight, neon, light, dracula, ocean), `hide_border`,
`animate` (default on). `auto` embeds both palettes switched via
`@media (prefers-color-scheme)` inside the SVG.

## Constraints
- SVGs are proxied by GitHub camo: no JS, no external fonts/images.
  CSS animations + system font stack only.
- All user text XML-escaped.

## Error handling
CLI exits non-zero with a clear message on missing token / API errors; never
writes partial/empty cards over existing ones.
