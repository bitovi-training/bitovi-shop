# Design on canvas: FAQ

Background for anyone learning this workflow, and for the agent when someone
asks how it works. The skill itself is in `SKILL.md`.

## What does this do, in one breath?

A designer describes a screen (or points at a ticket or a sketch), and an
agent builds it in Figma from the team's real components, variables and text
styles, following the team's rules for how things fit together. Then it
checks its own work against those rules and fixes what it can. The result is
editable layers a designer keeps working from, not a picture to redraw.

That's row 01 on the Design-to-Code menu, "AI builds new designs on your
Figma canvas."

## What does it depend on?

Two foundations, both in this repo:

- **The component library, reachable by the agent.** The agent finds
  components through the design-rules MCP inventory (which knows each
  component's Figma node through Code Connect), and places them through the
  Figma MCP. See `connect-code-to-figma`.
- **The rules.** Without written rules, the agent can only copy what it sees.
  With them, it composes the way a senior designer would. See
  `manage-design-rules`.

On a client engagement, the menu prices "just enough written rules" into this
offering for exactly that reason.

## Why "correct by default" instead of fast prototypes?

Because building correctly isn't really slower for an agent. Placing a real
Button instance inside an auto layout frame with a bound fill costs about
the same as drawing a rectangle that looks like one. The time goes into the
review and fix loop, so that's the part with a speed setting (quick or
thorough). The quality floor never moves.

And the cheap version has a cost later: a mockup made of detached shapes
can't be handed off, won't update when the library changes, and has to be
rebuilt by a designer. That's the opposite of what this offering sells.

If someone wants a fast, disposable prototype, the better home is row 04,
prototyping **in code**, where a throwaway is genuinely cheap and runs in the
real app.

## What's the difference between quick and thorough?

Quick builds the design and runs one review, then reports what it found
without fixing anything. It's for exploring: you see the design and what's
off about it in one go. Thorough runs review, fix, review, up to three
passes, and stops early if nothing is changing or a decision is needed. It's
for anything heading to a handoff.

## Why does it stop instead of looping until the review is clean?

Three reasons. Some findings need a decision, not a fix: "too many calls to
action" doesn't say which one to cut. `should` and `consider` findings are
judgment calls that belong to the designer. And a loop that keeps going
until a count hits zero is how an agent turns into a bill. The skill reports
what's still open and why, and that's a good outcome, not a failure.

## Why is the review a separate skill?

So that it can run on anything, including designs a person made by hand, and
so that a builder checking its own work can't quietly change the grader.
`design-on-canvas` calls `review-design-on-canvas` and then fixes what it
finds; the reviewer itself never edits. Applying fixes lives here, in the
skill that built the design, because the builder knows what it was trying to
do.

## What happens when the library doesn't have something?

Component mode. First it checks whether the thing really is missing (often
it's an existing component with a different label, which is the best
outcome). If it is missing, the agent builds it as a real component: auto
layout, variables, component properties, built from existing pieces where
possible. It goes in a **Proposed components** section, never into the
library itself, and gets written up as a candidate for the design system
team. The design can use it straight away; whether it joins the library is
the team's call.

## Why not let the agent add components to the library directly?

Because the library is a shared contract. Every component added is something
to document, test, map to code and keep consistent forever, and libraries
get bloated by components nobody was willing to reject. The agent proposes
with evidence; people with ownership decide.

## What does "variables and styles" mean in practice here?

The Shop file has variable collections for Color (Primary, Accent, Surface,
Text and so on), Spacing (XXS to XL, plus Full and Page Max Width), Font
Family, Font Size, Font Weight and Device Size, plus text styles for Body,
Body Bold and Heading 1-4. They mirror the CSS tokens in `styles.css`
(`Color/Accent` is `--color-accent`). Every fill, gap, padding and text
layer the agent creates binds to one of these. A raw `#F5532D` or a
hand-typed `10px` is a finding in review.

One known gap: Figma has `Spacing/LG` (24px) and CSS has no `--space-lg`.
The proposed `spacing-from-scale` rule records it.

## Can a design move between the canvas and code, in both directions?

Yes, and it's one of the strongest things this setup shows. **Code Connect is
the bridge.** It already records that the Figma Button and the code Button
are the same component, and how Figma variants turn into code props. So
moving a design across is translation with a dictionary, not redrawing.

**Canvas to prototype.** `prototype-in-code` reads a Figma frame with the
Figma MCP. For each instance, Code Connect returns the code component and
the exact snippet with props (`get_code_connect_map`), so the prototype is
composed from the same components and variants the designer used.

**Prototype to canvas.** `design-on-canvas` rebuilds a prototype in Figma with
real component instances. Every component in a mock prototype carries
`data-component`, `data-state` and `data-variant` attributes, stamped by
`mocks:build` and kept when markup is copied. The agent reads which
component each piece is, finds its Figma node through Code Connect, and
translates code values back into Figma variants by reading the component's
`.figma.ts` mapping in reverse. App-mode prototypes have no stamps, but
their source imports the real components by name, which works just as well.

**Why not just capture the page into Figma?** The Figma MCP can capture a
web page straight onto the canvas, and it looks right. But every layer is
detached: nothing is an instance, nothing updates with the library, and
nothing maps back to code. It's a picture of the prototype, not a design. A
capture is fine as a reference image next to the real rebuild, never instead
of it.

**What makes the trip possible** is the same thing on both sides: building
from real components. A Figma design made of detached shapes can't become a
prototype that uses real components, and a prototype with hand-written HTML
can't become real instances on the canvas. The quality floor in
`design-on-canvas` and the generated mocks in `prototype-in-code` are what
keep the door open in both directions.

**What doesn't survive the trip:** anything that was never a component.
Prototype-only layout gets rebuilt as auto layout and variables, faked data
stays faked, and behavior (clicks, toasts) becomes a note on the canvas.
Open questions from the prototype's spec travel with it as a note beside the
frame.

## What does a client need for this to work?

- A component library in Figma that's actually used, with variants for its
  real states.
- Variables (or at least styles) for color and spacing. Without them, the
  agent can't bind values and every design drifts.
- Some written rules, even a dozen. The rules setup mode can derive a first
  batch from their existing designs.
- Write access to Figma for the agent through the Figma MCP. Writing to the
  canvas is a Figma capability that's in beta and expected to become
  usage-based paid, which is worth disclosing to the client up front.

## Good things to try in this repo

- "Design an empty cart screen" (new, quick)
- "Design an order tracking page, thorough" (new, full loop)
- "Add a promo banner above the cart items on Cart & Checkout" (edit, on a
  copy)
- "We need a gift options button" (component mode, watch it check for an
  existing match first)
- "Put the empty cart suggestions prototype on the canvas" (new mode from
  `prototypes/empty-cart-suggestions/`, built from its `data-component`
  stamps through Code Connect)
