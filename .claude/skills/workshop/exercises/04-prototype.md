# 4. Prototype it

**Time:** 8 minutes. **Skill:** `prototype-in-code`. **Menu row:** 04,
"Anyone can build a working prototype, not just engineers."
**Short version:** skip the spec review and accept the first draft.

## Set the scene

> The product manager likes the design, but wants to click it and send it
> to the head of support before anyone writes a ticket.

**What it teaches:** a prototype made from the real components, not a
lookalike. The design from exercise 3 is real Figma instances, so Code
Connect tells the agent exactly which code component each piece is. This is
the payoff for the quality floor.

## Setup

None. Have the node link to the frame they made in exercise 3 handy (the
agent knows it from earlier in the conversation).

## Hand them the prompt

```
Prototype the empty Orders design we just made, as a mock.
```

**Point out:**

- **It writes a short spec first** (`prototypes/<name>/prototype.md`): what
  it is, what's real and what's faked, open questions. Have them read it
  and say OK. Changing a paragraph is cheaper than changing a prototype.
- **Mock, not app.** The question is "how does it look and where do clicks
  go," so it composes the generated component mocks: real markup and CSS
  rendered from the actual React components, no build step. The FAQ's
  decision tree says when it would build inside the app instead.
- **Open what it built:** the bundled `prototypes/<name>/<name>.html` in a
  browser. It's one file: email it, drop it in Slack, works offline.
- **Inspect an element:** every component root carries
  `data-component="Button" data-variant="accent"`. That's how a prototype
  can go back to the canvas with real instances: the trip works in both
  directions.
- **Small real findings, if they show up.** In the dry run the "Start
  shopping" button navigates, so it was built as a link styled like a
  button, which is what the Button usage docs say to do. And Figma's
  `Spacing/LG` (24px) has no CSS token, so the prototype had to pick
  another value. That's the open `spacing-from-scale` rule: design and code
  disagree about the scale, and somebody has to decide.
- **Sharing a live URL:** in a Codespace, `npm run prototype:share` makes the
  app public and prints a link. Locally it just explains. On a client
  engagement, per-branch preview environments do the same job.

## Debrief

Row 04 is the only row that doesn't care what state their Figma is in: it
can start from an idea, a ticket or a design. The make-or-break question on
a client engagement is whether a designer or PM can run the app at all; ask
it on the first call.

## Reset

`workshop.mjs reset 4` removes prototypes created during the workshop.

## Needs from earlier exercises

The design from exercise 3. If they skipped it, use a sentence instead:
"Prototype an empty state for the Orders page, as a mock."
