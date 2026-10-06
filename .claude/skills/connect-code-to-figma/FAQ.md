# Connect code to Figma: FAQ

Background for anyone learning this workflow, and for the agent when someone
asks how it works. The skill itself is in `SKILL.md`.

## What is Code Connect, in one breath?

A mapping file per component that tells Figma "this library component is
that code component, and here is how its properties turn into props." Figma
shows the result in Dev Mode and returns it through the Figma MCP.

## Does the mapping have to be perfect, compilable code?

No, and this is the most important thing to understand about it. Code Connect
is a way of turning a Figma design into text an agent can use as context. The
templates are flexible strings: JSX, HTML, SwiftUI, Razor, or plain
instructions to the agent. Compilable output is ideal, but the real test is
whether an agent reading the snippet picks the right component, passes the
right props and imports it from the right place.

That changes how you spend time on an engagement. Get every component to
"good enough context" before polishing any one of them to perfect fidelity.
And have the conversation with the client's engineer early about what format
the templates use and how strict they need to be, because that decision gets
made once and every mapping follows it.

## Why does an agent need it?

Without it, an agent reading a Figma design sees rectangles, text and auto
layout, and writes a component that looks right. With it, the Figma MCP says
"this is `<Button variant="primary">` from `components/Button`," and the agent
reuses the real thing. It is the difference between generated code and code
that lives in the design system.

That is why it sits under every other workflow on the Design-to-Code menu.
Designing on the canvas, reviewing designs, prototyping, tickets and
production code all need to know what already exists on both sides.

## What does the client actually get?

On the "Connect your design system to your code" offering: mappings across
their library, plus the audit report (what exists on one side only, where
the two sides have drifted, and what we would do about each). Closing the
gaps is a follow-on, priced off the report.

On every other offering that crosses between design and code, Code Connect
is included for the components that workflow touches, plus the check in CI.

## Why the check script? It seems small.

Because the menu's standard is that we sell workflows that outlive us. A
mapping nobody maintains goes stale silently, and nothing in Dev Mode tells
you it is wrong. A failing build is the cheapest way to make maintenance
happen without someone remembering a chore.

## Template format vs. the old format

Code Connect used to parse your actual React (or SwiftUI, or Compose) code
with a language-specific parser, which meant it only worked for supported
languages and broke on anything unusual.

The template format (the `.figma.ts` files here) is plain TypeScript that
builds the snippet with `figma.code` template strings. Any language can go
inside the string, so the same approach works for React, Razor, Vue, web
components or anything else. That matters for clients on stacks the old
parsers never supported. Sitecore's C# Razor views are a good example.

## What about components that take a data object?

Page-level composites like `ProductCard` take a `product` object instead of
individual props, while the Figma component exposes Name, Price, Show Out of
Stock and so on. The mapping renders the Figma values as that object
(`product={{ name: "Aero Bottle", price_cents: 3200, in_stock: false }}`), so
whatever the designer set in Figma still reaches the agent. Earlier versions
of these mappings used a static `product={product}` snippet, which was valid
code but threw away everything the design said.

## The Figma variant names have typos. Should the agent fix them?

No. The mapping matches Figma exactly, typos included, and a comment notes
them. Renaming a variant in Figma is a library change that ripples into every
file using it, so it is the design team's call. The audit can list them as a
finding.

## What does a client need to have?

- A Figma **Organization or Enterprise** plan. Code Connect is not on lower
  plans.
- Someone who is a **member** of that organization (not a guest) with a
  **Full or Dev seat**, to publish. Guests can't get Code Connect write
  access.
- A component library in Figma and a component library in code. If either is
  missing, there is nothing to connect, and that is a different engagement.

## How do you set it up from scratch?

You walk into a client repo with none of this in place. There are two
separate connections to Figma, and it helps to keep them apart:

**The Figma MCP is how the agent reads Figma.** It's Figma's hosted server
at `https://mcp.figma.com/mcp`, and it logs in with OAuth: the first time
the agent uses it, a browser opens and you sign in. No token. In Claude Code,
either install Figma's plugin (`claude plugin install
figma@claude-plugins-official`, which also brings Figma's own skills) or add
the server with `claude mcp add --transport http figma
https://mcp.figma.com/mcp`. This repo already has it in `.mcp.json`. Setup
for other agents (Copilot, Cursor and so on) is in [Figma's MCP
guide](https://help.figma.com/hc/en-us/articles/35281350665623) and the
[developer docs](https://developers.figma.com/docs/figma-mcp-server/remote-server-installation).

**The Code Connect CLI is how mappings get into Figma.** It lives in the
repo as a dev dependency (`@figma/code-connect`), reads a `figma.config.json`
that says which files are mappings and what language they're in, and pushes
them up with `figma connect publish`. Publishing is the only thing that needs
a **personal access token**, created in Figma under Settings > Security with
the scopes `file_code_connect:write` (under Development) and
`file_content:read` (under Files), and kept in
`.env` as `FIGMA_ACCESS_TOKEN`. It has to be a person's token. Figma's
plan-level tokens don't work for Code Connect.

Then the actual work: agree the template format with an engineer, audit,
map the gaps, add the check, publish. The skill's **setup** mode walks
through all of it in order, including the parts a human has to do.

Figma's own docs: [quickstart](https://developers.figma.com/docs/code-connect/quickstart-guide),
[template files](https://developers.figma.com/docs/code-connect/template-files/).

## What does publishing actually do?

`figma connect publish` uploads every mapping the config matches and prints
each component with the Figma node it attached to. From then on:

- A developer selecting that component in **Dev Mode** sees our snippet in
  the Inspect panel instead of generated code.
- The **Figma MCP** returns the snippet to any agent reading a design that
  uses the component. This is the part that matters most for us.

Mappings live in Figma, not just the repo, so a `.figma.ts` that was never
published does nothing for anyone else. That's why the audit checks
"mapped locally, not published." Publishing again overwrites what's there,
so it's safe to re-run after edits. To remove one mapping, `npx figma
connect unpublish --node=<node url> --label=React`. Without `--node` it
unpublishes everything, which is the one command in this workflow worth
being nervous about.

A real example of why this needs care, from this repo in October 2026: the
mappings had been written against Figma variant names with typos
(`"Accen Disabled"`, `"Erro Disabled"`, `"Priamry Ghost"`). Someone later fixed
the typos in Figma. Nothing errored and nothing in Dev Mode looked broken,
but the MCP started handing agents `<Button>disabled</Button>` for a disabled
accent button, with no variant and no `disabled` prop, and `<Badge>` with no
variant for primary ghost. An audit caught it. That's exactly the kind of
quiet failure audit mode is for.

## How long does it take?

Simple components (a Button, a Badge) take minutes with the skill. The time
goes into components where Figma and code model things differently, which
need a person who knows both sides to decide how they line up. The menu
prices the full-library version at about 100 hours, including the report.

## When would you split this into separate skills?

When the modes start needing different context. Right now setup, map, audit
and check all share the same setup and the same idea (setup is really audit
plus map with a format decision up front), so one skill is easier to teach
and to find. If the audit grows into something with its own
data-gathering and report template, that is the point to pull it out.

## Good things to try in this repo

- `npm run figma:check`, which currently reports `Card` and `Rating` as
  unmapped
- "Map the Rating component to Figma" (map mode, end to end)
- "Audit Code Connect against the Shop file" (audit mode)
- On a fresh branch with the `.figma.ts` files deleted, "Set up Code Connect"
  (setup mode, the closest thing to a real client day one)
