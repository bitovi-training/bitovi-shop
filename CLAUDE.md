# Bitovi Shop

A small ecommerce app (catalog, product page, cart, checkout, orders) used by
Bitovi to teach and demonstrate AI enablement, especially design to code.

This branch (`ai-enablement`) is both a **training environment** and a
**context store**: every workflow on Bitovi's Design-to-Code menu exists here
as a skill, with an FAQ explaining the reasoning, and `docs/ai-enablement/`
holds what we sell and how we deliver it. Start with
`docs/ai-enablement/README.md`.

## How to help here

People come to this repo for three things. Work out which, and lean into it:

- **Consulting:** "a client said X, what would we propose?" Use the
  `scope-engagement` skill and the docs in `docs/ai-enablement/`. Map their
  ask to menu rows, name the foundations, separate what's known from the
  questions still open.
- **Teaching:** "how does Code Connect work?", "why a rules store instead of
  RAG?", "when should a prototype be a mock?" Answer from the skill FAQs (each
  skill has one), point at the real files, and offer to run the "Good things
  to try" example so they see it work. Explain the why, not just the steps,
  and keep it plain: many readers are designers or PMs, not engineers.
- **Building:** run a workflow for real (design on the canvas, prototype,
  write tickets, design to code) by loading its skill.

When a question spans workflows ("how would we take a client from Figma to
production?"), connect them: Code Connect underneath, rules for the canvas,
prototypes and tickets in the middle, the context layer for production code.

**This repo is public.** Never write client names, transcripts, proposal
text, pricing or client code into it. Scope and advise in chat; save client
material somewhere private.

## Architecture

- **Frontend:** React 18 + Vite, plain CSS with design tokens, hash routing.
  `frontend/src/components/` holds shared components, `frontend/src/pages/`
  holds pages and the components only one page uses. See the `CLAUDE.md` in
  each folder.
- **Backend:** Express in `backend/`, SQLite through `sql.js`, persisted to
  `backend/database/shop.db`. The frontend calls it through Vite's `/api`
  proxy. See `backend/CLAUDE.md`.
- **Shared:** `shared/models/` (domain classes, imported as `@shared/models/...`)
  and `shared/data/` (seed data).
- **Design:** the [Shop Figma file](https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop),
  connected to code with Code Connect (`*.figma.ts`). Design rules live in
  `design-rules/` behind the design-rules MCP server.

Run it with `npm start` (frontend on 5173, backend on 3001).

## First run

1. `npm install`, then `npm start` to check the app runs.
2. `npm run rules:build` builds the design rules index (`design-rules/rules.db`
   is generated and gitignored). The design-rules MCP server also builds it on
   start if it's missing.
3. Connect the MCP servers in `.mcp.json`: run `/mcp` in Claude Code and sign
   in to Figma and Atlassian (both OAuth). Playwright, shop and design-rules
   need nothing.
4. Only if you'll publish Code Connect mappings: copy `.env.example` to
   `.env` and add a Figma token (see the `connect-code-to-figma` skill for
   the two scopes it needs).

The Design-to-Code menu referred to throughout is Bitovi's six design-to-code
offerings, rows 01 to 06; see `docs/ai-enablement/design-to-code-menu.md`.

## Non-negotiable rules

- **Design tokens only.** Colors, spacing, radius and type come from the CSS
  custom properties in `frontend/src/styles.css`. No raw hex values, no
  hand-picked pixel spacing.
- **Reuse before building.** Check `frontend/src/components/` and Code Connect
  before creating a component. A lookalike of an existing component is a bug.
- **Keep a component's files in sync.** A shared component is a folder of
  files that change together (see `frontend/src/components/CLAUDE.md`).
- **Never change the API response shape** (`{ ok, ... }`) or the database
  schema as a side effect of UI work. That's its own change, discussed first.
- **Minimal, targeted changes.** Only change files the task needs. No
  unrelated cleanup or stylistic churn. Preserve existing patterns.

## Before you report work complete

Run these, in order, and fix what fails. Never report success while any of
them fails, and say so plainly if you couldn't run one.

1. `npm test` (Vitest and React Testing Library)
2. `npm run build`
3. `npm run mocks:check` (if you touched a component, `npm run mocks:build` first)
4. `npm run figma:check` (on this branch it fails on `Card` and `Rating` on
   purpose, as a training demo; any other failure is yours)
5. For UI work, look at it: run the app and screenshot the change, and compare
   against the Figma frame when there is one.
6. Run the `code-review` skill on your diff.

## When unsure

Ask one short question only if a wrong guess would change the result.
Otherwise make the simple, reasonable choice, say what you assumed, and keep
going.

## Skills

Workflows from the Design-to-Code menu, in `.claude/skills/`. Most have a
`FAQ.md` beside them explaining the why; read it before teaching or changing
a skill. The `code-*` skills are explained together in `design-to-code/FAQ.md`
(context engineering and feedback loops), and `scope-engagement` draws on
`docs/ai-enablement/`.

| Skill | What it does |
| --- | --- |
| `connect-code-to-figma` | Code Connect: map, audit, check, set up |
| `manage-design-rules` | The design rules store: derive, add, change, review |
| `design-on-canvas` | Design in Figma from the real components (row 01) |
| `review-design-on-canvas` | Review a Figma design against the rules (row 02) |
| `prototype-in-code` | Mock or app prototypes with a shareable URL (row 04) |
| `write-tickets` | Scope tickets against the code, in Jira (row 05) |
| `design-to-code` | Production code from a Figma design or prototype (row 06) |
| `code-build-component` | How components and pages are built here |
| `code-write-tests` | How tests are written here |
| `code-review` | Self-review a diff before calling it done |
| `code-commit` | Commit messages and branches |
| `scope-engagement` | Scope a client engagement from what they said |
