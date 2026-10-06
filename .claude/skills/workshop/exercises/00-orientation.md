# 0. Orientation

**Time:** 5 minutes. **Skill:** none. **Short version:** skip to the last
paragraph of "Set the scene" and go.

## Set the scene

Tell them, in your own words and briefly:

- **What this repo is.** Bitovi Shop: a small real store (React, Express,
  SQLite) with a real Figma file behind it. This branch turns it into a
  training environment and a context store: every offering on Bitovi's
  Design-to-Code menu exists here as a skill they can run.
- **The menu, in one breath.** Six things clients buy: AI designs on the
  canvas (01), AI reviews designs (02), Figma and code kept in sync (03),
  anyone can prototype (04), tickets from designs (05), production code from
  designs (06). Show `docs/ai-enablement/design-to-code-menu.md` if they want
  the detail.
- **What a skill is.** A folder in `.claude/skills/` with a `SKILL.md` (the
  procedure the agent follows) and an `FAQ.md` (the reasoning, for people).
  The agent loads a skill when the request matches its description. Open one
  so they can see it's just markdown.
- **What they'll do today:** run six of them, in an order where each one
  hands something to the next.

Then show them the two places they'll be working:

- **Figma:** the [Shop file](https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop).
  The `Base App` page has the five real screens and the component library
  (Common Components). Ask them to open it now.
- **Jira:** project FD, [Feature Development](https://bitovi.atlassian.net/jira/software/projects/FD/boards/958).

## Hand them the prompt

Nothing to run. Instead, invite one question about the repo, so they get
used to asking the agent things:

```
What's the difference between a skill and a CLAUDE.md file?
```

## Point out

- The root `CLAUDE.md` is always loaded; skills load only when needed. That
  split is the core of context engineering: always-true rules in CLAUDE.md,
  procedures in skills.
- Everything here is files in the repo, so it versions, reviews and travels
  with the code like anything else.

## Debrief

On an engagement, this repo is what we leave behind in the client's own
codebase: their skills, their rules, their mappings. Done means their team
runs it without us.

## Needs from earlier exercises

Nothing.
