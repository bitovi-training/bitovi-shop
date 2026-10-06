# 2. Write down a design rule

**Time:** 7 minutes. **Skill:** `manage-design-rules`. **Menu row:** the
foundation under 01 and 02.
**Short version:** add the rule and approve it; skip browsing the store.

## Set the scene

> The client's design lead, in a review: "Every empty state needs to tell
> people what's missing and give them one clear way forward. A page that
> just says 'Nothing here' is a dead end."

**What it teaches:** an agent can only follow rules that are written down,
and almost nobody's are. The rules store is where they go: one rule per
entry, tagged with the components it applies to, so the agent pulls exactly
the rules that matter for a design instead of reading a whole style guide.

Quick look first (one minute): open `design-rules/rules/screen.yml` and show
one rule. Point at `components`, `strength` (must, should, consider),
`source` and `status`.

## Setup

None. The store already has about 50 rules, most derived from the Base App
designs and still waiting for a human to approve them.

## Hand them the prompt

```
Add a design rule: every empty state says what's missing and offers exactly
one way forward, a single button back to somewhere useful.
```

**Point out:**

- It checks for an existing rule first, and should find the related
  `collections-have-empty-states` (which says empty states must be
  *designed*, not what goes in them). Overlap is the most common way a rules
  store goes bad, so it looks before it writes.
- It proposes the wording, the scope (screen), the strength and the
  components, then asks before saving. Let them push back on any of it.
- The new rule is saved as `source: session`, `status: proposed`. The agent
  can write rules, but it can never approve one.

## The human step: approve it

This is the point of the exercise. Have them run it themselves:

```sh
npm run rules:approve -- <the-new-rule-id> --by "<their name>"
```

**Point out:**

- Approval is deliberately a command a person runs, not an MCP tool. Only
  approved rules bind a design review, so a human is always the one who
  decides what the standard is.
- If anyone later edits an approved rule's meaning, it goes back to
  proposed and needs approving again.

## Debrief

On a client engagement this is the first phase of rows 01 and 02: derive the
rules from their real designs, then sit with their senior designer and get
them approved. Their sign-off is the acceptance criterion. Ask them which
storage they'd pick for a client with ten rules versus a thousand; the FAQ's
"how should rules be stored" section covers the spectrum.

## Reset

`workshop.mjs reset 2` restores the rules files.

## Needs from earlier exercises

Nothing. Exercise 3 needs this rule approved; if they skip this one, run
`workshop.mjs setup 2` to add and approve it for them.
