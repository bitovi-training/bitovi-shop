# Prototype in code: FAQ

Background for anyone learning this workflow, and the reference the agent
uses to decide between a mock and the real app. The skill itself is in
`SKILL.md`.

## What does this do, in one breath?

Anyone on the team, starting from an idea, a Figma design or a ticket, works
with an agent to get a prototype they can click and send to a stakeholder.
Either a lightweight HTML mock built from generated copies of the real
components, or the real app running with fake data. Sending a link replaces
scheduling a demo.

That's row 04 on the Design-to-Code menu, "Anyone can build a working
prototype, not just engineers," and the one clients have bought most.

## How is this different from design to code (row 06)?

Same machinery, different buyer and a different bar. A prototype has to be
**convincing**: a stakeholder looks at it and understands the idea. Production
code has to be **mergeable**: tests, conventions, a reviewer who would approve
the PR. Prototypes live on throwaway branches or in `prototypes/` and are
never merged. When one earns its place, row 06 builds it properly, using the
prototype as the reference.

## What's a "mock" here?

A static HTML version of a component, generated from its real code. In this
repo every shared component has a `<Name>.states.jsx` (like a Storybook story:
the states worth seeing) and a generated `<Name>.mock.html` next to it:

```
frontend/src/components/Button/
  Button.jsx           the component
  Button.css           its styles
  Button.figma.ts      how it maps to Figma (Code Connect)
  Button.states.jsx    which states to show
  Button.mock.html     what it looks like as plain HTML (generated)
```

A prototype in mock mode is composed by copying markup out of those files and
changing the text. Nothing is hand-drawn, so it looks exactly like the app,
because it *is* the app's markup and CSS.

## Why generate mocks instead of letting the agent write HTML?

Because an agent writing its own version of a component drifts. It gets the
padding slightly wrong, invents a hover state, forgets the disabled style,
and you're back to lookalikes, just in HTML instead of Figma. Generating
mocks from the real code with a script makes them deterministic: same code
in, same HTML out. Re-running the script produces no diff unless a component
actually changed, and `mocks:check` in CI catches the case where someone
changes a component and forgets to regenerate.

## Why both mocks and the real app?

Because they answer different questions.

- A **mock** answers "what would this look like, and where does the click
  go?" without the app's runtime: no backend, no auth, no build, no data.
  Fast to make, opens anywhere, one file you can email.
- The **app** answers "does this actually work?" Real components with their
  real behavior, real routing, fake data.

Mocks are the fast path when they're feasible. The app is the default
fallback, and it always works, because it's just developing the way a
developer would.

---

## Should this be a mock or the app?

Work down the list. The first "app" answer wins.

1. **Is the question about behavior?** Data that changes as you use it,
   multi-step flows that carry state, validation, search or filtering that
   has to actually filter, anything where "does it work" is the point.
   → **app**
2. **Is the mock tooling set up in this repo?** (`npm run mocks:build` exists,
   or `CLAUDE.md` says mocks are set up.) If not → **app**, or run setup mode
   first if mocks would pay off here.
3. **Does every piece exist as a component mock,** or is it simple layout
   around them? If it needs a component that doesn't exist yet, can that be
   expressed as layout plus existing pieces? If it needs real new UI → **app**
   (or design it on the canvas first).
4. **Does the behavior it needs fit the free and cheap layers** (below)?
   Native controls, links, swapping between states the mocks already show, a
   few lines of vanilla JS? If it needs more → **app**.
5. Otherwise → **mock**.

Write the answer and the reason in the prototype's spec. **If you find
yourself rebuilding logic in a mock, you picked the wrong mode.**

---

## How much behavior does a mock have?

Think of it in layers, from free to never.

**Free: anything the platform does natively.** A real `<select>` opens, an
`<input>` takes typing, links navigate, `<details>` expands, `:hover` and
`:focus` styles work, and CSS transitions and animations defined in the
stylesheet play. If a component is built on native elements, its mock
behaves correctly with no extra work. In this repo, Select wraps a native
`<select>`, so it opens and selects in a mock. The toast's enter animation
is CSS, so it plays.

**Cheap: states, not behavior.** A custom dropdown built with React state
doesn't survive being rendered to static HTML: you get it in whatever state
it rendered in. So the states file shows **each state** (closed and open,
empty and filled), and a composed mock swaps between them with a couple of
lines of vanilla JS. The mock shows what the open dropdown looks like without
reimplementing how it opens. Same for modals, tabs, accordions, toasts.

