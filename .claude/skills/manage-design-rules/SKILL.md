---
name: manage-design-rules
description: Create, find, change and remove the design system's rules about how components fit together, using the design-rules MCP server. Use when asked to derive rules from Figma designs, set up a rules store from scratch, add or write down a design rule, edit, retire or delete one, or review rules awaiting approval. Five modes - setup, derive, add, change, review.
---

# Managing design rules

A design system documents its components one at a time. What it almost never
writes down is how they **fit together**: which arrangements are approved,
what should never sit next to what, when a variant is the wrong choice. Those
rules live in senior designers' heads and surface only when someone breaks
one in review. This skill gets them out of heads and into a store an agent
can query, so that designing on the canvas and reviewing designs can follow
the same rules a senior designer would.

Everything else on the Design-to-Code menu that touches design quality
(AI designs on the canvas, AI design review) reads from this store. If the
store is wrong or thin, those workflows are wrong or thin.

## The store

- **Rules:** YAML under `design-rules/rules/`, one file per scope
  (`component.yml`, `pair.yml`, `screen.yml`, `global.yml`). The source of
  truth, in git, reviewable in a pull request.
- **Index:** SQLite at `design-rules/rules.db`, rebuilt from the YAML by
  `npm run rules:build`. Derived, never edited by hand.
- **Component inventory:** extracted from the code (components, variants),
  Code Connect (Figma node ids) and `docs/components` (usage prose). Rules
  can only reference components and tokens that really exist.
- **MCP server `design-rules`**, which is how you work with it:

| Tool | Use it to |
| --- | --- |
| `list_rules` | Get the rules that apply to a set of components and tokens |
| `get_rule` | Read one rule in full, with rationale and approver |
| `create_rule` | Add a rule (always `proposed`) |
| `update_rule` | Change a rule, or retire it with `status: "retired"` |
| `delete_rule` | Remove a rule entirely |
| `list_components` | See what components and variants exist |
| `list_gaps` | See where the store is thin |

Every write validates against the real build and rolls back on failure, so a
misspelled component name never lands. **You cannot approve a rule.** Only a
person can, with `npm run rules:approve -- <id> --by "Name"`, and the approval
carries their name. That is what makes an approved rule trustworthy when an
agent enforces it later.

## What a rule looks like

```yaml
- id: badge-follows-title
  text: >-
    A badge that qualifies a title sits immediately after it on the same line,
    never on the line below. A badge on its own line reads as a separate
    element rather than as a property of the thing above it.
  scope: pair
  strength: should
  source: inferred
  status: approved
  approved_by: Levi
  approved_on: 2026-09-22
  components: [Badge, Card]
```

Every field earns its place:

- **`text`** is the rule in plain language, written for a designer and an
  agent both. **Exceptions go in the text.** A rule without its exceptions is
  wrong part of the time and gets ignored.
- **`scope`** says what the rule governs: `component` (one component on its
  own), `pair` (how two or more relate), `screen` (a property of the whole
  screen), `global` (everywhere).
- **`strength`** is how hard it is: `must` (a bug you'd block), `should` (you'd
  raise it in review), `consider` (a judgment call worth mentioning). Findings
  get ranked by this instead of dumped.
- **`components` and `tokens`** are the tags, and the tags decide retrieval.
  A rule is returned when a design contains anything it is tagged with. **An
  untagged rule is invisible**, and under-tagging is the most common way a
  correct rule never gets used.
- **`source`** is where it came from: `session` (a person said it),
  `inferred` (derived from existing designs), `proposed` (the agent is
  suggesting it). It stays attached for the rule's whole life.
- **`status`** is `proposed`, `approved` or `retired`. Only approved rules are
  enforced.

### How retrieval joins

Retrieval is a join, not a search. Given the components and tokens in a
design, `list_rules` returns every **global** rule plus every rule tagged
with **any** component or token present, ordered `must`, then `should`, then
`consider`. So:

- A **pair** rule is tagged with both sides (`[Badge, Card]`), and comes back
  whenever either one is on screen.
