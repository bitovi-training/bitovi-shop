# Manage design rules: FAQ

Background for anyone learning this workflow, and for the agent when someone
asks how it works. The skill itself is in `SKILL.md`.

## What problem does this solve?

Design systems document components one at a time: here is the Button, here
are its variants. What they almost never write down is how components **fit
together**. One primary button per group. Badges sit on the title line, not
below it. Cards don't nest. Red means failure, never decoration. Those rules
live in senior designers' heads and come out only in review, after someone
has already broken them.

An agent designing on the canvas or reviewing a design needs those rules to
do the job a senior designer would. So the first step is getting them out of
people's heads and into a form an agent can use. On the Design-to-Code menu,
both "AI builds new designs on your Figma canvas" and "AI reviews every
design for consistency" depend on this. It's the foundation for the
designer-facing half of the menu, the way Code Connect is for the code half.

## What's the core idea, in one breath?

Encode the rules once, tag each one with the components and tokens it's
about, and give the agent a way to fetch exactly the rules that apply to the
design in front of it. Everything else is a choice about how much
infrastructure that takes.

## What are the ways to store the rules?

There's a spectrum, and the right point on it depends on how many rules
there are and how much context each one carries.

**1. Put them straight in a skill or context file.** A `design-rules.md` the
agent loads every time. Simplest possible thing, nothing to run, easy to
edit. It works until the file gets long enough that loading all of it
crowds out the actual task, or the agent starts skimming and missing rules.
As a rough rule of thumb (a judgment, not a measurement), that's a few dozen
short rules.

**2. A tagged store behind an MCP server (what this repo does).** Rules live
in files, each tagged with what it's about. A small local server loads them
into a database and answers "which rules apply to a design with Button,
Badge and Card in it?" with a join. The agent only ever sees the rules that
matter for this design. Retrieval is **deterministic**: the same design gets
the same rules every time.

**3. A RAG or vector database.** Embed every rule and retrieve by semantic
similarity to the design or the question. This scales to hundreds or
thousands of rules and copes with rules nobody tagged well. The cost is that
retrieval is a similarity guess: it can return a near-miss and skip the rule
that actually applied, and nothing tells you it did.

