# Ticket format

How this team writes tickets. The `write-tickets` skill follows this file
exactly, so **change this file, not the skill**, to match a different team's
house style. Everything below is the default.

## Tracker

| Setting | Value |
| --- | --- |
| Tracker | Jira, through the Atlassian MCP |
| Site | `bitovi.atlassian.net` (cloud ID `2a2bce9e-5780-4e10-a848-ee82abca0056`) |
| Project | Ask every time. `FD` is the demo project for this repo. |
| Issue types | `Epic` for a feature that needs several tickets, `Story` for user-facing work, `Task` for technical work with no user-facing change, `Bug` for something broken |
| Labels | None unless asked |
| Description format | Markdown (`contentFormat: "markdown"`) |

## Title

- Sentence case, no full stop, under about 80 characters.
- The outcome, not the fix: "Suggest products when the cart is empty", not
  "Add ProductCard grid to CartPage".
- No project prefix, ticket key, or `[Area]` tag.

## Description

Use these sections, in this order. Leave a section out if it would only say
"N/A", except Acceptance criteria, which every ticket has.

```markdown
## Context

Two or three sentences: who this is for and why it matters. Link the design
or prototype it came from.

## Acceptance criteria

Scenario: <one behavior>
  Given <the starting state>
  When <the user does something>
  Then <what they see or what happens>
  And <anything else that must be true>

Scenario: <the empty / error / edge case>
  Given ...
  When ...
  Then ...

## Design

- [Figma frame](https://www.figma.com/design/...)  or  [Prototype](link)
- Anything the design shows that the criteria don't cover, and vice versa

## Implementation notes

What the code says about this work. Real file paths, written for the
engineer who picks it up:

- **Touches:** `frontend/src/pages/CartPage/CartPage.jsx`, ...
- **Reuses:** components and endpoints that already do part of it
- **Watch out for:** the gotchas (a shared component change that ripples, an
  endpoint that doesn't return the field, a state nobody designed)

## Open questions

- Anything still undecided, and who should decide it
```

## Acceptance criteria: Gherkin

- One `Scenario` per behavior, not one per screen.
- `Given` is state, `When` is one user action, `Then` is something you can
  see or check. No implementation details in criteria ("the API is
  called"); those go in Implementation notes.
- Always include the cases designs skip: empty, loading, error, and the
  mobile layout if the design only shows desktop.
- Name real UI text in quotes ("Add to cart") so the criteria can be checked
  against the build.

## Epics

An epic gets a short description: the outcome, the design or prototype link,
and what's out of scope. The breakdown lives in its child tickets, not in
the epic's description.

## House rules

- Don't write "Part of FE-123" or "Blocked by FE-456". The epic parent and
  issue links show that in Jira. Keep a dependency note only when it carries
  real information ("reuse the fixtures from FE-456 if it has landed").
- No size or estimate section.
- Any mention of another ticket is a clickable link:
  `[FD-12](https://bitovi.atlassian.net/browse/FD-12)`.
