---
name: design-to-code
description: Turn a Figma design or a prototype into production-quality code in this repo - built on the real components, following the codebase's conventions, with tests, verified against the design, reviewed, and committed on request. An orchestrator that pulls in the code-* skills. Use when given a Figma link, a prototype, or a ticket with either, to build, implement, or code up for real.
---

# Design to code

Take a Figma design or a prototype to code an engineer here would approve in review. This
skill is the **orchestrator**: it decides what happens in what order. The
knowledge of *how* lives elsewhere:

- the `CLAUDE.md` files (root, `frontend/src/components/`,
  `frontend/src/pages/`, `backend/`), loaded as you work in each place
- `code-build-component`, `code-write-tests`, `code-review`, `code-commit`
- Code Connect, which says which code component each Figma instance is

On the Design-to-Code menu this is row 06, "Turn your Figma designs into
production quality code." Unlike a prototype (row 04), the bar is a merged
pull request: tests, conventions, and a reviewer who'd approve it.

## 1. Read the design

- `get_design_context` on the frame for structure, and `get_screenshot` for
  the picture.
- `get_code_connect_map` on the frame: for every instance, the real
  component, its source path and the exact snippet with props. **This is the
  most important call in the flow.** It's what stops you rebuilding a Button
  that already exists.
- If there's a ticket, read it (Atlassian MCP): the acceptance criteria are
  the behavior the design can't show. If there's a prototype, read its
  `prototype.md` for intent and what was faked.

### Or: starting from a prototype

A prototype from `prototype-in-code` is just as good an input, often better,
because it already speaks code. Everything after this step is the same.

- **Read its `prototype.md` first.** The "what's faked" table is your work
  list: hard-coded data becomes real API calls, mocked behavior becomes real
  behavior. Its open questions become your plan's questions.
- **A mock prototype** (`prototypes/<name>/index.html`): each component in it
  carries `data-component`, `data-state` and `data-variant` attributes, so
  the components and variants are already identified. Everything unstamped
  is page layout, which becomes page code and CSS following
  `frontend/src/pages/CLAUDE.md`.
- **An app prototype** (on a `prototype/<name>` branch): see what it touched
  with `git diff <base>...prototype/<name>`, where `<base>` is the branch it
  came from (`ai-enablement` here). **Never merge or build on the prototype
  branch.** Start a fresh branch from the base branch and use the prototype
  as a reference: move code from `frontend/src/prototypes/` to where it
  belongs under `pages/` and `components/`, replace `fixtures.js` with real
  API calls, and add the states, tests and conventions the prototype skipped.
- **The visual target** is the prototype's screenshot, or the Figma frame if
  the prototype came from one (check its spec). Use the Figma frame when both
  exist: the design is the source of truth for appearance, the prototype for
  behavior.

## 2. Work out what's new

Map the design to the app: which route and page, which components exist
(Code Connect), which are modified, which are genuinely new. Most designs
are mostly existing pieces; the work is the difference.

Also check the parts that hide behind a design:

- **Data:** does the API return everything the design shows? (See
  `backend/CLAUDE.md`, "Watch out for.")
- **States:** loading, error, empty, long text, mobile. If the design
  doesn't show them, they're questions.
- **Rules:** `list_rules` for the components involved.

## 3. Plan, and ask what the design can't answer

A short plan in chat: files to create and change, components reused, new
components or variants, anything that needs a backend change. Then only the
questions that change the code (what happens on click, what the empty
state says, whether a new variant is welcome). Put reasonable assumptions in
the plan instead of asking.

Wait for a go-ahead if the plan includes a new shared component, a new
variant, or any backend change. Otherwise, carry on.

## 4. Build

Load `code-build-component` and follow it for every component and page in
the plan, reading the `CLAUDE.md` for each folder you work in. Reuse what
Code Connect points at, with the right variants.

## 5. Test

Load `code-write-tests`. Every new behavior and state gets a test, copying
the reference tests. Then `npm test` until it passes.

## 6. Verify against the design

Run every check in the root `CLAUDE.md`, "Before you report work complete",
in order:

- `npm test`, `npm run build`, `npm run mocks:check`, `npm run figma:check`
- **The visual loop:** run the app, screenshot the result with Playwright at
  the frame's width, and compare it against the Figma screenshot. Fix
  differences in spacing, type, color and alignment, then screenshot again.
  Two or three passes; stop when what's left is a judgment call, and say so.

Never report success while a check fails.

## 7. Review

Load `code-review` and run it on the diff. Fix everything blocking, and
re-run the checks if anything changed.

## 8. Hand back, and offer the next step

Report:

- what changed, as a short list of files and why
- a screenshot next to the Figma frame
- which checks ran and passed
- assumptions you made, and anything left as a question

Then **ask** rather than act:

> Want to check it yourself first (`npm start`, then open `#/cart`), or should
> I commit? Two options for the message:
> 1. `Suggest products when the cart is empty`
> 2. `Add a suggestions row to the empty cart`

Commit, push and open a PR only when asked, following `code-commit`.

## What not to do

- Don't merge a prototype branch, or keep its fixtures. A prototype is the
  reference, never the starting branch.
- Don't generate code from the design's layers. Figma's auto-generated
  markup is a description of rectangles; the code is built from the repo's
  components.
- Don't change a shared component, the API shape or the schema without
  saying so in the plan.
- Don't skip the visual loop because tests pass. Tests check behavior; only
  looking checks that it matches the design.
- Don't commit without being asked.
