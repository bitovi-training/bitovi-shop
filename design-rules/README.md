# Design rules store

The foundation for the canvas workflows: getting a design system's rules into a
form an agent can retrieve deterministically.

## The problem

Most of what a design system knows is not written down. Component documentation
covers each component on its own, and tooling already catches accessibility
failures. What is missing is how components combine: which arrangements are
approved, what should never sit next to what, when a variant is the wrong
choice. Those rules live in senior designers' heads.

They are also many-to-many. One rule touches several components, one component
appears in many rules. A flat list of skills does not hold that shape, and
stuffing every rule into an agent's context does not scale past a few dozen.

## How this works

**Rules are YAML, under `rules/`.** Source of truth, in git, diffable, grouped
by scope. A designer can review a rule change in a pull request.

**Components are extracted, never hand-written.** The inventory comes from the
codebase: components from the source tree, variants from the exported variant
maps, Figma node ids from Code Connect, usage prose from `docs/components`.
Everything stays maintained where the team already maintains it.

**SQLite is a derived index.** `build.mjs` validates and rebuilds it. Delete
`rules.db` and rebuild any time; nothing is lost.

Retrieval is a join, so it is deterministic: the same design returns the same
rules every time. That matters more than it sounds. A conformance check that
silently misses a rule is worse than no check at all.

## Use

Two ways in. The CLI is for working in a checkout; the MCP server
(`backend/mcps/design-rules/`) is for an agent that has no terminal. Both go
through `store.mjs`, so they cannot disagree.

From the repo root:

```sh
npm run rules:build                                  # validate and rebuild the index
node design-rules/build.mjs --check                  # validate only, non-zero exit on error
npm run rules:approve -- <id> [more ids] --by "Name"  # approve rules (people only)

node design-rules/query.mjs --components Button,Badge          # rules for a design
node design-rules/query.mjs --components Button --inventory    # plus what Button is
node design-rules/query.mjs --all --status proposed            # awaiting review
```

### What's in this folder

| Path | What it is |
| --- | --- |
| `rules/*.yml` | The rules, one file per scope. The source of truth. |
| `schema.sql` | The SQLite schema for the index |
| `build.mjs` | Validates the rules and builds `rules.db` (generated, gitignored) |
| `store.mjs` | The read side: the retrieval join, one rule, the inventory, the gaps |
| `write.mjs` | The write side: create, update, delete, validated and rolled back on failure |
| `approve.mjs` | Human-only approval |
| `query.mjs` | CLI over `store.mjs` |
| `candidates/` | Write-ups of components a design needed that the library lacks (from `design-on-canvas` component mode) |
| `changes/` | Records of review and fix passes on designs (from `design-on-canvas`, thorough depth) |

The MCP server's tools are plain CRUD over rules, plus two reads for context:

| Tool | Does |
| --- | --- |
| `list_rules` | Rules that apply to a set of components and tokens (the retrieval join) |
| `get_rule` | One rule in full, with rationale and approver |
| `create_rule` | Add a rule, always as `proposed` |
| `update_rule` | Change a rule; editing an approved rule's substance reopens it |
| `delete_rule` | Remove a rule (or retire it with `update_rule`) |
| `list_components` | The component inventory |
| `list_gaps` | Where the store is thin |

Every write edits the YAML in place, runs the build's validation, and rolls
back if it fails. Approval is the one thing agents can't do:

```sh
npm run rules:approve -- <rule-id> --by "Levi"
```

Rules are managed through the `manage-design-rules` skill.

## Validation

The build fails on a rule that references a component the codebase does not
ship, a token the stylesheet does not define, an approved rule with nobody
named as approver, or a rule with no tags at all, which nothing would ever
retrieve. This is what makes agent-authored rules safe: a hallucinated
component name fails the build rather than sitting silently in the store.

## Provenance

Every rule records where it came from, and the marker survives:

- `session`: captured in a working session with the design team
- `inferred`: parsed by an agent from existing shipped designs
- `proposed`: drafted by an agent, not yet confirmed by a human

Nothing enforces until a human with standing approves it, and the approval
carries their name. An agent's inference never silently becomes an assertion.

## How this maps to a client

A typical enterprise setup maps onto this closely. Component docs often live
somewhere other than `docs/components` (a documentation site, GitLab Pages,
Storybook docs), and the ingestion is the same shape. Code Connect may already
be in place. Tokens are often primitives and semantics with no component-level
tokens, which is also true here.

The gap is usually the same too: per-component docs exist, combination rules do
not. That is the part that has to be authored, and it is the part everything
else depends on.
