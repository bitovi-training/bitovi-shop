# AI enablement: design to code

This branch (`ai-enablement`) is two things at once:

- **A training environment.** A real app, a real Figma file, and a working
  version of every workflow on Bitovi's Design-to-Code menu, so people can
  learn by running them.
- **A context store.** Everything Bitovi knows about these engagements,
  written down where an agent can read it: what we sell, how we deliver it,
  how each workflow works and why. Open this repo in Claude Code (or any
  agent) and ask it about Figma, Code Connect, design rules, prototyping,
  tickets, or design to code, and it can answer, teach, scope and demo.

Nothing here is specific to Figma and Jira in principle. They're the
canonical tools, and the patterns (connect the two sides, write the rules
down, scope against the code, build feedback loops) carry over to others.

## Start here

| If you want to... | Read |
| --- | --- |
| Understand what we sell | [The Design-to-Code menu](design-to-code-menu.md) |
| Scope a new engagement from a call or a proposal | [Scoping an engagement](scoping-an-engagement.md), or ask the agent to use `scope-engagement` |
| Understand how we make a codebase AI-ready | [The codebase enablement checklist](codebase-enablement-checklist.md) |
| Learn a workflow | The skill's `FAQ.md` in `.claude/skills/<name>/` |
| See one run | The "Good things to try" list at the end of each FAQ |

## The workflows

| Menu row | Skill | Foundation it needs |
| --- | --- | --- |
| 03. Keep Figma and code in sync | `connect-code-to-figma` | A component library on both sides |
| (foundation for 01, 02) | `manage-design-rules` | Code Connect, for the component inventory |
| 01. AI designs on the canvas | `design-on-canvas` | Rules store, Code Connect |
| 02. AI reviews designs | `review-design-on-canvas` | Rules store |
| 04. Prototypes, not just engineers | `prototype-in-code` | An app anyone can run; mocks where feasible |
| 05. Requirements and tickets | `write-tickets` | Read access to the code |
| 06. Production code from designs | `design-to-code` | The context layer: `CLAUDE.md` files and the `code-*` skills |

Supporting skills used across rows: `code-build-component`,
`code-write-tests`, `code-review`, `code-commit`.

## How the pieces connect

```
                     Figma  <---- Code Connect ---->  Code
                       |                                |
   design rules store  |                                |  CLAUDE.md files, code-* skills
          |            |                                |
   design-on-canvas ---+--> prototype-in-code ---> design-to-code
   review-design-on-canvas         |                    ^
                                   +--> write-tickets --+
```

Designs and prototypes move in both directions because Code Connect knows
which Figma component is which code component. Tickets and production code
both start from whatever exists (a design, a prototype, an idea) and are
scoped against the code.

## This repo is public

Never commit client names, transcripts, proposals, pricing or client code
here. Use this repo to learn, demo and scope; keep client material in
private places.