**We chose the middle on purpose.** For a design checker, missing a rule
silently is the worst failure, worse than not checking at all, because the
team trusts a check that passed. A join on explicit tags can't silently miss
a correctly tagged rule. RAG is worth it when there are so many rules that
tagging them all is impractical, or when the questions are open-ended ("is
there guidance about empty states?") rather than "what applies to these
components?"

These thresholds are rough rules of thumb, not measurements. The real
answer depends on rule length and how much the agent is doing at the same
time.

## When is a plain skill enough?

When the design system is small or the rules are few, a skill with the rules
inlined is the right call and the infrastructure is overkill. Signs you've
outgrown it: the rules file is longer than the task instructions around it,
reviews keep missing rules the file does contain, or more than one team is
editing it and you need provenance and approval. A reasonable path on a
client engagement is to start inline, and move to the store once the rule
count or the review process demands it. The rule format doesn't change, so
moving is cheap.

## Does it have to be YAML?

No. You need **some** structured way to write a rule down with its text,
scope, strength, tags and provenance. This repo uses YAML because it diffs
cleanly and a designer can read it in a pull request. JSON works the same
way. A spreadsheet works for a team that lives in spreadsheets. A custom
object format, a Notion database or Confluence page tables all work, as long
as something can read them into the index. The format is the least
important decision here. The fields are what matter.

## Why is there a database at all, if the YAML is the source of truth?

The YAML is for people: readable, diffable, reviewable. The SQLite index is
for retrieval: rule-to-component is many-to-many (one rule touches several
components, one component appears in many rules), and a join answers "which
rules apply" quickly and exactly. The index is derived. Delete it and
`npm run rules:build` recreates it, so it can never become a second source of
truth that disagrees with the files.

## Why an MCP server instead of letting the agent read the files?

Three reasons. First, the server owns the query, so every agent and every
skill gets the same answer for the same design. An agent writing its own
joins could write a subtly wrong one and miss a `must` rule. Second, writes
go through validation: a rule tagged with a component that doesn't exist is
rejected and rolled back, so a hallucinated name can't land. Third, an MCP
server is reachable from places with no terminal, like an agent working
inside Figma.

## What are the kinds of rules?

The store has examples of most of these. The table in `SKILL.md` has the full
list with rule ids.

- **Variant choice:** the Error button is only for destructive actions.
- **Quantity:** one primary button per group, a limit on calls to action per
  screen.
- **Composition:** what goes inside or next to what. Cards don't nest. Badges
  follow the title.
- **Order and alignment:** primary action on the right, except in toolbars.
- **Color meaning:** red and green carry meaning and are never decoration.
  Accent orange is never a surface.
- **Hierarchy:** accent marks the single most important action on the screen.
  Don't skip heading levels.
- **Navigation:** breadcrumbs only two or more levels deep.
- **Content, states, accessibility, responsive:** prices always as $X.XX,
  every list has an empty state, form fields have visible labels, every
  screen is designed for mobile too. These exist as *proposed* rules, derived
  from the Shop designs and waiting for sign-off, and they're common on client
  engagements.

## What's scope, and how do pair rules work?

Scope says what a rule governs: one component (`component`), how components
relate (`pair`), the whole screen (`screen`), or everything (`global`). A
pair rule is tagged with every component involved, so `badge-follows-title`
is tagged `[Badge, Card]` and comes back whenever either is on screen. Global
rules always come back. Rules about color or spacing rather than a component
are tagged with design tokens instead.

## What do provenance and approval actually protect against?

An agent's guess becoming "the design system says so." Every rule records
where it came from (`session`: a person said it; `inferred`: derived from
existing designs; `proposed`: the agent suggested it), and nothing is
enforced until a person approves it with `npm run rules:approve`, which puts
their name on it. The agent can't approve rules, by design. Editing an
approved rule's substance sends it back to proposed, because the approval
was for the old wording.

This matters most for **inferred** rules. Deriving rules from existing
designs tells you what the designs *do*, which isn't always what the team
*intends*. A designer has to say "yes, that's a rule" before it becomes one.

## Can it derive rules automatically?

Partly, and that's the setup and derive modes. The agent reads shipped
screens, looks for arrangements that repeat across many of them, and drafts
those as candidate rules with the screens as evidence. It's a good way to
start a store from nothing, because reacting to a draft is much easier for a
designer than writing rules from a blank page. But it only surfaces
**consistent** patterns. It can't know why a pattern exists, can't tell a
rule from a habit, and won't find rules that live in what designers *don't*
do. The interview in add mode is where those come from.

## Could there be a UI for this?

Yes, and it's a reasonable next step on a real engagement. Designers aren't
going to open pull requests against YAML. Options, cheapest first:

- **No UI:** the agent is the interface. Designers ask it to add, change or
  explain rules in plain language. This is what the repo does today, and it
  works surprisingly well.
- **A read-only rules browser:** a small page that lists rules by component
  and scope, with search and the proposed queue. Useful for onboarding and
  for designers checking "is there a rule about this?"
- **A review queue:** the same page with approve and reject buttons that call
  the approve script under the reviewer's name. This is the piece that
  actually takes approval out of the terminal.
- **A Figma plugin:** rules shown next to the selected component, in the
  designer's own tool. The most natural place for them, and the most work.

Whatever the UI, it should sit on the same store and the same validation, so
it can't drift from what the agent sees.

## Why one skill with five modes?

Setup, derive, add, change and review all share the same store, tools and
rule format, so one skill is easier to learn and to find. If one mode grows
its own machinery (setup turning into a long analysis pipeline, or review
growing a report format), that's the point to split it into its own skill.

## How does this relate to the other skills?

- **connect-code-to-figma** builds the component inventory's Figma side.
  Without it, rules can't be checked against what's in a design.
- **design-on-canvas** reads the rules before placing anything, so new
  designs follow them, then fixes what review finds. Its component mode
  builds things the library is missing, which can lead to new rules.
- **review-design-on-canvas** checks a design against the approved rules and
  annotates violations.

## Good things to try in this repo

- "What rules apply to a screen with a Button, a Badge and a Card?"
- "Add a rule: button labels always start with a verb" (add mode, watch the
  interview)
- "Derive rules from the checkout screen on the demo page in Figma" (derive
  mode, watch it cite and dedupe against existing rules)
- "What's waiting for approval?" (review mode), then approve one with
  `npm run rules:approve -- <id> --by "Your Name"`
- "Change button-one-primary to a should" (change mode on an approved rule,
  which reopens it)