- A rule about color or spacing rather than a component is tagged with
  **tokens** (`[--color-accent]`).
- The same design always gets the same rules. That determinism is the point:
  a checker that silently misses a rule some of the time is worse than none.

### Kinds of rules

The store has examples of every kind below. The approved rules are the hand-written
set; the ones marked *proposed* were derived from the Shop designs and are waiting
for sign-off.

| Kind | Typical scope | Example from this store |
| --- | --- | --- |
| **Variant choice:** when to use which variant | component | `button-error-variant-scope`: the Error button is only for destructive actions, not for "go back" |
| **Quantity:** how many of something | component, screen | `button-one-primary`: one primary button per group. `cta-limit-per-screen` |
| **Composition:** what goes inside or next to what | pair | `card-no-nesting`, `badge-follows-title`, `icon-with-label` |
| **Order and alignment** | pair | `button-order-primary-right` (with its toolbar exception), `input-select-alignment` |
| **Color meaning:** what a color is allowed to say | global | `semantic-color-meaning`: red and green mean failure and success, never decoration. `accent-never-surface` |
| **Hierarchy:** emphasis across the screen | screen | `accent-single-action`, `heading-hierarchy-skip` |
| **Navigation and chrome** | screen | `breadcrumb-depth`: only on pages two or more levels deep |
| **Content and copy:** formats and wording | component, global | *proposed:* `price-format`, `total-labels`, `quantity-format`, `date-format` |
| **States:** what must exist besides the happy path | component, screen | *proposed:* `collections-have-empty-states`, `out-of-stock-replaces-action` |
| **Accessibility beyond what linters catch** | pair | `icon-with-label`; *proposed:* `form-labels-above` |
| **Responsive behavior** | screen | *proposed:* `design-every-breakpoint` |

---

## Pick the mode

| They say | Mode |
| --- | --- |
| "set up design rules", "derive rules for the whole design system", an empty store | **setup** |
| "what rules does this design suggest", "derive rules from this screen", a Figma link | **derive** |
| "add a rule", "write this down", "designers here never do X" | **add** |
| "change / soften / retire / delete this rule" | **change** |
| "what's waiting for approval", "review the proposed rules" | **review** |

If it's genuinely unclear, ask one question.

---

## Mode: setup

Start a rules store for a design system that has none, by deriving rules from
the designs that already exist.

1. **Check the foundation.** `list_components` should return the real
   inventory. If components are missing, the store can't tag rules to them,
   so fix that first (it's built from code and Code Connect; see the
   `connect-code-to-figma` skill).
2. **Pick the source material with the person.** Shipped, approved screens
   are good evidence. Explorations and abandoned drafts are not. In the Shop
   file the `Base App` page is the built app; the `Feature — ...` pages are
   designs in progress, and the demo pages are scratch. Confirm with the
   person rather than assuming.
3. **Survey, then cluster.** Read the screens with the Figma MCP
   (`get_metadata` for structure, `get_design_context` for detail). Look for
   **repetition**: an arrangement that appears the same way on several
   screens is probably a rule; one that appears once is probably a choice.
   Group what you find by the kinds above.
4. **Separate what conflicts.** Before drafting anything new, check every
   pattern against the existing rules (`list_rules` with `status: "any"`).
   Where the designs **contradict** an approved rule, don't write anything:
   collect those as questions. Either the design drifted or the rule is
   wrong, and only the person can say which.
5. **Write the candidates** with `create_rule`, `source: "inferred"`. They
   land as `proposed`, which is safe: nothing enforces until sign-off. Put the
   evidence in `rationale` (which screens, which node ids, how many times),
   and say so plainly when the designs disagree with each other and the rule
   is choosing one side.
