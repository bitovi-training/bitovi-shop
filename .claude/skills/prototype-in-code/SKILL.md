---
name: prototype-in-code
description: Build a working prototype of a new feature or screen from an idea, a Figma design or a ticket - either as a lightweight HTML mock composed from generated component mocks, or inside the real app with fake data on a prototype branch. Also sets up the mock tooling in a new codebase. Use when a designer, PM or anyone else wants to prototype, try out, or show what something would look like or how it would work in code. Three modes - mock, app, setup.
---

# Prototyping in code

Anyone on the team, not just engineers, can go from an idea, a Figma file or
a ticket to something they can click and send to a stakeholder. Two kinds of
prototype, one flow:

- **mock:** a lightweight HTML page composed from generated mocks of the
  real components. Fast, runs anywhere, one file to share. Answers "what
  would this look like, and where does the click go?"
- **app:** built inside the real app with fake data, on a throwaway branch.
  Answers "does this flow actually work?" Also the fallback whenever mocks
  aren't feasible.

On the Design-to-Code menu this is row 04, "Anyone can build a working
prototype, not just engineers." It is **not** production code. A prototype
has to be convincing, not mergeable: no tests, no PR review. When a prototype
earns its place, the production version is row 06 (design to code), and the
prototype is its reference, never its starting branch.

## This repo's setup

- **Component mocks:** every component with a `<Name>.states.jsx` (like a
  story: the states worth seeing) gets a generated `<Name>.mock.html` next to
  it, rendered from the real JSX with exactly the CSS it imports.
- **`npm run mocks:build`** regenerates them, plus `prototypes/shop.css` (every
  stylesheet in the app). Deterministic: no diff unless a component changed.
- **`npm run mocks:check`** fails if a mock is missing or stale.
- **`npm run mocks:bundle -- <name>`** inlines the CSS into
  `prototypes/<name>/<name>.html`, one file anyone can open.
- **`npm run prototype:share`**, run inside a GitHub Codespace, makes the app
  public and prints its URL.
- **Prototypes:** `prototypes/<name>/` holds `prototype.md` (the spec) and,
  for mocks, `index.html`. App-mode code goes in
  `frontend/src/prototypes/<name>/` on a `prototype/<name>` branch.
- **Worked example:** `prototypes/empty-cart-suggestions/`.
- **Rules and inventory:** `list_components` and `list_rules` on the
  design-rules MCP. **Designs:** the Figma MCP.

---

## The flow (mock and app)

### 1. Interview

A few sharp questions, not a form. What's it for, who's going to look at it,
what's the one thing it has to show? If there's a ticket, read it first
(Atlassian MCP) and ask only about what it doesn't say.

**Starting from a Figma design** (often one made with `design-on-canvas`):
read the frame with `get_design_context`, and map each component instance to
its code component through Code Connect. `get_code_connect_map` on a node
returns the component and the exact snippet with props, so the prototype
uses the same components and variants as the design, not a lookalike. Then
ask only about what the design doesn't say: what happens on click, empty
and error states, what's real data and what isn't.

### 2. Write the spec

`prototypes/<name>/prototype.md`, short:

- what it is, in two or three sentences
- the screens or states it covers
- **the mode, and why** (step 3)
- what's real and what's faked, as a table
- open questions

Show it to the person and get a quick OK before building. It's cheap to
change a paragraph and expensive to change a prototype.

### 3. Choose mock or app

Use the decision tree in `FAQ.md` ("Should this be a mock or the app?"). In
short:

- **Mock** when the question is how it looks and where clicks go, and every
  piece either exists as a component mock or is simple layout around them.
- **App** when the question needs real behavior: data that changes, a
  multi-step flow with state, validation, anything where "does it work" is
  the point. Also app whenever this repo's `CLAUDE.md` says mocks aren't set
  up.

Say which you picked and why, in the spec. **If you find yourself rebuilding
logic in a mock, you picked the wrong mode.** Stop and switch.

### 4. Build

**Mock mode:**

1. Run `npm run mocks:build` first, every time. If it changed any mocks,
   say so ("Button's mock was stale, regenerated"); that diff gets committed.
2. Create `prototypes/<name>/index.html` with
   `<link rel="stylesheet" href="../shop.css">`.
