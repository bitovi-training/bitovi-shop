# The Design-to-Code menu

Six offerings for getting from Figma to working code with AI. Each one is an
engagement we deliver in the client's environment, with training included,
and each has a skill in this repo that shows the workflow running end to end.

Pricing and margins are deliberately not in this public repo; ask the
practice for the current numbers.

## The idea behind the menu

An AI enablement engagement has three layers, and they behave completely
differently:

- **The harness:** Claude Code, Copilot, Cursor, Codex. File system, terminal,
  MCP, the agent loop. A commodity, and the client already bought it before
  they called us.
- **The craft:** skills, context files, MCP design, feedback loops, knowing when
  to reach for Playwright. Real expertise, but the same whether the agent
  writes React or writes proposals.
- **The substrate:** what has to be true about *their* environment before an
  agent can do the work. Code Connect, a documented design system, design
  rules, mocked services, a test harness, a visual loop. Different in every
  domain, so it's the part that carries a niche. **This is what the menu sells.**

We don't advertise "AI enablement." We advertise getting from Figma to code
fast, and AI enablement is how it's delivered.

Three things are true of every row:

- **Training is included.** The last phase is always teaching their team to
  run and maintain what we built.
- **It lives in their repositories,** on their infrastructure, using tools
  they already pay for.
- **Done means they run it without us.** That's the acceptance criterion. So
  anything that quietly expires once we leave isn't finished: mappings ship
  as Code Connect rather than a cache in our tooling, maintenance rides on the
  agent, and a CI check is a deliverable, not a nicety.

## How the rows relate

```
1 Draft designs        4 Build prototypes        6 Production code
     2 Check consistency        5 Write tickets
   3 Map your components, so everything above knows what's already built
```

The further right, the deeper into the codebase it reaches. Row 03 is what the
others build on, and the design rules store is what rows 01 and 02 build on.
Code Connect is included in every row that crosses between design and code,
because those workflows need a mapping to function.

---

## 01. AI builds new designs on your Figma canvas

**For:** designers. **Typical length:** 3 to 4 weeks.
**Skill here:** `design-on-canvas` (on top of `manage-design-rules`).

A designer describes a screen, points at a ticket, or drops in a sketch, and
an agent builds it from their own components and variables. Real editable
layers the team can work from, not a mockup to redraw. Includes deriving just
enough written rules for the agent to generate against.

**What we build:** the generation skill tuned to their library, a rules store
seeded from their existing designs, the review loop, and training.

**Qualifying questions:**
- Is the component library real: actual components with variants, auto
  layout, and variables rather than hard-coded values?
- Who decides whether a generated design is acceptable, and will they commit
  to being that person?
- Can they hand over five screens they consider good, to measure against?
- Are the rules for combining components written down, or in people's heads?
- Which agent has the organization standardized on?

**Disqualifying:** no real design system, or no named person who can judge
the output.

**Worth saying up front:** writing to the canvas is a Figma capability that's
in beta and expected to become usage-based paid. It's their bill, which is
exactly why it belongs in the first conversation.

## 02. AI reviews every design for consistency

**For:** designers. **Typical length:** 4 to 5 weeks.
**Skill here:** `review-design-on-canvas` (on top of `manage-design-rules`).

A linter for their design system. An agent reads their existing designs and
works out the rules they already follow; their team reviews, corrects and
approves them; every new design after that gets checked and flagged where it
doesn't match, with the rule cited.

**What we build:** the rulebook (derived from their real files, then approved
by their senior designers), the review skill, and training. Almost nobody has
their standards written down, so deriving the rulebook is the first thing.

**Qualifying questions:**
- How many designers, and is there a senior who arbitrates consistency
  today? That person is the buyer and the one who signs off on the rulebook.
- How many brands and product lines? This decides the size of the job.
- Is there a design system, even an undocumented one?
- How strict should it be: blocking, advisory, or coaching?
- Can they show designs they consider on-standard, and a few they consider
  off?

**Disqualifying:** a single designer (consistency isn't yet a problem worth
paying to solve), or no design system at all.

## 03. Keep your Figma library and your code in sync

**For:** designers and engineers. **Typical length:** about 3 weeks.
**Skill here:** `connect-code-to-figma`.

An agent maps each component in their Figma library to the real component in
code with Code Connect, so developers (and agents) see the actual code behind
a design. The same agent keeps the mapping current as the library grows, and
reports where the two sides have drifted. The deliverable includes a
reconciliation report: what exists on one side only, where values have
drifted, and what we'd do about each. Closing those gaps is a follow-on,
scoped from the report.

