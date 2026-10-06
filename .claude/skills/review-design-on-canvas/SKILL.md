---
name: review-design-on-canvas
description: Review a Figma design against the design system's rules and annotate what it violates. Use when asked to review, check, grade, lint or validate a design on the canvas, or to find where a screen departs from the design system. Read-only - it reports and annotates, and never changes the design.
---

# Reviewing a design on the canvas

Grade a Figma design against the rules the design system has written down,
and leave the findings attached to the layers they concern.

This skill is **read-only**. It never edits the design. A designer decides
what to change, or `design-on-canvas` applies the fixes in its own loop.
Keeping review separate matters for two reasons. Designs built by hand get
reviewed too, and a check that only runs inside a generation loop is a check
most designs never get. And a builder grading its own work is only
trustworthy if the grader can't quietly change what it's grading.

On the Design-to-Code menu this skill is row 02, "AI reviews every design for
consistency." It reads from the rules store that `manage-design-rules` keeps.

## Before you start

- Load Figma's `figma-use` guidance (the `/figma-use` skill, or the
  `skill://figma/figma-use/SKILL.md` MCP resource) before any `use_figma`
  call. Every call in this skill is a read, except writing annotations.
- The rules come from the **design-rules** MCP server. Only `approved` rules
  are enforced. Proposed rules can be mentioned as "would also flag," never
  reported as violations.

## 1. Read what is actually there

Walk the node and collect every component instance, following each to its
main component so a renamed instance still resolves. Note the variant, the
text it carries, and how elements are arranged.

**A node that isn't an `INSTANCE` is the signal to watch for.** A frame with
a fill, a corner radius and a text child, in a file that has a component
library, is a detached element. Don't guess which component it resembles:
the detectable fact is that it resolves to no component at all. Report it as
a new pattern.

Also note what the design is built *from*, because these are findings too:

- fills and strokes bound to a **Color variable**, versus a raw hex
- gaps and padding bound to a **Spacing variable**, versus a raw number
- text using a **text style** (Body, Body Bold, Heading 1-4), versus loose
  font settings
- frames with **auto layout**, versus absolute positioning

## 2. Ask the store what applies

```
list_components({ names: [...every component found] })
list_rules({ components: [...], tokens: [...] })
```

Global rules always come back. Everything else is retrieved by what's
present, ranked `must`, `should`, `consider`, which is the order to report in.
Map Figma variables to tokens by name: `Color/Accent` is `--color-accent`,
`Spacing/MD` is `--space-md`.

## 3. Judge each rule against the design

Rule text is written for a reader, not a parser, and it carries its own
exceptions. `button-order-primary-right` ends with "except in toolbars," and
that exception is part of the rule. Read it and apply judgment rather than
matching the first clause.

Report a violation only where the design genuinely departs from the rule.
**A false positive costs more than a miss:** a check that cries wolf gets
turned off, and then it catches nothing. If you're unsure, say so as an
observation instead of reporting a violation.

## 4. Look at it

Structure isn't enough. A design can pass every rule node by node and still
be broken: content clipped, text overflowing, elements overlapping. So take
a screenshot and read it (`await node.screenshot()`), and check the geometry
a screenshot might not make obvious:

```js
const usable = frame.width - frame.paddingLeft - frame.paddingRight;
const widest = Math.max(...frame.children.map(c => c.x + c.width));
// widest > usable means content is being clipped
```

Report these as **layout** findings, separate from rule violations. No rule
says "don't overflow"; it's a different kind of failure, and worth catching
precisely because the rules can't see it.

## 5. Annotate the layers

You own annotations outright. Clear every existing annotation on the design
first, then write the current findings:

```js
const clear = (n) => {
  if ('annotations' in n) n.annotations = [];
  for (const c of n.children || []) clear(c);
};
clear(node);

target.annotations = [{
  label: "[MUST] button-one-primary: three primary buttons on one view",
}];
```

Rewrite from scratch every time. A fix elsewhere can resolve a finding
recorded here, and the only reliable way to know what still holds is to judge
the design as it stands now. Nothing else writes annotations, so a design
with none is a design that just passed review.

## 6. Report

Return structured findings, so a caller (a person, or `design-on-canvas`) can
act on them:

```json
{
  "violations": [
    { "rule": "button-one-primary", "strength": "must",
      "nodeId": "123:456", "node": "Actions",
      "problem": "Three Primary buttons. Primary marks the recommended path, so more than one recommends nothing.",
      "fix": "Keep Primary on the intended action. The other two become Default." }
  ],
  "layout": [
    { "nodeId": "123:789", "node": "Actions",
      "problem": "Four buttons total 537px in a 480px row. The last is clipped by 57px.",
      "fix": "Drop to two actions, or let the row wrap." }
  ],
  "craft": [
    { "nodeId": "123:790", "node": "Promo",
      "problem": "Fill is a raw #F5532D rather than Color/Accent." }
  ],
  "newPatterns": [
    { "nodeId": "123:800", "node": "Gift options",
      "problem": "Resolves to no component. Closest is Button; fill, height and radius all differ." }
  ],
  "clean": ["card-no-nesting", "badge-follows-title"]
}
```

- **violations:** approved rules the design breaks. This is what the design
  system can defend.
- **layout:** whether the screen physically works.
- **craft:** detached values, missing auto layout, loose text. Not a rule,
  but it decides whether the design survives the next library update.
- **newPatterns:** things the system has no component for. Not a violation
  and not yours to fix. `design-on-canvas` (component mode) or the design
  system team decides.

Keep the four lists separate. Merging them makes each one harder to argue.

## What not to do

Don't edit the design beyond annotations. Don't report a rule as violated
because you're unsure it's satisfied. Don't invent rules: if something looks
wrong and no rule covers it, say so as an observation, and consider whether
it's worth proposing a rule with `manage-design-rules`.
