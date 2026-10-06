# 1. Connect code to Figma

**Time:** 8 minutes. **Skill:** `connect-code-to-figma`. **Menu row:** 03,
"Keep your Figma library and your code in sync."
**Short version:** do Part A and Part B, skip Part C and just describe it.

## Set the scene

> The client's developers keep rebuilding components that already exist,
> because nothing in Figma tells them (or their agent) what the code is
> called. And when designers rename something, the code never hears about it.

**What it teaches:** Code Connect is the bridge every other workflow stands
on. If the agent can't tell that a Figma "Button" is `<Button
variant="accent">`, it can't design with real components, prototype with
them, or build from them.

Show them a mapping before you break anything:
`frontend/src/components/Button/Button.figma.ts`. Walk through it in a few
sentences: the `url=` header points at the Figma component, `getEnum` maps
Figma variant names to code props, and `example` is what Dev Mode and the
agent see. It's context for the agent, not code that has to compile.

Figma: the [Button](https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop?node-id=8-3)
and [Badge](https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop?node-id=7-36)
components in Common Components.

## Setup

```sh
node .claude/skills/workshop/scripts/workshop.mjs setup 1
```

This deletes `Badge.figma.ts` and plants a drift in `Button.figma.ts` (it
renames the Accent variants in the mapping, as if Figma had been renamed
and the code hadn't followed). Tell them you've "made a mess of two
mappings" and leave it there; finding the mess is the exercise.

## Part A: is everything covered?

```
Run the Code Connect check
```

**Point out:**

- `figma:check` never calls Figma. It's a fast file check that belongs in
  CI, because a mapping nobody maintains quietly rots once we leave.
- It reports **Badge** (what you broke) and also **Card** and **Rating**.
  Those two are real gaps: they exist in code but there's no Figma component
  to map them to. That's a finding for the design team, not something to
  paper over.

## Part B: put Badge back

```
Connect the Badge component to Figma
```

**Point out:**

- The property table it builds before writing anything (Figma property,
  values, code prop, values). That table is where the real work is.
- The Figma variant `"Succes Ghost"` has a typo. The mapping matches it
  exactly and leaves a comment. Fixing Figma is the design team's call, and
  if they do, the mapping has to change at the same moment.
- Afterwards, compare with the original:
  `git diff HEAD -- frontend/src/components/Badge/Badge.figma.ts` (it will
  show as a new file; `git show HEAD:frontend/src/components/Badge/Badge.figma.ts`
  shows what was there). Different wording is fine; the mapped values
  should match.
- It stops before publishing. Publishing changes Dev Mode for everyone and
  needs a personal Figma token, so it's always a person's decision.

## Part C: catch the drift

```
Is the Button mapping still in sync with Figma?
```

**Point out:**

- This is audit mode: it reads the live Figma component and compares every
  property against the mapping. The check in Part A can't see this, because
  the file still exists and still has a URL.
- It finds that the mapping expects `Highlight` but Figma's variants are
  called `Accent`. In Dev Mode those instances would silently get no code
  snippet. Drift fails silently, which is why the audit report is a
  deliverable on a client engagement.
- It should also spot a real problem you didn't plant: Figma's Button has
  a stray variant called `Variant11` that maps to nothing. That one is a
  Figma fix for the design team, which is exactly the kind of finding the
  report is for.
- Let them decide whether to fix the mapping. If yes, the agent fixes it.

## Debrief

On a client engagement this is row 03: set up Code Connect, map the
library, and hand over the reconciliation report (what's on one side only,
what has drifted) plus the CI check. Every other row includes Code Connect
for the components it touches, because those workflows need it to function.

## Reset

`workshop.mjs reset 1` restores both files.

## Needs from earlier exercises

Nothing.
