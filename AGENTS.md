# AGENTS.md — instructions for coding agents

This file tells an AI coding agent (Claude, Codex, Copilot agent, etc.) how to work in this repository.
Humans should read `README.md` first. If your tool does not load this file automatically,
paste the sections "Safe commands", "Forbidden actions" and "Review gates" into the prompt and say so.

## 1. Purpose

Smart Campus Room Availability Checker — a one-page student prototype (KBTU Software Engineering course).
The user filters a small fictional room catalog, selects a room and checks whether a time slot is free.
The page only **checks** availability. It never creates, saves or changes bookings. All data is fictional.

## 2. Architecture

```
index.html, style.css      page structure and styling
main.js                    entry point: passes ROOMS and NOW to initApp()
src/data/rooms.js          fictional catalog (deep-frozen) and fixed NOW = 540 (09:00)
src/logic/booking.js       booking rules AC1–AC4: canBook(), checkRoom(), overlaps()
src/logic/filters.js       filter rules F1–F2: parseAttendees(), filterRooms()
src/logic/time.js          "HH:MM" <-> minutes after midnight
src/ui/app.js              page state + event handlers (no business rules here)
src/ui/render.js           all DOM writing (textContent only, never innerHTML)
tests/*.test.js            node:test suites (logic, filters, jsdom UI integration)
scripts/characterize.mjs   optional evidence tool, needs Playwright (NOT a project dependency)
docs/evidence/             recorded command output and screenshots
```

Rules live in `src/logic/` and must stay free of DOM access. UI code in `src/ui/` must not re-implement a rule;
it reads the result returned by the logic layer.

## 3. Setup

- Node.js `^22.22.2 || ^24.15.0 || >=26.0.0` (required by jsdom 31). Declared in `engines` in `package.json`,
  pinned to 22 in `.nvmrc`; `.npmrc` has `engine-strict=true`, so `npm ci` fails fast on an older Node.
- `npm ci` — installs exactly what `package-lock.json` lists. Use `npm ci`, not `npm install`.

## 4. Safe commands (allowed without asking)

```
npm ci                 install locked dependencies
npm test               run all tests (node --test)
npm run build          production build into dist/ (dist/ is git-ignored)
npm run dev            local dev server on localhost only — never add --host
git status / git diff / git log
```

## 5. Coding conventions

- Plain ES modules, no framework, no TypeScript. Two-space indentation, double quotes, semicolons.
- Times are integer minutes after midnight (0–1440). Use `src/logic/time.js` for conversions.
- Pure functions in `src/logic/`; inputs are never mutated (AC5). Catalog data stays deep-frozen.
- Write to the page with `textContent` / `replaceChildren` only.
- Keep changes small: one concern per commit, message style `type: summary` (feat, fix, refactor, docs, test, chore).

## 6. Test expectations

- `npm test` must pass with **0 failures** before and after every change (49 tests at the Assignment 05 baseline, 57 after it).
- Every behaviour change or bug fix adds or updates a test in `tests/`. Do not delete or weaken existing tests
  to make a change pass.
- Rule changes go in `tests/booking.test.js` / `tests/filters.test.js`; page behaviour in `tests/ui.test.js`.
- `npm run build` must succeed. There is no linter or type checker yet — do not claim lint results.
- `npm audit` currently reports advisories for vite/esbuild (dev server only). Do not "fix" them without approval (see Forbidden actions).
- Report the real command output. Never invent or summarise test results you did not run.

## 7. Forbidden actions

- No secrets: do not add API keys, tokens, passwords, `.env` files or real personal data. Data stays fictional.
- No deployments: do not publish to Bolt, Netlify, GitHub Pages or any production host.
- No destructive commands: no `rm -rf` outside `dist/` and `node_modules/`, no `git push --force`,
  no `git reset --hard` on shared branches, no history rewriting, no deleting branches.
- No unreviewed dependency changes: do not add, remove or upgrade packages, and do not run `npm audit fix`,
  without a human approving the exact change. `package.json` and `package-lock.json` are review-only files.
- Do not push to `main` or merge pull requests. Work on a feature branch.
- Do not change the meaning of AC1–AC6 or F1–F5 (see README) unless the human asks for it.

## 8. Review gates

A human (repository owner: Zhaslan Karakat) must review and approve before:
1. any merge into `main`;
2. any change to `package.json`, `package-lock.json`, `.npmrc`, `.nvmrc` or `AGENTS.md`;
3. any change to the rules in `src/logic/`.

Every hand-off from an agent must include: a change summary, the diff, `npm test` output (pass/fail totals),
`npm run build` output, and notes on risks or tests that were not run.
