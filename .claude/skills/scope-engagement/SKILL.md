---
name: scope-engagement
description: Scope a design-to-code AI enablement engagement from whatever the client has said - a call transcript, an email, proposal text, or a one-line ask. Maps it to the Design-to-Code menu rows, works out which foundations it needs, lists the qualifying questions still open, and drafts phases, deliverables, preconditions and risks. Use when someone pastes client or proposal text, asks what an engagement would involve, what to propose, or how to scope or price-out work for a Figma, design system, prototyping, ticketing or design-to-code client.
---

# Scoping an engagement

Someone pastes in what a client said, or the start of a proposal, and wants
to know what the work is. Turn it into a scope a Bitovi consultant could put
in front of the client, grounded in what this repo shows.

Read these first; they're the source material:

- `docs/ai-enablement/design-to-code-menu.md`: the six offerings, what each
  builds, typical length, qualifying questions and disqualifiers
- `docs/ai-enablement/scoping-an-engagement.md`: the method (symptoms to rows,
  foundations, questions, scope shape)
- `docs/ai-enablement/codebase-enablement-checklist.md`: how delivery works
  underneath

## 1. Read what they gave you

Pull out, in the client's own words: what's hurting, who's feeling it
(designers, PMs, engineers, leadership), what they already have (Figma plan,
design system, component library, tracker, agent tooling, tests), and any
constraint (deadline, budget signal, security, VPN, a stack).

## 2. Map it to the menu

Use the symptom table in the scoping guide. Name each row in scope and why,
in a sentence that quotes their words back. Say which rows you considered
and ruled out, and why. Most asks touch two or three rows.

## 3. Work out the foundations

For each row, what does it stand on, and do they have it? Code Connect,
written design rules, an app an agent or designer can run, a context layer.
Missing foundations become the first phases. Sequence foundation first.

## 4. Separate known from unknown

From the menu's qualifying questions for each row in scope:

- **Answered:** with the evidence from what they said
- **Open:** the questions for the next call, most expensive first ("can we run
  your application?" before anything else on rows 04 and 06)
- **Disqualifiers:** flag any that look true, plainly. Better now than in
  week three.

## 5. Draft the scope

Per the scoping guide: outcome, phases, concrete deliverables, client
preconditions, acceptance ("their team runs it without us"), out of scope,
risks. Typical lengths are in the menu; say they're typical, not quoted.
**Leave prices out** unless the person asks, and if they do, say the current
numbers come from the practice, not this public repo.

## 6. Show how it would look

Point at the skill in this repo that demonstrates each row, and suggest a
live demo for the next call ("we can show your designers a prototype built
and shared in a few minutes"). If they want, run it.

## Output

In chat, in this order:

1. **The ask, in one paragraph**
2. **Rows in scope** (and ruled out), with the reason for each
3. **Foundations needed**
4. **Answered / open questions / disqualifiers**
5. **Draft scope** per row: phases, deliverables, preconditions, acceptance,
   out of scope, risks
6. **Suggested next step** (a question list for the next call, a demo)

Say "I think" where it's a read rather than something the client said.

## Never

- **Save client material in this repo.** It's public. No transcripts,
  names, proposal text or pricing in files here. Keep the output in chat, or
  write it to a private location the person names.
- Promise a row whose foundation they don't have without making the
  foundation part of the scope.
- Present a typical duration as a quote.
