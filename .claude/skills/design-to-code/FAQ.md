# Design to code: FAQ

Background for anyone learning this workflow, and for the agent when someone
asks how it works. The skill is in `SKILL.md`. This is the hardest row on the
menu, and the reason is worth understanding.

## What does this do, in one breath?

Give it a Figma frame or a prototype and it builds the feature in the real codebase: on the
existing components, following the team's conventions, with tests, checked
visually against the design, self-reviewed, and committed when you say so.
What comes back reads like the team's own engineers wrote it.

That's row 06 on the Design-to-Code menu, "Turn your Figma designs into
production quality code."

## Why is this the hardest one?

Because almost none of it is generic. Turning a Figma frame into *some* React
is easy, and every design-to-code tool does it. Turning it into code that
fits *this* codebase (its components, its CSS conventions, its data
patterns, its tests, what its reviewers reject) depends entirely on knowledge
that lives in the codebase and in the team's heads. A tool that doesn't have
that knowledge produces plausible code that gets rewritten in review.

So the skill itself is small. It's an orchestrator. **The real deliverable is
the context around it.**

## Why is the skill so thin?

On purpose. `design-to-code` only knows the order of things: read the design,
work out what's new, plan, build, test, verify, review, hand back. Everything
about *how* lives where it belongs:

| Where | What it holds | When the agent sees it |
| --- | --- | --- |
| Root `CLAUDE.md` | Architecture, non-negotiable rules, the "before you report done" checks, the skill list | Always |
| Nested `CLAUDE.md` (`components/`, `pages/`, `backend/`) | That folder's conventions, reference files, what changes together | When working in that folder |
| `code-build-component` | The procedure for building UI here | When writing UI code |
| `code-write-tests` | How tests are written and run here | When writing tests |
| `code-review` | What a reviewer here rejects | Before calling anything done |
| `code-commit` | Commit, branch and PR conventions | When committing |
| Code Connect | Which code component each Figma instance is | When reading a design |
| Design rules (MCP) | How components are allowed to combine | When building and reviewing |

Because the knowledge is split up this way, every other workflow reuses it.
`prototype-in-code` (app mode) uses `code-build-component`. A plain "fix this
bug" request uses the `CLAUDE.md` files and `code-review` without ever
touching Figma. Writing it down once in the right place is what context
engineering means in practice.

## What is context engineering, concretely?

Giving the agent the knowledge a senior engineer on the team has, in the
places and amounts it needs, at the moment it needs it. In practice:

- **Always-on context is short.** The root `CLAUDE.md` loads into every
  session, so it holds only what's true everywhere: architecture, hard rules,
  how to verify. Long files get skimmed.
- **Local context is local.** Component conventions sit in
  `frontend/src/components/CLAUDE.md`, which loads only when the agent works
  there. The agent doesn't need backend rules to write a Badge.
- **Procedures are skills.** "How to build a component" is a sequence of
  steps, loaded when the task calls for it.
- **Point at real code.** "Copy `Badge.jsx`" beats a paragraph describing the
  variant pattern. Reference implementations are the highest-value context
  there is, because the agent copies them faithfully.
- **Write down what changes together.** The single most useful fact in a
  codebase is "when you change X, also change Y and Z." In this repo: a
  component's props, its `.figma.ts`, its states file, its mock and its tests.
  Nobody can infer that from one file.
- **Tools for live facts.** Code Connect and the design-rules server answer
  questions that would go stale if written into a file.

## And feedback loops?

The other half. Context gets the first draft close; feedback loops are how
the agent finds out what's wrong with it and fixes it before a person does.
In order of how fast they are:

1. **Tests** (`npm test`): does it behave correctly? This repo has Vitest and
   React Testing Library, with reference tests to copy.
2. **The build** (`npm run build`): does it compile?
3. **Consistency checks** (`mocks:check`, `figma:check`): are the files that
   must change together still in sync?
4. **The visual loop:** screenshot the result and compare it against the
   Figma frame. The only check that catches "it works but doesn't look like
   the design." It's what gets close to pixel accurate.
5. **Self-review** (`code-review`): would a reviewer here reject it?

An agent without feedback loops reports success when the code compiles. With
them, it reports success when the work is actually done, and the root
`CLAUDE.md` says never to report success while a check fails.

## How does this relate to the AI Codebase Enablement Checklist?

