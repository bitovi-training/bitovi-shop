# design-rules MCP

Retrieval and authoring for the design rules store, over MCP.

## Why this exists next to the CLI

`design-rules/query.mjs` needs a terminal and a checkout. A designer working in
Figma has neither. This server puts the same retrieval behind a transport a
hosted agent can reach, which is what this has to become to run anywhere but a
developer's laptop.

Both paths share `design-rules/store.mjs`, so there is exactly one join. Two
copies would drift, and a conformance check that disagrees with itself
depending on how it was called is worse than either answer alone.

## Tools

| Tool | What it does |
|---|---|
| `list_rules` | Rules applying to a set of components and tokens. Globals always included. Ordered must → should → consider. |
| `get_rule` | One rule in full, with rationale, provenance and approver. |
| `create_rule` | Writes YAML, validates with the real build, rebuilds the index. Always `proposed`. |
| `update_rule` | Changes only the fields passed. Editing an approved rule's substance reopens it. `status: "retired"` stops enforcement. |
| `delete_rule` | Removes a rule. Git keeps the history. |
| `list_components` | Inventory: source path, Figma node, variants, usage docs. An empty result is a real answer. |
| `list_gaps` | Where the store is thin: ungoverned components, missing docs, unapproved rules. |

## What it deliberately does not do

**No SQL surface.** The sibling `sql-mcp` exposes `execute_sql`, which is right
for exploring a shop database and wrong here. The claim this store makes is
that the same design returns the same rules every time. An agent composing its
own joins gives that away: it can write a subtly wrong query, miss a `must`
rule, and nothing ever reports it. Callers choose components and tokens; the
server owns the query.

**No full-text search.** It was considered and cut. The agent decomposes a
question into component labels, retrieves, and reasons over the returned rule
text and usage docs in context: a rule mentioning spacing under `Card` is
found by asking for `Card`. If general spacing rules are wanted, the answer is
to write general spacing rules, not to add an index that hides their absence.

**No writes to SQLite.** `rules.db` is derived. A rule written into it vanishes
on the next rebuild and skips every validation. Every write tool edits the YAML
in place and rebuilds, and rolls back if validation fails, so a hallucinated
component name never lands on disk.

**No approval.** An agent can propose, edit, retire and delete rules, but only a
person can approve one (`npm run rules:approve -- <id> --by "Name"`), and the
approval carries their name.

## What is and is not deterministic

Worth being precise, because it is easy to overclaim.

The **join is deterministic**: given labels, the same rules come back every
time, at fifty rules or 4,000. The **write path is deterministic**: the build
fails on unknown components or tokens, and nothing enforces until a human
approves.

The agent still chooses the labels and still interprets what comes back. Both
are judgment. What changes is the failure mode: not "the model forgot a rule"
but "the design had a Card and nothing asked for Card". That is inspectable, and
fixable.

Confidence is highest where the labels are not freelanced. `review-design-on-canvas`
walks the Figma node tree and collects component instances, so the labels come
from what is literally on the canvas.

## Running

Registered in `.mcp.json` as `design-rules`. Manually:

```sh
npm run mcp:design-rules
```

The index is gitignored, so a fresh clone needs it built first:

```sh
node design-rules/build.mjs
```
