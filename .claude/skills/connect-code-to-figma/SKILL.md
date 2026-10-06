---
name: connect-code-to-figma
description: Connect code components to their Figma components with Code Connect, and keep the two sides in sync. Use when asked to map, connect, or link a component to Figma, to audit or reconcile the Figma library against the code, to find drift between design and code, to check Code Connect coverage, or to set up Code Connect in a repo for the first time. Four modes - setup, map, audit, check.
---

# Connecting code to Figma

Code Connect turns a Figma design into a static, textual representation that
an agent can use as context when it writes code. Each mapping says "this
library component is that thing in the codebase, and here is how its variants,
booleans and text turn into the text you should see." The Figma MCP returns
that text when an agent reads a design, so the agent reaches for the real
component instead of inventing a lookalike. Dev Mode shows the same thing to
human developers.

**The goal is useful context, not perfect code.** The templates are flexible
strings. The output is usually whatever the codebase uses to express its
element tree: JSX here, but just as well HTML, SwiftUI, Vue, or C# Razor
templates. It can even be plain instructions to the agent ("use the shared
`PriceTag` partial; price comes from the product model"). A mapping that
compiles is ideal, but one that tells the agent the right component, the
right props and the right import is already doing its job. Do not burn time
chasing 100% fidelity on a component where the gist is enough.

Every other workflow in this repo leans on it. Designing on the canvas,
reviewing designs, prototyping, writing tickets and building production code
all need to know what already exists on both sides. This is the foundation.

## This repo's setup

- **Figma file:** [Shop](https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop), file key `v6L5bcFuh035HNwdjqy6GN`
- **Mappings:** `*.figma.ts` files next to each component, in the template
  format (`figma.code` template strings, no parser or compiler)
- **Config:** `figma.config.json` at the repo root
- **Scripts:** `npm run figma:parse`, `figma:publish`, `figma:unpublish`,
  and `figma:check`. The CLI has no local preview command.
- **Auth.** Reading designs, suggestions and published mappings all go
  through the Figma MCP, which is OAuth, so most of this skill needs no
  token. `figma:parse` and `figma:check` are local. Only `figma:publish`
  and `figma:unpublish` need a token (see below). If there's no token,
  everything up to publishing still works, and publishing waits for
  someone who has one.

The file key above is the one thing that changes.

### The publishing token

A Figma **personal access token**, created under Settings > Security >
Personal access tokens, with exactly these scopes:

| Check this box | Where it is in the list | Why |
| --- | --- | --- |
| `file_code_connect:write` | Development | Publish and unpublish mappings |
| `file_content:read` | Files | Let the CLI resolve the Figma nodes the mappings point at |

Figma's token screen lists scopes by these raw IDs with checkboxes, grouped
under headings (Users, Files, Design systems, Development, ...). Older docs
and forum posts call them "Code Connect: Write" and "File content: Read",
which is the same thing. Leave everything else unchecked. It goes in `.env` as `FIGMA_ACCESS_TOKEN` (see
`.env.example`), never in chat and never committed. It has to belong to a
**member** of the Figma organization with a Full or Dev seat: guests can't
get Code Connect write access, and plan-level access tokens don't work for
Code Connect at all.

**If `file_code_connect:write` isn't in the list,** it's almost always the account
context, not the seat. The token screen only offers the scope while you're
in a plan that supports Code Connect (Organization or Enterprise) as a
member. People at Bitovi usually belong to several plans: a personal
Starter team, the Bitovi orgs, sometimes a client org as a guest. If
Figma opens settings from the personal team or a guest org, the scope is
hidden. Switch to the org that owns the file with the team switcher in
the top-left of the file browser, then open Settings > Security again.
The Figma MCP's `whoami` tool lists every plan the person belongs to, with
tier, seat and role, which makes this quick to diagnose.

## What a good template is

Write the template for the agent that will read it later. Ask: if an agent
saw only this snippet, would it pick the right component, pass the right
props and import it from the right place? That is the bar.

- **Match the codebase's own syntax** where you can, because the agent will
  copy it.
- **Map the variants and enums that change the code.** A Figma property that
  only affects the canvas (a preview toggle, a placeholder image) can be left
  out.
- **Use comments and plain text where code can't carry it.** Data-driven
  composites, behavior, "this comes from the API," which of two similar
  components to prefer. The template is a string, so say it.
- **Decide the format once, with the engineer, at the start.** What language
  the templates are in and how strict they need to be is a conversation to
  have when Code Connect is first set up, not something to re-decide per
  component. In this repo it's JSX in the style of the existing mappings.

## Pick the mode first

The caller says what they want, or it is obvious from the request:

| They say | Mode |
| --- | --- |
| "set up Code Connect", "connect the whole library", a repo with none yet | **setup** |
| "connect / map / link the Rating component" | **map** |
| "what's out of sync", "reconcile", "drift", "what's missing" | **audit** |
| "are we covered", "run the check", CI | **check** |

If it is genuinely unclear, ask one question. Do not run an audit when someone
asked to map one component.

---

## Mode: setup

Get a repo from no Code Connect (or a little) to a published library with a
check in CI. This is audit and map run together, with some one-time plumbing
and a decision at the front. Several steps need a human (logging in, creating
a token), so walk the person through those rather than skipping them.

**1. Check the prerequisites.** Ask, don't assume:

- The Figma file lives on an **Organization or Enterprise** plan. Code
  Connect is not available on lower plans.
- Whoever publishes is a **member** of that organization with a **Full or Dev
  seat**. Guests cannot get Code Connect write access.
- There is a component library on both sides. If either is missing, stop:
  there is nothing to connect, and that is a different engagement.

**2. Connect the Figma MCP.** This is how the agent reads designs and
published mappings, and it uses OAuth, so no token is involved.

- In this repo it is already in `.mcp.json` (`https://mcp.figma.com/mcp`).
  The first time it is used, Claude Code opens a browser to sign in to Figma.
  Run `/mcp` to trigger or check it.
- In a client repo, either install Figma's plugin
  (`claude plugin install figma@claude-plugins-official`, which also brings
  Figma's own skills) or add the server directly:
  `claude mcp add --transport http figma https://mcp.figma.com/mcp`.
- Other agents (Copilot, Cursor) have their own setup in [Figma's
  guide](https://help.figma.com/hc/en-us/articles/35281350665623).

**3. Install the CLI and configure it.**

```sh
npm install --save-dev @figma/code-connect@latest
```

Create `figma.config.json` at the repo root. `label` is what shows in Dev Mode
and `language` drives syntax highlighting, so set both for their stack:

```json
{
  "codeConnect": {
    "include": ["**/*.figma.ts"],
    "label": "React",
    "language": "jsx"
  }
}
```

If the repo uses TypeScript, add `"types": ["@figma/code-connect/figma-types"]`
to `tsconfig.json` so template files get autocomplete. Add the `figma:*`
scripts and the check script from this repo's `package.json`.

**4. Get a token for publishing.** Walk the person through creating one
with the scopes in [The publishing token](#the-publishing-token) above
(`file_code_connect:write` and `file_content:read`). Since it has to be a person's
token, find out early who on the client side will own it.

**5. Agree the format.** Settle with the engineer what language the templates
are in, how close to compilable they need to be, and which components matter
most. Look at how the codebase expresses its element tree and propose the
obvious answer. Write the decision into the repo's `CLAUDE.md` so every later
mapping follows it.

**6. Audit.** Run audit mode. The report is the work list.

**7. Map the gaps, most used first.** Shared primitives (buttons, inputs,
badges) before page composites, because they show up in every design. Run
map mode on each. Show the person the first two or three before continuing,
so they can correct the style while it's cheap.

**8. Check and publish.** Run `figma:check` until it passes. Then, when the
person says so, `npm run figma:publish`. It uploads every template matched by
`figma.config.json` and prints each component with the Figma node it landed
on. Snippets show up in Dev Mode's Inspect panel, and the Figma MCP starts
returning them to agents. Confirm by calling `get_code_connect_map` on a node
you just published.

To take one mapping down: `npx figma connect unpublish --node=<node url>
--label=React`. Leaving out `--node` unpublishes **everything**, so never run
it bare.

On a client engagement this is most of the "Connect your design system to
your code" offering, with the audit report as the written deliverable.

---

## Mode: map

Write one mapping for one component.

**1. Find both sides.** You will be handed one of them.

- Given a code path, read the component and note its props and their allowed
  values. Then find the Figma component with `get_code_connect_suggestions` or
  `get_metadata` on the Shop file.
- Given a Figma URL, call `get_design_context` on the node and read its
  properties (variants, booleans, text layers, instance swaps). Then find the
  source file.

If there is no counterpart on the other side, stop and say so. That is a
finding for the audit, not something to paper over with a guess.

**2. Line up the properties.** Make the table before writing code:

| Figma property | Values | Code prop | Values |
| --- | --- | --- | --- |
| Variant | Primary, Primary Disabled, ... | `variant`, `disabled` | ... |

This is where the real work is. Figma and code rarely model a component the
same way. One Figma property can carry two code props (Button's `Variant`
encodes both `variant` and `disabled`), and Figma variant names have typos that
must be matched exactly (Badge's `"Succes Ghost"`). Keep the typo in the
mapping and note it in a comment. Fixing it in Figma is a separate decision
for the design team, and when they do fix it, the mapping has to change in
the same breath or that variant silently stops resolving.

**3. Write the file** next to the component as `<Name>.figma.ts`. In this
repo the template is JSX, in the house style every existing mapping follows:

```ts
// url=https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop?node-id=<id>
// source=frontend/src/components/<Name>/<Name>.jsx
// component=<Name>
import figma from 'figma'

const instance = figma.selectedInstance

const variant = instance.getEnum('Variant', { 'Primary': 'primary' /* ... */ })

const textNode = instance.findText('Text')
const label = 'textContent' in textNode ? textNode.textContent : '<Fallback>'

export default {
  example: figma.code`<Name${figma.helpers.react.renderProp('variant', variant)}>${label}</Name>`,
  imports: ['import <Name> from "components/<Name>/<Name>"'],
  id: '<kebab-name>',
  metadata: { nestable: true },
}
```

Use `getEnum` for variants, `getBoolean` for toggles, `findText` for text
layers and `getInstanceSwap` for nested components. Look at
`components/Button/Button.figma.ts` and `components/Badge/Badge.figma.ts` for
worked examples.

**Map every Figma property that has a code equivalent.** The mapping should
be 1:1 with what Figma exposes, so nothing a designer can change in Figma is
lost on the way to the agent. When code models it differently, translate in
the template rather than dropping it:

- **Composites that take a data object** (ProductCard, ProductDetailsCard)
  get the Figma properties rendered *as* that object:
  `product={{ name: "Aero Bottle", price_cents: 3200, in_stock: false }}`.
- **Values in a different shape** get converted: a `"$24.00"` price string
  becomes `unitPriceCents={2400}`, a `"★★★★☆"` rating becomes `rating={4}`.
- **Properties with no code equivalent** (open/closed state, a toggle the code
  derives on its own, a designed feature not built yet) get a one-line
  comment saying so. Silence reads as an oversight.

**4. Validate.** Run `npm run figma:parse` to catch syntax and config errors.
The CLI can't render a snippet locally, so before publishing, work out by hand
what the template produces for two or three real variants (using the values
from step 1) and show the person. After publishing, `get_code_connect_map` on
the node returns the real rendered snippets, and that's the final check.

**5. Publish only when asked.** `npm run figma:publish` changes what everyone
sees in Dev Mode and what every agent gets from the MCP. Confirm first, every
time.

The CLI does not load `.env` by itself, so load it into the shell first, and
run a dry run before the real thing:

```sh
set -a; source .env; set +a
npx figma connect publish --dry-run   # validates every mapping against Figma
npm run figma:publish
```

---

## Mode: audit

Produce a reconciliation report: what exists on one side and not the other,
and where the two sides disagree. On a client engagement this report is the
deliverable for the "Connect your design system to your code" offering, so
write it for a design lead and an engineering lead to read together.

**Gather:**

- Every component in the Figma library (`get_metadata` on the Shop file's
  component pages)
- Every component in code (`frontend/src/components`, plus page-level
  components that already have mappings)
- Every existing mapping (`*.figma.ts`, and `get_code_connect_map` for what is
  actually published)

**Report four things:**

1. **Figma only.** Library components with no code counterpart. Either code
   has not built it yet or design is ahead of engineering.
2. **Code only.** Components in code with no Figma component. Usually built
   during development and never contributed back to the library.
3. **Mapped but drifted.** For each mapping, compare the Figma properties now
   against what the `.figma.ts` expects. A variant added in Figma and missing
   from `getEnum`, a renamed text layer, a code prop the mapping no longer
   passes. These fail silently in Dev Mode, which is why they need a report.
4. **Mapped locally, not published.** A `.figma.ts` that exists in the repo
   but not in `get_code_connect_map`.

For each finding, give the component, what is wrong, and the fix you would
recommend. Keep fixing out of this mode. The report is read-only, and the
fixes are a decision for the people who own each side.

---

## Mode: check

```sh
npm run figma:check
```

Fails when a shared component in `frontend/src/components` has no
`.figma.ts`, or a mapping has no `// url=` header pointing at the Figma file.
It never calls Figma, so it is fast and safe in CI. That is the point: a
mapping nobody maintains quietly expires once we leave, and a failing build
is how it gets maintained.

Container directories that hold other components rather than being one (like
`Toast`) are listed in the script as exceptions.

If it fails, offer to switch to **map** for whatever it reported.
