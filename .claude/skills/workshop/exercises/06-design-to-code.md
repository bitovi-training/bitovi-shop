# 6. Build it for real

**Time:** 12 minutes. **Skill:** `design-to-code`, which pulls in
`code-build-component`, `code-write-tests`, `code-review` and
`code-commit`. **Menu row:** 06, "Turn your Figma designs into production
quality code."
**Short version:** let it run, and spend the time on the plan step and the
review output rather than watching the build.

## Set the scene

> The ticket from exercise 5 is in the sprint. Build it the way one of the
> client's own engineers would: their components, their conventions, their
> tests, and a pull request a reviewer would approve.

**What it teaches:** production code is the same machinery as prototyping
with a much higher bar. What makes the difference is context engineering:
the `CLAUDE.md` files that hold conventions, skills for the procedures, and
feedback loops (tests, checks, a visual comparison against the design) so the
agent catches its own mistakes before a person has to.

Show them `frontend/src/components/CLAUDE.md` for a moment: conventions
written down where the agent reads them every time it works in that folder.

## Setup

None. The app should be running (`npm start`) for the visual check.

## Hand them the prompt

Use the ticket key from exercise 5 if they created one:

```
Build FD-<n> from the Product Card Rating design.
```

or, if they didn't:

```
Build the product card ratings from the Feature — Product Card Rating page in Figma.
```

**Point out:**

- **Code Connect first.** It reads the design through the mappings, so it
  knows "Product Card" is `ProductCard` and the stars are the existing
  `Rating` component. Reuse before building.
- **The plan, and the question.** It stops before building because the
  design needs a backend change (the gotcha from exercise 5), and the root
  `CLAUDE.md` says API changes are discussed first. Let them decide. That
  pause is the agent following written rules, not getting lucky.
- **Conventions.** BEM class names, the component folder of files that
  change together, design tokens instead of raw values. All from the
  `CLAUDE.md` files, none from the prompt.
- **Tests.** It writes them alongside (Vitest and Testing Library), runs the
  suite, and fixes failures itself.
- **The visual check.** It screenshots the running app and compares it
  with the Figma frame. Watch the featured product hero at the top: the
  design shows a rating there too. In the dry run the cards were done first
  and the hero was the gap the comparison caught. That's the feedback loop
  earning its keep.
- **The generated mocks.** Changing the card changes its mock, so
  `mocks:check` fails until `npm run mocks:build` runs. That's the check
  doing its job: prototypes always use the current components.
- **Code Connect closes the loop.** The Product Card mapping's comment says
  Stars isn't built yet. Now it is, so the mapping should map `Stars` and
  `Show Stars` too. If the agent doesn't do it, ask: "Does the Code Connect
  mapping need updating?"
- **Self-review, then the offer.** `code-review` reports blocking issues
  apart from suggestions. Then it offers to commit, and never commits on
  its own.

## Debrief

Row 06 is the codebase enablement checklist run for one buyer: mostly steps
8 to 10 (implementation, verification, standards). The make-or-break
question is whether we can run their application on day one, which is why
it's written into the SOW as a precondition.

## Reset

`workshop.mjs reset 6` discards the code changes.

## Needs from earlier exercises

Nothing strictly; the tickets from exercise 5 make a nicer starting point.
