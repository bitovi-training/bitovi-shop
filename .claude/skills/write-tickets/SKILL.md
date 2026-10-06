---
name: write-tickets
description: Turn a design, a prototype, a screenshot or an idea into well-scoped tickets (or an epic with tickets), using the codebase to work out what is actually new, what already exists, and what will be tricky to build. Also checks an existing ticket against the design and code for gaps. Collaborative - proposes scope and asks before creating anything. Use when asked to write, create, scope, split or break down tickets or requirements, or to check whether a ticket is ready. The same method writes other supporting documents scoped against the code (a PRD, a technical spec, a test plan, a Confluence page). Two modes - write, check.
---

# Writing tickets

Designers scope from the design, PMs write requirements from the design or
the other way round, and nobody scopes against the code. Then an engineer
picks up the ticket and finds the API doesn't return that field, the
"small change" touches a component used on six screens, and nobody designed
the empty state. **This skill scopes tickets against the code.** The agent
takes on understanding the implementation, so the person running it doesn't
need to be a designer or an engineer.

On the Design-to-Code menu this is row 05, "AI writes requirements and
tickets from your designs": tickets in the team's format, broken up, each
checked against what's really in the code.

## Setup

- **Format:** `ticket-format.md` next to this skill: the tracker, project,
  issue types, title style, description sections and the Gherkin rules.
  **Follow it exactly.** It's the team's house style, and it's the file to
  change for a different team.
- **Tracker:** Jira through the Atlassian MCP (`createJiraIssue`,
  `editJiraIssue`, `getJiraIssue`, `searchJiraIssuesUsingJql`,
  `createIssueLink`). Use whichever Atlassian server is connected and
  authenticated; if none is, say so.
- **Designs:** the Figma MCP. **Prototypes:** `prototypes/<name>/` (mock) or
  `frontend/src/prototypes/<name>/` on a `prototype/` branch (app).
- **What exists:** the code, Code Connect (`list_components`,
  `get_code_connect_map`), routes in `frontend/src/pages/routes.js`, the API
  in `backend/routes/`, and the design rules (`list_rules`).

## Pick the mode

| They say | Mode |
| --- | --- |
| "write tickets for this", "scope this design", "break this prototype down", a Figma link or prototype | **write** |
| "is FD-12 ready?", "what's missing from this ticket?", a ticket key | **check** |

---

## Mode: write

### 1. Gather everything

Take whatever exists, as much as possible. The more context, the better the
scope:

- a **Figma frame** (read structure with `get_design_context`, components
  through `get_code_connect_map`, and take a screenshot)
- a **prototype** (its `prototype.md`, a screenshot, and its markup: in a
  mock, every component carries `data-component` / `data-variant` stamps; in
  an app prototype, read the imports)
- a **screenshot**, an existing ticket, a doc, or just a description

