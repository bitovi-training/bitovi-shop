# Review design on canvas: FAQ

Background for anyone learning this workflow, and for the agent when someone
asks how it works. The skill itself is in `SKILL.md`.

## What does this do, in one breath?

Point it at a Figma design and it checks it against the design system's
written rules, looks at it for layout problems the rules can't see, and
leaves findings as annotations on the exact layers involved. It never
changes the design.

That's row 02 on the Design-to-Code menu, "AI reviews every design for
consistency": a linter for the design system.

## What does it check?

Four kinds of finding, kept separate on purpose:

- **Violations** of approved rules ("three primary buttons on one view").
  These are what the design system can defend.
- **Layout** problems: clipping, overflow, overlap. No rule says "don't
  overflow," which is exactly why it needs its own check.
- **Craft:** raw hex instead of a color variable, hand-typed spacing,
  missing auto layout, text with no style. Not a rule, but it decides
  whether the design survives the next library update.
- **New patterns:** elements that resolve to no component at all. Not a
  violation; a question for the design system team.

## Why only approved rules?

Because a reviewer that enforces guesses loses trust fast. Proposed rules
(including everything derived automatically) haven't been signed off by a
person yet. The review can mention them as "would also flag," which is a
useful way to show a designer what approving them would mean, but it never
reports them as violations.

## Why does it rewrite all annotations every time?

A fix in one place can resolve a finding somewhere else: cutting two buttons
clears a screen-level "too many calls to action." If annotations were edited
piece by piece, stale ones would linger and look exactly like real ones. So
every review clears everything and judges the design as it stands. A design
with no annotations is a design that just passed.

## Why not let it fix things too?

Two reasons. Designs made by hand get reviewed, and the designer should
decide what changes in their own work. And when the agent built the design,
a reviewer that could edit would be grading work it can quietly change. The
skill that builds (`design-on-canvas`) applies fixes; this one only judges.

## Why is a false positive worse than a miss?

Because people stop reading a check that cries wolf, and then it catches
nothing. The skill reports a violation only where the design clearly breaks
the rule, reads each rule's exceptions as part of the rule, and says "not
sure" when it's not sure.

## Does it review code too?

No. This is the Figma side. A code-side check (do shipped components follow
the same rules?) would reuse the same rules store but needs different
inputs and tools, so it would be its own skill, `review-design-in-code`.
Nobody has asked for it yet, so it isn't built.

## How do I read the annotations on a reviewed design?

Each finding is an annotation on the exact layer it's about, labeled with its
strength and rule: `[MUST] button-one-primary: three primary buttons on one
view`. Open the design in Figma and the annotations show in Dev Mode and the
annotation panel. `MUST` findings are what the design system would block;
`SHOULD` and `CONSIDER` are judgment calls for the designer. Layout and craft
findings are labeled as such, so they're never confused with rule
violations. The review clears and rewrites every annotation on each run, so
what's there is always the current state.

## What does a review of a real screen look like?

The Home page in the Shop file (`Base App`, node `36:1239`) makes a good
example, because it's a real, shipped design that still breaks approved
rules:

- **[MUST] `accent-single-action`:** the hero's Add to cart and every product
  card's Add to cart all use the accent color, so no single action reads as
  the main one. (Arguably the rule needs an exception for repeated per-item
  actions; that's a conversation for whoever owns the rules.)
- **[SHOULD] `badge-follows-title`:** the hero's "Featured pick" and "In
  stock" badges sit above the product name instead of after it on the same
  line.
- **Craft:** gaps of 10px appear throughout, which isn't on the spacing scale
  (see the proposed `spacing-from-scale` rule).

That's the useful kind of output: every finding is either a real fix, or a
sign that a rule and the team's actual practice have drifted apart. Both are
worth knowing.

## How strict should the review be?

That's a question for the client, and it's on the menu's qualifying list.
Three common settings:

- **Coaching:** findings are suggestions with explanations. Good for teams
  new to written rules.
- **Advisory:** findings are reported, and `MUST` findings need a reason
  before handoff, but nothing is blocked.
- **Blocking:** a design with open `MUST` findings doesn't go to engineering.
  Only works once the rules are trusted, which means approved by someone with
  standing and rarely wrong.

Start at coaching, and tighten as the rules earn trust. Strength (`must`,
`should`, `consider`) is set per rule, so strictness can grow rule by rule.

## What does a client need for this to work?

Written rules, approved by someone with standing. That's the whole
dependency, and it's why the menu prices rule derivation into this offering:
almost nobody has their standards written down. The rules setup mode can
draft a first batch from their existing designs for them to sign off.

## Good things to try in this repo

- "Review the Home page" (`Base App`, node `36:1239`). Expect real findings:
  the accent buttons on every product card conflict with
  `accent-single-action`, and the hero badges sit above the title.
- "Review the product details page" (`36:1861`). The button order conflicts
  with `button-order-primary-right`.
- Approve a few proposed rules, review again, and watch new findings appear.
