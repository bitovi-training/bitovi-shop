# Write tickets: FAQ

Background for anyone learning this workflow, and for the agent when someone
asks how it works. The skill is in `SKILL.md`; the team's ticket format is in
`ticket-format.md`.

## What does this do, in one breath?

Give it whatever exists (a Figma design, a prototype, a screenshot, an idea)
and it works out what's actually being built, scopes it with you, checks it
against the code for feasibility and gotchas, and drafts tickets in the
team's format, ready to create in Jira once you approve. It can also check
an existing ticket for what's missing.

That's row 05 on the Design-to-Code menu, "AI writes requirements and tickets
from your designs."

## What problem does it actually solve?

The disconnect clients describe over and over: a designer scopes something
in Figma, a PM writes requirements from the design (or writes them first and
the designer draws to them), and **nobody scopes against the code.** The
engineer who picks up the ticket finds out the hard way that:

- the API doesn't return what the design shows
- the "small" change is to a component used on six other screens
- nobody designed the empty state, the error, or mobile
- half the screen already exists and only one piece is new

This skill starts from the code. It reads the design or prototype, works out
what's new against what exists, and investigates the implementation before
writing a word of the ticket.

## A real example from this repo

The Shop Figma file has a page called "Feature — Product Card Rating" that
adds star ratings to every product card on the home page. From the design
alone, that's a small front-end change: put a Rating component on the card.

The code says otherwise. `GET /api/products`, which feeds the home page,
doesn't return ratings at all. Reviews only come back from the single
product endpoint (`GET /api/products/:id`, via `getProductById` in
`backend/database/db.js`). So showing stars on the grid needs the list
endpoint to return an average rating first. A ticket scoped from the design
would have been sized as a UI tweak and blown up the moment someone started
it. The skill finds this in step 4 and puts it in the ticket's
implementation notes, and probably splits it into two tickets.

## Who runs it?

Anyone: a PM, a designer, an engineering lead. The person doesn't need to
understand the implementation, because the agent takes that on. What the
person brings is intent and judgment: what's in scope, what's out, what
matters. The agent brings the code.

## Why is it a conversation instead of "generate tickets"?

Because what's in scope is a product decision, not something to infer. The
agent proposes ("this looks like the existing cart with one new thing") and
asks only what changes the tickets. It writes its assumptions into the
ticket rather than asking about things a wrong guess wouldn't change, and
it gives advice where it has an opinion. The tickets come out as drafts in
chat, and nothing gets created until the person says so.

## What does "find the delta" mean?

Most new designs are mostly existing things. A designer redraws the cart
page with one new feature, and the whole screen looks new in Figma. The
skill maps every part of the design to the current app (the route, the page
component, each component through Code Connect) and marks it new, modified
or already done. Only the new and modified parts become work.

This is where the rest of the setup pays off. Code Connect turns "a Figma
instance of Button" into "the Button in `components/Button`." In a mock
prototype, each piece is stamped with `data-component`, so there's no
guessing what it is.

## What goes in a ticket?

Whatever `ticket-format.md` says, which is the team's house style. The default
is:

- a short **context** section with a link to the design or prototype
- **acceptance criteria in Gherkin** (Given / When / Then), one scenario per
  behavior, always including the states designs skip
- a **design** section for anything the design shows that criteria don't
  cover, or the reverse
- **implementation notes** with real file paths: what it touches, what it
  reuses, what to watch out for
- **open questions** and who should answer each

## Why Gherkin?

It forces a criterion to be something you can check: a starting state, one
action, a visible result. "The cart should feel helpful" can't be written as
Given / When / Then; "Given an empty cart, When I open the cart page, Then I
see 'You might also like' with four products" can. It also reads well to
non-engineers and maps directly onto end-to-end tests.

That said, the format is the team's, not ours. If a client writes user
stories, or plain checklists, or has a template in Jira already, change
`ticket-format.md` to match. The skill reads the format from that file every
time.

## How does it decide one ticket versus several, or an epic?

It proposes, and the person decides. The defaults: an **epic** when it's a
feature with several pieces that can ship independently; **vertical slices**
for the tickets, so each one delivers something a user can see end to end,
not a "frontend ticket" and a "backend ticket" that are useless apart. It
orders them, names real dependencies, checks Jira for duplicates, and asks
where they belong (existing epic, project, labels, sprint).

## Does it only work with Jira and Figma?

No. Jira and Figma are what's connected here. The tracker is reached through
its MCP server, so Linear, GitHub Issues or Azure DevOps work the same way
with their own servers; swap the tool names and the tracker section in
`ticket-format.md`. The inputs are just as open: a Figma frame, a prototype,
a screenshot, a whiteboard photo, a Google Doc, or a sentence. More context
gives better scoping, but nothing is required except the code.

## Is this only for tickets?

No. Tickets in Jira are the canonical example, because they're what
engineering teams argue about most. But the pattern is general: **take
whatever exists (designs, prototypes, ideas), find what's actually new
against the code, scope it with a person, investigate the implementation, and
write it in the team's format.** That produces good tickets, and it produces
good versions of every other document that describes work:

- **A PRD** that says what's already built and what isn't, instead of
  restating the design
- **A technical spec** that names the real files, endpoints and risks
- **A test plan** built from the acceptance criteria plus the states the
  design skipped
- **Release notes or a stakeholder summary** from what actually changed
- **A Confluence page** documenting a feature for another team

Each document type gets its own format file next to `ticket-format.md`
(`prd-format.md`, say), written from a real example the team considers good.
Publishing goes through that tool's MCP (Confluence, Google Docs, Notion),
always as a draft first. What doesn't change is the part that makes it worth
doing: the document is scoped against the code, not just the design.

## What's check mode for?

Tickets that already exist. It reads the ticket, the design and the code,
and finds what a developer would otherwise have to go back and ask:
criteria the design doesn't support, design details no criterion covers,
missing states, and implementation gotchas. A ticket written from a design
is usually precise about appearance and quiet about behavior, and those gaps
are each a round trip between an engineer and a designer that didn't need to
happen.

It reports in chat. On request it can rewrite the description, post the
questions as a Jira comment, or attach them as annotations on the exact
Figma layers. Annotations, not comments, because the Figma MCP can't post
comments, and an annotation on the layer is clearer anyway.

## What does a client need for this to work?

- **Read access to the code.** This is the whole point; without it, it's a
  design-to-text tool like any other.
- **Read access to their designs** (the Figma MCP) and **their tracker** (its
  MCP), plus write access to the tracker for creating tickets.
- **Their ticket format**, as a few real tickets the team considers good.
  We turn those into their `ticket-format.md`.
- Code Connect helps a lot with finding the delta, but isn't required: the
  agent can still match components by reading the code, just less reliably.

The menu notes this row "needs nothing first," and that's true: it works on
day one. It gets sharper as the other foundations (Code Connect, mocks,
rules) land.

## Good things to try in this repo

- "Write tickets for the empty cart suggestions prototype"
  (`prototypes/empty-cart-suggestions/`)
- "Write tickets for the Product Card Rating page in Figma" (watch it find
  that the list endpoint has no ratings)
- "Is FD-8 ready to build?" (check mode on the demo ticket)
