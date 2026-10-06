# Scoping an engagement

How to go from what a client said (a call transcript, an email, a proposal
draft, a sentence) to a scoped piece of work. The `scope-engagement` skill
follows this; it's written out here so a person can follow it too.

## 1. Find the real ask

Clients describe symptoms, not offerings. Translate:

| They say | Usually means | Rows |
| --- | --- | --- |
| "Handoff from design to engineering is slow" / "devs rebuild what's in Figma" | Components aren't connected; designs don't map to code | 03, then 06 |
| "Our AI tools write code that doesn't fit our codebase" | Missing context layer | 06 (checklist steps 1-4, 8-10) |
| "Designers want to try ideas without waiting on engineering" | Prototyping in the real app | 04 |
| "Tickets are vague" / "estimates are always wrong" / "requirements don't match what's buildable" | Scoping without the code | 05 |
| "Our designs are inconsistent" / "the design system isn't followed" | Rules live in people's heads | 02 (and the rules store) |
| "We want AI to help designers make screens faster" | Generation on the canvas | 01 (needs the rules store) |
| "We bought Figma's AI / Copilot and nothing changed" | Harness without substrate | Depends: ask what they hoped would change |

Most real asks touch two or three rows. That's normal: they share
foundations.

## 2. Work out the foundations

Rows depend on each other. Before promising a row, check what it stands on:

- **Code Connect (row 03)** sits under every row that crosses between design
  and code (01, 04, 05, 06). If they don't have it, it's part of the work, for
  at least the components the workflow touches.
- **The design rules store** sits under 01 and 02. If their rules aren't
  written down (they almost never are), deriving them is the first phase.
- **Running the app** sits under 04 and 06. If an agent (or a designer) can't
  run it, nothing else on those rows works. Ask on the first call.
- **A context layer** (`CLAUDE.md` files, reference implementations, checks)
  sits under 06, and makes 04 and 05 better.

Sequence the work foundation first. A common shape: Code Connect, then the
row they actually asked for.

## 3. Ask the qualifying questions

Each row has qualifying questions and disqualifiers in
[the menu](design-to-code-menu.md). Pull out the ones that matter for this ask,
mark which the client already answered (in the transcript or doc), and list
the rest as questions for the next call. Lead with the expensive ones:

- **Can we run your application?** (04, 06)
- **Who decides what good looks like?** (01, 02, 03)
- **Will your engineers accept agent-written work?** (05, 06)

## 4. Draft the scope

For each row in scope:

- **Outcome,** in the client's words.
- **Phases:** discovery, building the foundation it needs, the workflow
  itself, validation against their real work, training. The menu describes
  what's in each.
- **What we build,** named concretely: "a Code Connect mapping for the 40
  components in your checkout flow, a CI check, and a reconciliation report,"
  not "AI enablement."
- **Preconditions on their side:** environment access, a named decision
  maker, seats and plans (Figma Organization or Enterprise for Code Connect),
  a tracker MCP.
- **Acceptance:** what "done" means. On every row: their team runs it without
  us.
- **What's out of scope,** stated plainly.
- **Risks** that would change the plan, each with the question that resolves
  it.

## 5. Show it, using this repo

Every row has a worked version here. Point the client (or the person
scoping) at the skill and its FAQ, and run it live if possible. Seeing an
empty-cart prototype built and shared in minutes does more than any slide.

## Keep client material out of this repo

**This repo is public.** Never commit client names, transcripts, proposal
text, pricing or anything from their codebase here. Scoping happens in chat;
save the result somewhere private (the proposal itself, Confluence, the
client's own repo).