Read it in every way available: structure (what it's made of), visual (what
it looks like), and intent (what the spec or person says it's for).

### 2. Find the delta

Most designs are mostly things that already exist. A redesigned cart screen
with one new feature is one feature of work, not a whole screen. Map every
part of the artifact to the current app:

- Which **screen** is this? Match it to a route and its page component.
- Which **components** exist already? Code Connect maps Figma instances and
  mock stamps straight to code.
- Mark each part **new**, **modified**, or **already done**.

The new and modified parts are the work. Everything else is context.

### 3. Propose the scope, then refine it together

Come back with a short read, not a questionnaire:

> This looks like the existing cart page with one new thing: a "You might
> also like" row of four product cards when the cart is empty. Everything
> else on the screen exists already.
>
> I'd scope it as:
> - **In:** the suggestions row on the empty cart, reusing ProductCard, and
>   Add to cart from that row
> - **Out:** how products get chosen (I'd hard-code four for now), and any
>   change to the non-empty cart
>
> Two things only you can answer:
> - Which products: best sellers, recently viewed, or picked by hand?
> - Does "Go to shop" stay now that there are products right there?

Give advice where it helps ("this splits naturally into two tickets," "I'd
leave recommendations logic out of this first ticket"). Ask only what
changes the tickets. Put assumptions in the ticket and flag them, rather
than asking about things a wrong guess wouldn't change.

### 4. Investigate the code

This is the part nobody else does, and the part the engineer will thank you
for. For the work in scope, find:

- **What it touches:** the files and components that change, with paths.
- **What it reuses:** components, hooks, endpoints, styles that already do
  part of the job.
- **Whether the data exists:** does an endpoint return what the design shows?
  If the design shows a rating and the API has no rating field, that's
  backend work the design hid.
- **Ripples:** a change to a shared component touches every screen that uses
  it. Name them.
- **Missing states:** empty, loading, error, long text, mobile. If the
  design doesn't show them, they become acceptance criteria and open
  questions.
- **Rule conflicts:** anything that breaks an approved design rule
  (`list_rules` for the components involved).

### 5. Propose the structure

- **One ticket, several, or an epic with children.** An epic when it's a
  feature with several independently shippable pieces.
- **Split by vertical slice:** each ticket ships something a user can see
  or use, end to end. Not "frontend ticket" and "backend ticket."
- **Order and dependencies:** what has to land first, and why.
- **Project-management questions:** is there an existing epic this belongs
  under, which project, any labels or sprint? Check for duplicates with
  `searchJiraIssuesUsingJql` first, and show anything close.

### 6. Draft, then create on approval

Write every ticket in the `ticket-format.md` format: Gherkin acceptance
criteria, links to the design or prototype, implementation notes with real
paths, open questions. **Show the full drafts** in chat, exactly as they'll
appear. Let the person edit.

**Create nothing until they say so.** Then create the epic first, the
children under it (`parent`), and links for real dependencies. Report back
with each key as a link and one line on what it asks for.

---

## Mode: check

Read an existing ticket against the design and the code, and find what a
developer would otherwise have to go back and ask. A ticket written from a
design is precise about appearance and quiet about behavior.

1. **Read the ticket** (`getJiraIssue`) and sort it into: what's specified,
   what's asserted but not specified (a criterion with no design detail
   behind it), and what's absent (behavior the feature obviously needs that
   the ticket never mentions).
2. **Read the design and the code** as in write mode, steps 1, 2 and 4.
3. **Report the gaps** in chat, grouped:
   - criteria the design contradicts or doesn't show
   - design details no criterion covers
   - missing states (empty, loading, error, mobile)
   - implementation gotchas the ticket doesn't mention
   - questions, each with who should answer it (designer, PM, engineer)
4. **Offer to fix it:** a revised description for the person to approve
   (`editJiraIssue`), or the questions as a Jira comment
   (`addCommentToJiraIssue`). If they want the questions on the design,
   attach them as **annotations** on the specific layers with `use_figma`
   (load `figma-use` first). The Figma MCP can't post comments, and
   annotations are better anyway, because they sit on the exact layer.

---

## Not just tickets

Jira tickets are the canonical output, but the method works for any document
that has to describe work accurately: a PRD, a technical spec, a test plan,
release notes, a Confluence page for stakeholders, a handoff doc. The steps
are the same (gather everything, find the delta, scope together, investigate
the code, propose a structure, draft, publish on approval). Only two things
change:

- **The format.** Use a format file next to this one for that document type
  (`prd-format.md`, `test-plan-format.md`). If none exists, ask the person
  for a good example of the document and write the format file from it
  before drafting.
- **Where it's published.** The MCP for that tool (Confluence through the
  Atlassian MCP, Google Docs, Notion), with the same rule: show the full
  draft and publish only on approval.

## What not to do

- Don't create, edit or comment on anything in Jira without approval in the
  same conversation.
- Don't scope from the design alone. If you haven't looked at the code, you
  haven't scoped it.
- Don't put implementation details in acceptance criteria. Criteria say what
  a user can see and do; implementation notes say how.
- Don't split by layer (frontend / backend). Split by what ships.
- Don't invent the team's format. Use `ticket-format.md`, and if a team
  wants something different, change that file.
