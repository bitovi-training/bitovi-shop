# 5. Write the tickets

**Time:** 8 minutes. **Skill:** `write-tickets`. **Menu row:** 05, "AI
writes requirements and tickets from your designs."
**Short version:** stop at the drafts; don't create them in Jira.

## Set the scene

Switch features. Show them the
[Feature — Product Card Rating](https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop?node-id=197-1631)
page: the home page with star ratings on every product card.

> Design signed off on ratings on the product cards. The PM wants tickets
> by the afternoon. It looks tiny: put some stars on a card.

**What it teaches:** scoping against the code, not just the design. The
design hides the expensive part, and the agent finds it by reading the code.

Ask them first: how big would they estimate this, from the design alone?
Remember the answer.

## Setup

None.

## Hand them the prompt

```
Write tickets for the Product Card Rating design in Figma.
```

**Point out:**

- **It finds the delta first.** Almost everything on that screen already
  exists. The new part is the rating on each card.
- **The gotcha.** It checks whether the data exists and finds that
  `GET /api/products` (the list the home page uses) returns no ratings.
  Only the single-product endpoint returns reviews. So this "tiny" design
  change needs backend work: the design hid it. Compare with their estimate.
- **It also notices** the `Rating` component already exists in code, and
  the Product Card's `Stars` property in Figma isn't mapped yet (from
  exercise 1's world: the mapping comment says so).
- **It proposes scope and asks**, rather than writing tickets straight
  away. Vertical slices: each ticket ships something a user can see.
- **The format.** Drafts follow `ticket-format.md`: Gherkin acceptance
  criteria, implementation notes with real file paths, open questions.
  That file is the one to swap for a client's house style.
- **It checks for duplicates.** Before creating, it searches FD. If an
  earlier run already made "Show star ratings on product cards" (the dry
  run made [FD-9](https://bitovi.atlassian.net/browse/FD-9)), it should
  show it and ask, which is the behavior you want on a real team's board.
- **Nothing is created until they say so.** When they approve, it creates
  the tickets in FD and links them.

## Debrief

Row 05 needs nothing set up first and gets sharper as the other rows land.
On an engagement the deciding question isn't product's enthusiasm: it's
whether engineering will accept agent-written tickets. Get their sign-off
before building anything.

## Reset

Tickets stay in FD. They're listed at the end of the workshop so the person
can delete them.

## Needs from earlier exercises

Nothing. Exercise 6 builds what these tickets describe.