**Cheap: navigation.** Links between mock pages. Worth doing, since "where
does the click go" is half of what a mock is for.

**End state only: JavaScript-driven animation.** Framer Motion, GSAP and
anything animated in JS render as their final frame. Note in the spec that
it animates. If the motion itself is what's being prototyped, use the app.

**A few lines, at most: glue.** Showing a toast, bumping a counter, toggling
a class. The worked example's whole script is about ten lines.

**Never: business logic.** Pricing, validation rules, filtering, permissions.
Use literal values. The moment a mock needs real logic, it has become a
worse copy of the app.

---

## Does this work for every kind of codebase?

The **strategy** carries over to any stack: derive a lightweight version of
each component from the real code with a script, keep it deterministic, and
compose prototypes from those pieces. The **mechanism** depends entirely on
where the visual truth lives, and for some stacks the honest answer is "not
worth it, use the app."

The question to answer first, on any engagement: **where does the visual
truth live, and can we render it outside the app cheaply?**

| The codebase | How the visual truth is stored | How to derive mocks | Verdict |
| --- | --- | --- | --- |
| React/Vue/Svelte with plain CSS or CSS modules (this repo) | Component markup plus `.css` files | Render each state server-side (Vite SSR here), collect the CSS each component imports | Easiest case. Build it. |
| Has **Storybook** | Stories already enumerate every state | Render the stories to HTML (render each story with `renderToStaticMarkup`), or point at the built Storybook | Easy, and the states files already exist. Build it. |
| **Tailwind** | Utility classes plus `tailwind.config` | Render markup as above; mocks load Tailwind's CDN with the project's config | Easy. Build it. |
| **CSS-in-JS** (styled-components, Emotion) | Styles exist only at runtime | Server-render with style extraction, or run Storybook/the app and capture DOM plus computed styles with Playwright | Doable, more moving parts. Build it if prototyping is frequent. |
| **Server templates** (Razor, Rails, Django, PHP) | Templates plus CSS, rendered on the server | Render each template partial with a sample model; the output is already HTML | Usually easy, if partials can render without the full app. |
| **Web components / design-system packages** | A published package | Load the package's built bundle in the mock page | Easy if the package has a standalone build. |
| **Native: SwiftUI, Flutter, Jetpack Compose** | Native views, no HTML | HTML doesn't carry over. The native equivalent is the platform's preview tooling with fake data (Xcode Previews, Flutter's Widgetbook, Compose previews) | Skip HTML mocks. Use app mode in a preview harness, or the canvas (row 01) for "what would it look like." |
| **Anything else that's hard to run outside the app** | Tangled with app state, auth, or a backend | Not worth fighting | App mode with fixtures. |

**Don't translate native components into HTML by hand** to make mocks work.
It's the drift problem at its worst: two implementations of every component,
maintained by nobody.

## When is a mock kit worth building on an engagement?

When designers and PMs will prototype often, and running the app is heavy
(a long build, auth, a backend that needs data, a VPN). Then a mock that
opens as one file is a real speedup, and it's what lets non-engineers
prototype without an engineer setting up their environment.

When the app already runs in a click (Codespaces with fixtures, a preview
deploy per branch), app mode may be all a team needs. The mock kit is an
optimization, not a requirement. Sell it that way.

## How do you share a prototype at a public URL?

This is a big part of the offering, not a detail. The menu's promise is "send
a link instead of scheduling a demo," and a prototype that only runs on the
designer's laptop doesn't change how a team works. **Ideally the URL comes
from the branch:** push `prototype/<name>`, get a link, send it.

**Mocks** are the easy case: the bundled file (`npm run mocks:bundle`) opens
anywhere. Attach it, drop it in Slack, or put it on any static host (GitHub
Pages, an S3 bucket, an internal file server).

**App mode has two strategies.**

### 1. A GitHub Codespace (works in this repo today)

The repo has a devcontainer, so any branch opens in a codespace with the app
already running (`npm start` runs on attach and ports 5173 and 3001 are
forwarded).

```sh
git push -u origin prototype/<name>
gh codespace create -R bitovi-training/bitovi-shop -b prototype/<name>
# inside the codespace:
npm run prototype:share
```

`prototype:share` makes the frontend port public and prints a URL like
`https://<codespace-name>-5173.app.github.dev/`. Outside a codespace it prints
these steps instead. Things to know:

- **It only works while the codespace is running.** Codespaces stop after an
  idle timeout (30 minutes by default, configurable per user and org). Fine
  for a demo or a review afternoon; not a link to leave in a ticket for a
  month.
- **Public ports may be disabled by org policy.** Then use "Private to
  Organization" visibility, which works for anyone signed in to GitHub in the
  org, which is often exactly the audience anyway.
- **It costs compute hours** on whoever owns the codespace.
- **Vite's host check** can refuse the forwarded `*.app.github.dev` domain, so
  `frontend/vite.config.js` allows it (`server.allowedHosts`). Any Vite repo
  shared this way needs the same line.

Best for: this repo, trainings, and client engagements in the first weeks,
before anything else exists.

### 2. A preview environment per branch (the client-side answer)

The engineering department sets up preview deploys: every branch or pull
request gets its own environment and URL, usually something like
`prototype-wishlist.preview.client.com`. Vercel, Netlify, AWS Amplify and
Render do this out of the box; teams with their own CI can do it with a
deploy job per branch.

- **App-mode prototypes are unusually easy to preview-deploy,** because they
  run on fixture data. If the prototype doesn't need the backend, the
  preview can be a static frontend build, with no database, secrets or
  backend environment to stand up per branch. That's another reason app mode
  never touches the backend.
- **The URL has to be easy to get.** Most platforms post it as a comment on
  the pull request or as a GitHub deployment status. The agent can read it
  with `gh pr view <branch> --json comments` or
  `gh api repos/<owner>/<repo>/deployments`, so "push and send me the link"
  is one request.
- **Decide who can see it.** Public, behind the company's SSO, or behind a
  password. Previews of unreleased features shouldn't be indexable, and
  fixtures must never contain real customer data.
- **This is the client's infrastructure.** Setting it up belongs to their
  engineering team, with our advice. On an engagement it's part of the
  "sandbox and mocks" phase, and a precondition worth naming early: without
  a URL per branch, non-engineers can build prototypes but can't share them.

Best for: any client that will prototype regularly. It's the version that
lasts: the link works next week, and anyone can open it.

## Why does app mode never touch the backend?

Because the menu's promise to non-engineers is an environment nobody can
break. A prototype that changes the API, the schema or a shared component
can break something real, and needs an engineer to undo. Fake data lives in
a fixtures file next to the prototype. If the prototype only works with a
backend change, that's an open question for the spec, and a strong hint it's
heading for row 06.

## Can a design move between the canvas and code, in both directions?

Yes. Code Connect is the bridge: it already knows which Figma component is
which code component, so moving a design across is translation, not
redrawing. This skill reads a Figma frame through Code Connect to build a
prototype from the same components the designer used. Going the other way,
`design-on-canvas` rebuilds a prototype in Figma with real instances by
reading the `data-component` stamps `mocks:build` puts on every piece (keep
them when you copy markup). The full explanation, including why a page
capture isn't a design, is in `design-on-canvas/FAQ.md`.

## What happens after a prototype?

- It gets shown, argued about and either dropped or kept. Most should be
  dropped; that's the point of making them cheap.
- A kept prototype feeds **row 05** (write tickets): the agent reads it and
  breaks it into tickets checked against what the code already does.
- Or **row 06** (`design-to-code`) builds the production version, with the
  prototype as the reference for intent.
- Or the design team picks it up: `design-on-canvas` rebuilds it in Figma
  with real component instances (see the round-trip answer above).

## What does a client need for this?

- **For app mode:** an app we can run, on a sandbox nobody can break, with a
  way to fake data. This is the precondition the menu writes into the SOW.
- **For mocks:** a codebase where the visual truth can be rendered outside
  the app (see the table above), and a component library worth composing
  from.

## Good things to try in this repo

- Open `prototypes/empty-cart-suggestions/empty-cart-suggestions.html` and
  click Add to cart.
- "Prototype the Order Confirmation page from Figma" (a Figma frame as input,
  mapped through Code Connect)
- "Prototype a wishlist page" (likely mock: it's existing components in a
  new layout)
- "Prototype a promo code field at checkout that actually applies a
  discount" (should choose app: it needs real behavior)
- Change a color in `Button.css`, run `npm run mocks:check` and watch it
  fail, then `npm run mocks:build`.