It's checklist steps 8 to 10 (implementation, verification and self-testing,
coding standards and review) plus step 5's commit conventions, applied to one
buyer's goal. The checklist's "Pillar 4: build it and prove it works" is this
row. On an engagement, the checklist's discovery questions are how you fill
in these files for a client:

- **Which files are the gold-standard examples?** → the "Copy these" lists in
  the nested `CLAUDE.md` files
- **What changes together?** → the change tables
- **What do reviewers reject?** → `code-review`. Read real PR review comments
  (through the GitHub MCP) rather than guessing: shipped code shows the house
  style, but only review shows what gets sent back.
- **How do you verify a change?** → the check list in the root `CLAUDE.md`

The full checklist is on Confluence: [AI Codebase Enablement Checklist](https://wiki.at.bitovi.com/wiki/spaces/AIEnabledDevelopment/pages/2467364865/AI+Codebase+Enablement+Checklist).

## What did it take to set this up in this repo?

This repo is the worked example. Before this branch it had a 21-line
`CLAUDE.md` about keeping changes small, no tests and no linter. Setting it
up meant:

- reading the code and writing down the conventions it actually follows (BEM
  class names, the `*_VARIANTS` pattern with a safe fallback, page-only
  components nested under their page, the `{ ok, ... }` API shape)
- a root `CLAUDE.md` plus nested ones for components, pages and the backend
- adding Vitest and React Testing Library, with four reference tests
- the four `code-*` skills
- the hidden gotchas, written where they'll be found (the product list
  endpoint returns no ratings, so a design with ratings on cards needs
  backend work)

On a client codebase the shape is identical; the content comes from their
code and their team.

## Where does our work stop?

We build the agent-facing layer: the context files, the skills, the checks
the agent runs. If the client has CI, tests or linting, we teach the agent to
use them rather than rebuilding them. Where something essential is missing (a
test setup, like here), we can add a minimal version to unblock the agent, but
standing up real infrastructure is their work or a separate line item.

## How do you prove it works to a client?

One cheap, convincing way: pick a feature that already shipped, delete it on
a scratch branch, and rebuild it from its original Figma design with this
skill. Then diff the result against what the team's engineers actually
wrote. The ground truth already exists, so it costs almost nothing, and it
doubles as the acceptance demo on their own code. Run it before setup and
after, and the difference is the value of the context layer, in their
codebase.

## Can it start from a prototype instead of Figma?

Yes, and it's the same skill: only the first step changes. A prototype is
often a better input than a design, because it already speaks code. A mock
prototype is stamped with which component and variant each piece is, and an
app prototype is literally built from the real components. Its spec says what
was faked, which turns straight into the work list: the hard-coded products
become an API call, the toast trick becomes real cart behavior.

The one firm rule: **a prototype is the reference, never the starting
branch.** App-mode prototypes are built fast, on fixtures, without tests or
review, and that's exactly right for a prototype. Merging one would bring
all of that into production. So the production version starts fresh from
the base branch, moves the prototype's code to where it belongs, replaces fixtures with
real data, and goes through the full check list.

When a prototype came from a Figma design, both get used: Figma for how it
looks, the prototype for how it behaves.

## Why does it ask before committing?

Because the person running it should look at the result first, and choosing
a commit message is a small decision that's theirs. The skill offers: check it
yourself, or commit with one of two suggested messages. It never commits,
pushes or opens a PR on its own.

## What does a client need for this to work?

- **A component library in code**, and ideally Code Connect, so designs map to
  real components. Without it, the agent can still match components by
  reading code, just less reliably.
- **An app the agent can run,** so it can look at what it built.
- **A test setup that runs.** If there isn't one, adding a minimal one is
  usually part of the work.
- **Access to a few engineers** to answer the discovery questions, and to
  real PR history, for the review rules.

## Good things to try in this repo

- "Build the empty cart suggestions from the prototype" (from
  `prototypes/empty-cart-suggestions/`; watch it read the stamps, reuse
  ProductCard, and turn the spec's "faked" table into real work)
- "Build the product card ratings from the Feature — Product Card Rating page
  in Figma" (watch it find the missing backend data in step 2 and stop to
  ask)
- Ask it to add a new Badge variant, and watch `code-build-component` update
  the variants map, CSS, Code Connect file, states file, mock and tests
  together.
