---
name: workshop
description: Run the hands-on Design-to-Code workshop in this repo - a guided, one-hour walk through every workflow on the menu (Code Connect, design rules, designing and reviewing on the Figma canvas, prototyping, writing tickets, design to code), where the learner runs each real skill alongside the agent. Use when someone says start the workshop, run the training, walk me through the workflows, teach me this repo, the tutorial, or the next exercise.
---

# The Design-to-Code workshop

A one-hour, hands-on tour of every workflow in this repo. The learner runs
each real skill; you set the scene, give them the prompt to type, point out
what matters while it runs, and answer questions. You are a guide sitting
next to them, not a lecturer and not an autopilot.

The exercises chain together, so each one leaves something the next one uses:

| # | Exercise | Skill they run | Menu row | Time |
| --- | --- | --- | --- | --- |
| 0 | [Orientation](exercises/00-orientation.md) | none | all | 5 min |
| 1 | [Connect code to Figma](exercises/01-code-connect.md) | `connect-code-to-figma` | 03 | 8 min |
| 2 | [Write down a design rule](exercises/02-design-rules.md) | `manage-design-rules` | foundation for 01, 02 | 7 min |
| 3 | [Design and review on the canvas](exercises/03-design-on-canvas.md) | `design-on-canvas`, `review-design-on-canvas` | 01, 02 | 12 min |
| 4 | [Prototype it](exercises/04-prototype.md) | `prototype-in-code` | 04 | 8 min |
| 5 | [Write the tickets](exercises/05-tickets.md) | `write-tickets` | 05 | 8 min |
| 6 | [Build it for real](exercises/06-design-to-code.md) | `design-to-code` | 06 | 12 min |

The rule added in 2 is what the review in 3 enforces. The design from 3 is
what 4 prototypes. The tickets from 5 are what 6 builds. Point these
hand-offs out as they happen: the connections are the lesson.

The slides that go with it are linked in `docs/ai-enablement/workshop.md`.

## Starting

When someone starts the workshop:

1. **Get set up** (do this yourself, quietly, and report in one line):

   ```sh
   node .claude/skills/workshop/scripts/workshop.mjs start
   ```

   It checks the install, builds the rules index, and creates a
   `workshop/<date>` branch so nothing they do touches `ai-enablement`. If it
   reports a problem, fix it or tell them what's needed.

2. **Check the connections.** Call Figma's `whoami` and the design-rules
   `list_components`. Try one Atlassian read (`getVisibleJiraProjects`). If
   Figma or Atlassian isn't authenticated, have them run `/mcp` and sign in
   now, before exercise 1, not halfway through exercise 3.

3. **Start the app** in the background with `npm start` (exercises 4 and 6
   look at it in a browser).

4. **Ask two things:** their name (for approving the rule in exercise 2) and
   whether they want the whole hour or particular exercises. Then begin
   exercise 0.

If they want just one exercise, run its setup and go straight to it. Each
exercise file says what it needs from earlier ones and how to fake it if
they skipped ahead.

## Running an exercise

Read the exercise file when you reach it, not all of them up front. Each one
has the same parts, and you move through them in order:

1. **Set the scene.** The situation in two or three sentences, as if a
   client asked for it, and the one thing this exercise teaches. Name the
   menu row. Show the Figma link or file they'll be working with.
2. **Setup.** Run whatever the file says (often nothing). Say what you
   changed, if anything, without giving away what they're about to find.
3. **Hand them the prompt.** Show the exact words in a code block and tell
   them to type it (or their own version of it). **Don't run the skill for
   them.** The point is that they drive.
4. **While it runs, do the work for real** with the skill, exactly as you
   would outside the workshop. Add a short `Workshop note:` line at each
   moment the exercise file lists under "Point out", so they see why the
   skill does what it does. Keep these notes to a sentence or two.
5. **Debrief.** Two or three sentences: what just happened, and how it
   shows up on a client engagement. Then ask if they have questions, and
   answer them from the skill's `FAQ.md`.
6. **Close it out.** Run `node .claude/skills/workshop/scripts/workshop.mjs
   done <n>`, which commits the exercise's changes to the workshop branch.
   Then say what's next and how long it takes.

Whenever a "point out" moment needs the learner to decide something (approve
a rule, pick a scope, confirm a ticket), stop and let them decide. Those
human checkpoints are half of what the workshop teaches.

## Keeping to the hour

- Each exercise has a time and a **short version** for when you're behind.
  If you're past the time, say so and offer the short version or a skip.
- Questions are the best part, but a long one can wait: offer to come back
  to it at the end, and note it so you actually do.
- Agent work takes the time it takes. While a long step runs, fill it with
  the "Point out" notes, not with silence.

## Commands they can use any time

- **"next"** or **"skip"**: close out the current exercise and move on.
- **"where are we"**: the table above with progress marked.
- **"explain that"**: go deeper on the last thing, from the skill's FAQ.
- **"reset"**: run `workshop.mjs reset <n>` to put the exercise back to its
  starting state, then start it again.
- **"end"** or **"wrap up"**: go to Ending.

## Ending

1. **Recap in three lines:** what they built (a rule, a design, a prototype,
   tickets, a merged-quality change), and the one connection that matters
   most: Code Connect underneath everything, rules for the canvas, the code
   as the source of truth for scope.
2. **Answer the parked questions.**
3. **Cleanup, asking first for each:**
   - The workshop branch: `workshop.mjs finish` switches back to
     `ai-enablement`. Ask before deleting the branch; they may want to keep
     what they built.
   - Figma: the frames they made on the `Workshop` page of the Shop file.
     Ask whether to delete them. Never touch any other page.
   - Jira: the tickets from exercise 5 in project FD. List them with links
     and leave them; deleting tickets is for the person to do.
4. **Where to go next:** `docs/ai-enablement/README.md`, and each skill's
   FAQ, which ends with more things to try.

## Ground rules

- **Real work, real tools.** Every exercise runs the actual skill against
  the actual Figma file and tracker. Nothing is staged except the setup the
  exercise file describes.
- **Build only in the Workshop areas:** the `Workshop` page in the Shop
  Figma file, project FD in Jira, the `workshop/<date>` branch in git.
- **Don't promise what the agent will produce.** It may build a different
  design than last time or scope tickets differently. That's fine, and worth
  saying out loud: the skill and its checks are what's repeatable, not the
  exact output. Describe what to look for, never a specific result.
- **Never publish Code Connect** during the workshop (it changes Dev Mode for
  everyone). Exercise 1 stops at the local check.
- **This repo is public.** If they bring up a real client, talk about it in
  chat, but don't write it into a file.
