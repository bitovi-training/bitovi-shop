# 3. Design and review on the canvas

**Time:** 12 minutes. **Skills:** `design-on-canvas`, which runs
`review-design-on-canvas` at the end. **Menu rows:** 01, "AI builds new
designs on your Figma canvas," and 02, "AI reviews every design for
consistency."
**Short version:** quick depth only, and look at the review rather than
fixing anything.

## Set the scene

> The Orders page in the app shows a bare "No orders yet." when someone
> hasn't ordered anything. Design hasn't drawn an empty state for it. The
> product manager wants one, today.

Show them the real screen in Figma:
[Page/Orders](https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop?node-id=45-1026)
on the Base App page. Then the app: `http://localhost:5173/#/orders` (if
they have no orders, they'll see the bare text).

**What it teaches:** the agent builds with the real design system (component
instances, auto layout, variables, text styles), not shapes that look like
components. Then it checks its own work against the rules, including the one
they approved five minutes ago.

## Setup

None. The skill builds on a page called `Workshop` in the Shop file, and
creates it if it's missing. Have them keep Figma open on that page so they
can watch it build.

## Hand them the prompt

```
Design an empty state for the Orders page on the Workshop page in Figma.
```

**Point out:**

- **It proposes before it draws.** It comes back with what it would build
  and two or three questions. Let them answer; that conversation is the
  designer's job and shouldn't be skipped.
- **It reads the rules before placing anything,** and the empty-state rule
  from exercise 2 should be among them. Point it out when it appears.
- **The quality floor,** once it's built. Click into the frame in Figma: the
  Header and Button are instances (purple diamond icon), frames use auto
  layout, and fills are bound to `Color/*` variables. Compare that with a
  screenshot pasted into Figma: the second one is a picture, this one is a
  design the team can keep working on.
- **The review at the end** (quick depth: one review, no fixes). It reports
  rule violations with the rule cited, layout problems, craft problems, and
  "new patterns" (things the rules don't cover yet) as separate lists.
  Violations of `should` rules are the designer's call, not errors.

If the review finds something, ask them whether they'd fix it. If yes:

```
Fix the review findings
```

## Debrief

Row 01 is generation; row 02 is the review on its own, run on every design
a human makes too. Both stand on the same two foundations: Code Connect (so
the agent knows the components) and the rules store (so it knows how they
fit together). The design it built is real layers, so it can go straight
into a prototype next.

## Reset

The design stays on the Workshop page. Exercise 4 uses it.

## Needs from earlier exercises

The approved empty-state rule from exercise 2 (otherwise the review has
nothing new to cite). If they skipped it: `workshop.mjs setup 2`.