6. **Get sign-off.** This is the step that turns observations into rules,
   so don't skip it or bury it. Present the batch as a numbered list grouped
   by kind, each with its strength and a one-line evidence summary, then the
   contradictions as separate questions. Ask the person to go through it and
   answer per rule:
   - **approve** as written
   - **edit**: they correct the wording, strength or tags, and you
     `update_rule` (it stays proposed until approved)
   - **reject**: you `delete_rule`
   - **not sure**: leave it proposed for someone with more standing

   "Approve all except 4, 9 and 12" is a fine answer. When they're done,
   give them **one** command for everything they approved, since you can't
   run approval yourself:

   ```sh
   npm run rules:approve -- price-format header-on-every-page ... --by "Their Name"
   ```

   If several people own different areas (a brand lead for color, a UX lead
   for forms), split the list by area so each signs off on their own part.
7. **Hand over.** Run `list_gaps` and say what's still uncovered and what's
   still waiting.

An inferred rule describes what the designs **do**, which isn't always what
the team **intends**. Say so when presenting them.

## Mode: derive

Pull new rules out of one design, alongside rules that already exist.

1. Read the design with the Figma MCP and list the components and tokens in
   it.
2. `list_rules` for those components with `status: "any"`, so you see
   proposed and retired rules too.
3. For each pattern you notice, decide which it is:
   - **Already covered:** say so and cite the rule. Don't draft a duplicate:
     two rules that say nearly the same thing will eventually disagree.
   - **Contradicts an existing rule:** don't write anything. Show both and
     ask which is right. Either the design is wrong or the rule is.
   - **Extends one:** propose an `update_rule` (a new exception, a wider tag).
   - **New:** draft it as in setup, with this design as the evidence.
4. Confirm, write, and report as in setup.

## Mode: add

Someone tells you a rule. Your job is to ask the questions that turn "cards
shouldn't be cramped" into a rule with a scope, a strength and the tags that
decide whether anyone ever sees it.

1. **Check what exists first.** `list_rules` for the components involved and
   `list_components` for their usage docs. It may already be written down
   (say so and stop), or half-written (amend instead of adding).
2. **Interview briefly, a few sharp questions, not a form:**
   - *What breaks when this is violated?* The answer usually names the real
     subject, which decides scope and tags.
   - *Would you block it, or raise it?* That's `must` versus `should`.
   - *When doesn't it apply?* The exception is the part people forget and
     the part that makes a rule usable.
   - *What does it touch?* Every component involved, both sides of a pair,
     and any tokens.
3. **Say it back in its stored shape** and let them correct it:

   > Scope `pair`, strength `must`, tagged Card.
   > "Cards do not nest inside cards. Nested cards produce competing borders
   > and ambiguous grouping. Use spacing and a heading to separate content
   > inside a single card."

4. **Write it** with `create_rule`, `source: "session"`.
5. If validation rejects a component name, don't guess at a near match. Call
   `list_components` and ask which real component they meant.

## Mode: change

- **Edit** with `update_rule`, passing only what changes. If the rule was
  approved and you change its text, scope, strength or tags, it goes back to
  `proposed` automatically. Tell the person it needs approving again.
- **Retire** with `update_rule` and `status: "retired"` when a rule no longer
  applies but it's worth knowing it once did. It stops being enforced and
  stays in the file.
- **Delete** with `delete_rule` only for mistakes and duplicates. Confirm
  first if the rule was approved. Git keeps the history either way.

Before changing an approved rule, `get_rule` it and show the person who
approved it. Changing a rule someone else signed off on is worth a heads-up
to them.

## Mode: review

Walk the person through what's waiting.

1. `list_gaps` → `rules_awaiting_approval`, then `get_rule` on each.
2. For each, show the rule, its source and its evidence, and give your read
   on whether it holds up.
3. For everything they approve, give them one command. It takes any number
   of ids, and you can't run the approval yourself:

   ```sh
   npm run rules:approve -- <id> <id> <id> --by "Their Name"
   ```

4. For anything they reject, `delete_rule` it, or `update_rule` it with their
   correction (it stays proposed).

---

## Keep the store honest

End any session that wrote rules with `list_gaps` and say what it shows:
components no rule covers, components with no usage docs, rules still
waiting. A store nobody maintains stops being worth querying, and the decay
is quiet.
