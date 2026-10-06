# The Design-to-Code workshop

A one-hour, hands-on tour of every workflow in this repo. The agent runs it:
open the repo in Claude Code and say **"start the workshop"**. It sets up each
exercise, hands you the prompt to type, explains what the skill is doing and
why, and answers questions as you go. You drive.

**Slides:** [Design to Code with AI: Hands-on Workshop](https://docs.google.com/presentation/d/185Rl3rRdC7BW71mF9ydrqZc8D3Xq4WhFwJfKdJfgKX0/edit)
(Bitovi Google Drive). One slide per exercise, with the workflow diagram,
the prompt, and the Figma design it uses.

## Before you start

- The `ai-enablement` branch, in a Codespace or locally with `npm install`
- `/mcp` in Claude Code, signed in to Figma and Atlassian
- The [Shop Figma file](https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop) open
- Jira project FD, [Feature Development](https://bitovi.atlassian.net/jira/software/projects/FD/boards/958)

No Figma token is needed: the workshop never publishes Code Connect.

## The exercises

| # | Exercise | Skill | Menu row | Time |
| --- | --- | --- | --- | --- |
| 0 | Orientation | none | all | 5 min |
| 1 | Connect code to Figma | `connect-code-to-figma` | 03 | 8 min |
| 2 | Write down a design rule | `manage-design-rules` | foundation for 01, 02 | 7 min |
| 3 | Design and review on the canvas | `design-on-canvas`, `review-design-on-canvas` | 01, 02 | 12 min |
| 4 | Prototype it | `prototype-in-code` | 04 | 8 min |
| 5 | Write the tickets | `write-tickets` | 05 | 8 min |
| 6 | Build it for real | `design-to-code` | 06 | 12 min |

They chain: the rule from 2 is what the review in 3 enforces, the design
from 3 is what 4 prototypes, and the ticket from 5 is what 6 builds. Two
small features, start to finish: an empty state for the Orders page, and
star ratings on the product cards.

Each exercise is a file in `.claude/skills/workshop/exercises/`: the scene,
the setup, the prompt, what to point out while it runs, and a short version
for when time is tight. Setup and reset are scripted
(`.claude/skills/workshop/scripts/workshop.mjs`), so an exercise can be
rerun from a clean state.

## Where your work goes

Everything happens on a `workshop/<date>` branch, the `Workshop` page in the
Figma file, and project FD in Jira. At the end the agent switches back to
`ai-enablement` and asks before deleting anything. Tickets are left for you
to keep or delete.