**Qualifying questions:**
- Is there a component library on both sides, in Figma and in code?
- Who owns the design system in code? Mappings need a maintainer; if the
  honest answer is nobody, we'd be installing something that rots.
- Who decides what the design system should be? That's who the report is for.
- How far apart do they think the two are? The gap between their guess and
  the real answer is usually the sale.
- What framework, and how are components exported?

**Disqualifying:** no component library in code, or a Figma file with no real
components to map to.

## 04. Anyone can build a working prototype, not just engineers

**For:** designers and product. **Typical length:** 4 to 6 weeks.
**Skill here:** `prototype-in-code`.

Starting from an idea, a Figma file, or a ticket, anyone on the team works
with an agent to build a new feature into their real app. Each prototype gets
its own URL, so showing it to a stakeholder means sending a link instead of
scheduling a demo. Starting from an idea, not just a design, is what tools
that need a design to exist can't do. It's also the only row that doesn't care
what state their Figma is in.

**What we build:** a sandbox non-engineers can't break (mocked services,
Codespaces or equivalent, mock tooling where feasible, branch previews so a
prototype has a URL), the prototyping skill for each entry point, and a real
curriculum, since non-engineers need teaching, not a handover. The acceptance
bar: a designer or PM runs the whole workflow with nobody from Bitovi in the
room.

**Qualifying questions:**
- Can a designer or PM run the application, not just an engineer? Ask first;
  this is where the offering lives or dies.
- Is there a mocked backend, or does every prototype need live services?
- Where do designs live, and where do requirements live?
- Designers only, or designers and PMs? This changes the skill count.
- Can a prototype be shared as a URL, or is everything behind a VPN?

**Disqualifying:** no path to a non-engineer running the app, or no design and
product audience that actually wants this.

## 05. AI writes requirements and tickets from your designs

**For:** product and engineers. **Typical length:** 4 to 5 weeks.
**Skill here:** `write-tickets`.

An agent reads designs (or a product doc, or just an idea) and cross-checks
them against what the codebase can already do. The work comes back as
tickets in the team's format, broken up, with every requirement marked new,
modify, or already done, and the implementation gotchas called out. Needs
nothing set up first, and gets sharper as the other rows land.

**Qualifying questions:**
- Can they show three tickets they consider well written? If nothing is
  written down, we're authoring a standard, not learning one.
- Which tracker, and is there a usable MCP for it? Jira and Notion yes; Azure
  DevOps is dicier.
- What context can we actually reach: the repo, tracker history, PRDs,
  designs?
- Will their engineers accept agent-written tickets? Product buying it isn't
  enough: get engineering sign-off before building anything.
- Who estimates today, and what do they send back?

**Disqualifying:** no tracker we can integrate with, or an engineering org that
will reject the output on principle.

## 06. Turn your Figma designs into production quality code

**For:** engineers. **Typical length:** 4 to 5 weeks.
**Skill here:** `design-to-code` (with the `code-*` skills and the
`CLAUDE.md` files).

An agent pulls the design straight out of Figma (or from a prototype) and
writes the code, on their real components, following conventions taken from
their own repo, with the tests their team expects. What comes back reads like
their own engineers wrote it. Same machinery as row 04, different buyer, and a
different bar: a merged pull request, not a convincing prototype.

**What we build:** the context layer (`CLAUDE.md` files, reference
implementations, "what changes together"), a way for the agent to check its
own work (tests, Storybook or equivalent, a visual loop against the design),
the skill itself iterated against real designs, a validation harness, Code
Connect for the components it touches, and training. This row is the
[codebase enablement checklist](codebase-enablement-checklist.md) run for one
buyer's goal.

**Qualifying questions:**
- Can we run the application on day one? The most expensive question on this
  row; ask it first.
- Is there a ticket or spec attached to designs, or just the design? An agent
  working from pixels alone guesses at behavior.
- What framework, and is it one we work in?
- Is there a component library in code, and is it documented?
- Is Code Connect already set up?
- Do pull requests require tests today?
- Who reviews front-end work, and what do they send back?

**Disqualifying:** no component library, a stack we don't work in, or no path
to running the app.

**Start condition:** we don't start until we can run their application.
Environment access is a precondition written into the SOW and verified before
the clock starts.

---

## Off-the-shelf trainings

Every row has a training twin that runs in **this repo** instead of the
client's: a couple of hours, the same content for every client, no prep. Play
with the workflow here, then we do it in yours. It's the cheapest way in the
door. The skills, FAQs and worked examples in this branch are that material.