3. **Compose by copying markup** from the `<section data-state="...">` blocks
   in the relevant `*.mock.html` files, and change only text content. Don't
   hand-write a component, and don't restyle one. If you need a state that
   isn't in a mock, add it to that component's `.states.jsx` and rebuild,
   rather than editing markup by hand. Keep the `data-component`,
   `data-state` and `data-variant` attributes on each piece you copy. They're
   how anything reading the prototype later (like `design-on-canvas`
   rebuilding it in Figma) knows exactly what each piece is.
4. Layout around components (page sections, grids, spacing) may use a small
   `<style>` block, using existing CSS custom properties only (`var(--space-md)`).
5. Behavior, in order of preference:
   - native elements, links and CSS do it for free (a real `<select>`, `:hover`,
     CSS animations)
   - swap between states the mocks already show (open/closed, empty/full)
   - a few lines of vanilla JS for what's left (show a toast, bump a count)
   - never business logic: use literal values
6. `npm run mocks:bundle -- <name>` for the shareable single file.

**App mode:**

1. Branch `prototype/<name>` from the base branch (the branch you're on,
   `ai-enablement` in this repo; on a client repo, their main branch).
2. Build in `frontend/src/prototypes/<name>/`: page components that import
   the real shared components, and a `fixtures.js` with fake data. Follow
   `code-build-component` for how UI is written here.
   **Prototypes are exempt** from the root `CLAUDE.md`'s "before you report
   work complete" list: no tests and no `code-review` needed, because the bar
   is convincing, not mergeable. Do run `npm run build` so it actually loads.
3. Add one route for it (in `pages/routes.js`), so it has its own URL.
4. **Never change the backend, the database schema or a shared component**
   for a prototype. If the prototype needs data the API doesn't have, it
   comes from fixtures. If it needs a component change, note it as an open
   question.
5. Run it with `npm start`. To share it, push the branch, open it in a
   codespace, and run `npm run prototype:share` there for a public URL. On a
   client repo, use their preview environment per branch if one exists. See
   "How do you share a prototype at a public URL?" in the FAQ.

### 5. Check it

- Screenshot it (Playwright) at desktop width, and at mobile if it matters.
- If it came from a Figma design, compare against the frame and fix what's
  off. Fidelity matters most for whatever the prototype is meant to show.
- Check it against the rules for the components used. A prototype doesn't
  have to pass review, but it shouldn't break a `must` without saying so in
  the spec's open questions.

### 6. Hand it back

**A link they can send**, not just instructions to run it locally: the
bundled mock file, the codespace URL, or the preview deploy. Plus the spec's
real-versus-faked table and the open questions. If it's heading toward production, point at row 05
(`write-tickets`) or row 06 (`design-to-code`, which takes a prototype as input
just as well as a Figma design) as the next step. If the design team
should pick it up, `design-on-canvas` can rebuild it in Figma with real
component instances (it reads the stamps described above).

---

## Mode: setup

For an AI enablement engineer bringing mocks to a new codebase. The decision
of *whether* to build mocks at all is part of the work, and "not worth it
here" is a real outcome.

1. **Assess feasibility with the engineer**, using the FAQ's feasibility
   section: where does the visual truth live (CSS files, Storybook, Tailwind,
   CSS-in-JS, server templates, native), can it be rendered outside the app
   cheaply, and how heavy is the app to run? Present what you find and a
   recommendation.
2. **If mocks aren't worth it,** write that decision and the reason into the
   repo's `CLAUDE.md` ("Prototypes use app mode; mocks aren't set up because
   …"), so later prototypes go straight to app mode. Then set up app mode
   properly: a fixtures pattern, a prototypes folder, a way to share a URL.
3. **If they are,** build the three scripts for that stack, following the
   strategy for it in the FAQ:
   - **build:** renders each component's states from the real code to a
     colocated `.mock.html` with exactly the styles it uses, assets inlined,
     deterministic output
   - **check:** fails if a mock is missing or stale (for CI)
   - **bundle:** inlines everything a prototype needs into one file
   Use this repo's `shared/scripts/mocks.js` as the reference implementation.
4. **Write states files** for the shared components, most used first: each
   variant, plus the states a designer would want to see (empty, filled,
   disabled, open/closed).
5. **Prove it** with one small worked prototype, and screenshot a few mocks
   next to the real app to show they match.
