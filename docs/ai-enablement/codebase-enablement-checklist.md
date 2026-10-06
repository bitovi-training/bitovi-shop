# AI codebase enablement checklist (condensed)

A condensed copy of Bitovi's AI Codebase Enablement Checklist, so the agent
in this repo can use it without Confluence access. The full version, with
discovery questions and skill templates for every step, is the working
template for real engagements:
[AI Codebase Enablement Checklist](https://wiki.at.bitovi.com/wiki/spaces/AIEnabledDevelopment/pages/2467364865/AI+Codebase+Enablement+Checklist)
(Bitovi Confluence).

## The premise

Clients buy AI coding tools and run into the same walls: the agent writes
code that ignores team conventions, can't run or test the app, invents
patterns that don't exist, and starts every session from zero. It's easy to
blame the model. **The problem is almost always missing context, not model
capability.** The checklist is how we fix that, one codebase at a time.

## Five pillars of an AI-enabled codebase

1. **Run it:** the agent takes a fresh clone to a verified running app.
2. **Control its data:** it can reset to a clean state, seed scenarios, and
   control external dependencies.
3. **Know what to build:** it reads tickets and designs directly, instead of
   someone pasting them into chat.
4. **Build it and prove it works:** it writes code in local patterns, runs
   tests, reads failures, and fixes its own errors before asking for review.
5. **Ship it:** it branches, commits, and opens pull requests the way the team
   does.

## Where our work stops

We build the **agent-facing layer**; the client keeps their infrastructure.
If they have CI, we teach the agent to use it; we don't re-architect it. Every
step is tagged:

- **BUILD:** we deliver it on every engagement.
- **BUILD IF MISSING:** we deliver it if it's missing, and maintenance moves
  to the client at handover.
- **ADVISE:** we evaluate and recommend; the client executes.

## The steps

Work in order: each depends on the ones before it. Most codebases already
have *some* of this, so the first job at every step is finding what exists
and checking it still works. "Assessed and verified as working" is a fine
outcome.

| # | Step | Tag | What it produces | In this repo |
| --- | --- | --- | --- | --- |
| 0 | Scoping interview | ADVISE | Where the team loses time, and baseline metrics to measure against | `scope-engagement` |
| 1 | Map the topology | BUILD | How the app runs and every external connection | Root `CLAUDE.md`, "Architecture" |
| 2 | Get-app-running skill | BUILD | A fresh clone to a verified running app (verification is the critical part) | `npm start`, the devcontainer |
| 3 | Service mocking and the data boundary | BUILD IF MISSING | Work without live third-party services | Fixtures in app-mode prototypes |
| 4 | Data seed and reset | BUILD IF MISSING | Put the app into any state on demand, then reset | Seed data in `shared/data/` |
| 5 | Version control and delivery | BUILD | Branches, commits and PRs the team's way | `code-commit` |
| 6 | Requirements sourcing | BUILD | Read Jira and Figma directly, spot conflicts with the code early | `write-tickets`, Code Connect |
| 7 | Planning, spec and prototyping | BUILD | A reviewable plan before code; prototypes from existing components | `prototype-in-code`, the plan step of `design-to-code` |
| 8 | Implementation | BUILD | Code in local patterns: reference implementations, what changes together | `code-build-component`, nested `CLAUDE.md` files |
| 9 | Verification and self-testing | BUILD | The agent runs checks and fixes failures itself | `code-write-tests`, root `CLAUDE.md` check list |
| 10 | Coding standards and review | BUILD | An always-loaded instruction file, plus a self-review skill | Root `CLAUDE.md`, `code-review` |
| 11 | Skill maintenance | ADVISE | An owner, automated checks, a review cadence | `figma:check`, `mocks:check`, the rules `list_gaps` |
| 12 | Measurement and handover | ADVISE | Results against the step 0 baseline | Engagement report |

## Focus by goal

Not every engagement needs equal effort on every step:

- **"Our agents write code that doesn't fit our standards":** steps 1 to 4
  (state control) and step 10 (standards). Menu row 06.
- **"We want PMs and designers to prototype without engineering":** steps 1
  to 3, 6 and 7. Menu row 04.
- **"We need to prove the AI investment is paying off":** all steps, with
  extra care on 0 and 12 for the baseline.

## Skill structure

Every skill follows the same shape:

```
.claude/skills/<skill-name>/
  SKILL.md       main instructions, under 500 lines
  references/    conventions, schemas, rule sets
  examples/      concrete input and output samples
  scripts/       helpers the agent can run
```

The `description` in the frontmatter is the most important line in any
skill: it's what the agent reads to decide whether to load it. Write it as
trigger phrases and situations, not a summary. The skills in this repo also
carry a `FAQ.md` with the reasoning, which is what lets someone new maintain
them.

## How the checklist relates to the menu

The checklist is **how we deliver**, not a gate a client has to pass before
buying. A menu row is the checklist run at a particular depth for a
particular buyer: row 06 is mostly steps 8 to 10, row 04 mostly steps 1 to 3
and 7, row 05 mostly step 6. Nobody needs an AI-ready codebase to start,
because getting there is the work.
