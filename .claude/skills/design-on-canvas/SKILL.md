---
name: design-on-canvas
description: Design on the Figma canvas with the real design system - new screens, edits to existing designs, and new components when the library is missing one. Builds from real component instances, auto layout, variables and text styles, reviews the result against the design rules, and fixes what the review finds. Use when asked to design, mock up, lay out, change, or add something in Figma. Three modes - new, edit, component.
---

# Designing on the canvas

Build in Figma the way a good designer on this team would: from the real
components, on auto layout, with variables and text styles, following the
rules for how things fit together. Then check the work and fix what's wrong.

The failure this skill exists to prevent: an agent draws a rectangle with a
label, it looks like a button, and it isn't one. It's detached from the
design system, it won't update when the system does, and it breaks the
moment anyone inspects it. **Always reach for a real component instance.**

On the Design-to-Code menu this is row 01, "AI builds new designs on your
Figma canvas": real editable layers the team can work from, not a mockup to
redraw.

## The quality floor (every mode, every time)

These never get skipped for speed:

- **Real instances.** Every element that exists in the library is an instance
  of it. Never detach, never restyle an instance to fake a variant that
  doesn't exist.
- **Auto layout.** Every frame that holds related children uses auto layout.
  No absolute positioning inside layouts.
- **Variables and styles.** Fills and strokes bind to `Color/*` variables,
  gaps and padding to `Spacing/*`, text uses the text styles (Body, Body
  Bold, Heading 1-4). No raw hex, no magic numbers.
- **Rules read first.** Look up the rules before placing anything, not after.
- **Named layers.** Frames are named for what they are ("Order summary",
  "Actions"), not "Frame 427".

## The setup

- Load Figma's `figma-use` guidance before any `use_figma` call (the
  `/figma-use` skill, or the `skill://figma/figma-use/SKILL.md` MCP resource).
  For component mode, also load `figma-generate-library`.
- **File:** [Shop](https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop).
  The library lives in the **Common Components** section (`66:724`) on the
  `Base App` page. The five real screens on that page (Home, Product Details,
  Cart & Checkout, Orders, Order Confirmation) are the best reference for how
  the team composes.
- **Where to build:** a page the person names. If they don't, use (or
  create) a page called `Agent Workspace`, and never draw on `Base App`.
- **The inventory:** `list_components` on the design-rules MCP gives every
  coded component with its Figma node. A few library pieces have no code
  counterpart and aren't in it: Heading (`6:20`), Text (`6:29`), Page
  (`22:477`, Default and Hero), Divider (`8:29`), Product Image (`17:206`).
- **The rules:** `list_rules` with the components you'll use. Only approved
  rules are binding; proposed ones are worth following where they don't
  conflict.

## Pick the mode

| They say | Mode |
| --- | --- |
| "design a checkout screen", "mock up an empty cart", a ticket, a sketch, or **a prototype from code** ("put this prototype on the canvas") | **new** |
| "change this screen", "add a promo banner to the cart", a Figma link to an existing design | **edit** |
| "we need a gift options button", or new/edit hits something the library doesn't have | **component** |

And how much review to run:

| Depth | What happens | When |
| --- | --- | --- |
| **quick** (default) | Build, review once, report findings without fixing | Exploring, early ideas, "show me something" |
| **thorough** | Build, then review → fix → review, up to three passes | "Make it right", anything going to a handoff |

The quality floor is the same at both depths. Only the review loop changes.

---

## Mode: new

### 1. Work out what you're building

Don't start drawing. A sentence doesn't determine a screen.

Check the inventory and the rules, then come back with a **proposal, not a
questionnaire**: what you'd build, which components, and the two or three
things you're unsure about.

> For an empty cart I'd use the Page template with the Header, a Heading 1
> "Your Cart", a surface panel with a short message, and one Accent button,
> "Continue shopping".
>
> Two things to check first:
> - Should it suggest products (a row of Product Cards), or just the message?
> - Is there a saved-for-later list to show here, or not in this product?

Ask about what changes the design. Decide what you reasonably can. A designer
who wanted to specify everything wouldn't have asked an agent.

If the idea needs something the library doesn't have, **say so now**, and
say what you'll do about it (see component mode). That's a conversation for
before the work, not a surprise after it.

### Starting from a prototype in code

A prototype from `prototype-in-code` can be the input instead of a sentence.
**Rebuild it with real instances; don't capture it.** The Figma MCP can
capture a web page straight into Figma (`generate_figma_design`), but that
produces detached layers that only look like components: exactly the
lookalike this skill exists to prevent. Use a capture only as a reference
image beside the real build, if at all.

1. **Read the prototype:** its `prototype.md` (intent, what's faked, open
   questions), a screenshot of it, and its markup.
2. **Map every piece to its Figma component.** Mock-mode prototypes are
   composed from generated mocks, so each component's root element is
   stamped: `data-component="Button" data-variant="accent"`. Look up each
   component's Figma node through Code Connect (`list_components` returns
   it, or the `// url=` header in `<Name>.figma.ts`). Translate code values
   back to Figma variants with that same `.figma.ts` file: its `getEnum` map
   says which Figma variant produces which code value, so read it in reverse.
3. **Anything unstamped** is prototype-only layout (sections, grids,
   headings). Rebuild it as auto layout frames with Spacing variables and
   text styles. An app-mode prototype has no stamps: read its source in
   `frontend/src/prototypes/<name>/` instead, where the imports name the real
   components directly.
4. **Carry the spec's open questions onto the canvas** as a note beside the
   frame, so they don't get lost in the move.
5. Then build and review as normal.

### 2. Build it

- Start from the **Page** component so the header, background and width come
  for free.
- Build top-down: the page skeleton first (sections as auto layout frames
  with `placeholder = true`), then fill each section with instances and clear
  its placeholder as you go. The person can watch it come together.
- Compose from instances. Set variants and text overrides; don't touch the
  insides of an instance.
- Bind every fill, gap and padding to a variable, and every text layer to a
  style.
- When you need something the library doesn't have, switch to **component
  mode** for that piece, then place an instance of what you built.

### 3. Review, and fix if thorough

Run `review-design-on-canvas` on the new frame.

- **quick:** stop here and report what the review found.
- **thorough:** fix, then review again. Stop when any of these is true:
  - no `must` violations and no layout findings remain (`should` and
    `consider` are reported, not blocking: they're the designer's call)
  - two reviews in a row return the same findings (nothing is moving)
  - three passes have run

**Stop immediately** if what's left needs a decision rather than a fix: a
rule saying there are too many of something without saying which to cut, two
rules pulling against each other, a new pattern the design system team has
to rule on. Don't guess at intent to make a loop finish cleanly.

**Fixing.** Fix what has a mechanical answer: swap a wrong variant, reorder,
unwrap a nested card, rebind a raw value to its variable, resize to stop an
overflow. Keep each fix targeted; don't rebuild a section because one element
in it was wrong. **Never touch annotations:** they belong to the review, and
only the next review can say a finding is resolved.

### 4. Hand it back

- What you built, a screenshot, and the node link
- Which components it uses, and any you created (with links)
- What the review found and what got fixed, pass by pass
- **What's still open and why.** A design that converged with one unresolved
  question is a good outcome. Say what holds and what doesn't, and let the
  designer decide.

For a thorough run, write a change record to `design-rules/changes/` (one
JSON file per design: node, date, each pass's fixes and deferrals). Over
time, which rules get broken most tells you which rules are load-bearing.

### When the design should become a prototype

If the next step is "let's see it working," hand the frame's link to
`prototype-in-code`. Because the design is built from real instances, Code
Connect tells that skill exactly which code component each piece is, so the
prototype composes from the same components rather than a guess at them.
This is the payoff for the quality floor: a design made of detached shapes
can't make the trip.

## Mode: edit

Same as new, starting from an existing design:

1. **Read it first** (`get_metadata`, then `get_design_context` on the part
   that's changing) and screenshot it. Match how it's already built.
2. **Change only what was asked.** An unrequested tidy-up is
   indistinguishable from a bug to whoever reviews this next. If you notice
   something else wrong, mention it.
3. If the design is on a page the team works from, **duplicate it** to the
   workspace and edit the copy, unless they say to edit in place.
4. Review at the depth they asked for, then hand back as in new.

## Mode: component

The library doesn't have something the design needs. Build it properly, as a
designer would: as a real component, not a one-off group of shapes.

### 1. Make sure it's really missing

The best outcome is finding out it already exists. Compare against the
inventory: fill, corner radius, height, text. "This is a Button with a
different label" means nothing needs building; say so and use the Button.
Also check whether a **variant** of an existing component would do. Adding
a variant to an existing component is the design system team's call, so
propose it rather than doing it.

### 2. Build it

- On the workspace page, in a section called **Proposed components**, never
  inside Common Components.
- A `COMPONENT` (or a `COMPONENT_SET` if it has states), with auto layout,
  variables for every fill, gap, radius and padding, and text styles for
  every text layer.
- **Built from existing pieces** where it can be: a new card made of the
  existing Heading, Text, Badge and Button instances, not redrawn copies.
- Component properties for what a designer would change (text, booleans for
  optional parts, variants for states), named the way the library names
  things.
- A `description` on the component saying what it's for and that it's
  proposed.

### 3. Write it up

The design system team owns the library, so the component is a proposal
until they say otherwise. Write a candidate to `design-rules/candidates/`:

```json
{
  "id": "gift-options-action",
  "name": "Gift options",
  "date": "2026-10-06",
  "figma_node": "612:340",
  "found_in": { "screen": "Checkout", "nodeId": "564:834" },
  "what_it_is": "A pill action that opens gift wrapping and message options.",
  "closest_existing": {
    "component": "Button",
    "why_it_falls_short": "Needs a leading icon and a two-line label; Button has neither."
  },
  "occurrences": 1,
  "likely_reuse": "low",
  "recommendation": "Keep as a one-off for now. Promote if a second screen needs it.",
  "status": "awaiting_review"
}
```

Be honest in `closest_existing`. If it's really a detached copy of something
that exists, say so: libraries get bloated by candidates nobody was willing
to reject. Recommend promotion only when the pattern is needed in more than
one place.

If the new component implies a rule ("gift options always sit below the order
summary"), offer to propose it with `manage-design-rules`.

---

## What not to do

- Don't detach instances, draw lookalikes, or use a value where a variable
  exists.
- Don't add to or change Common Components. Proposals go in Proposed
  components.
- Don't keep looping to drive a count to zero. A `should` the designer would
  wave through isn't worth three more passes.
- Don't substitute the nearest component for a missing one without saying
  so.
