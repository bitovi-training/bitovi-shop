---
name: code-build-component
description: How to build or change a UI component or page in this codebase so it matches the existing code. Use whenever writing or modifying a React component, a page, a route, or their CSS - including as a step in design-to-code or prototype-in-code. Covers where code goes, which files to copy, and what has to change together.
---

# Building a component or page

The conventions live in the `CLAUDE.md` files next to the code. **Read the
one for where you're working first**:

- shared components: `frontend/src/components/CLAUDE.md`
- pages and page-only components: `frontend/src/pages/CLAUDE.md`
- anything touching the API: `backend/CLAUDE.md`

This skill is the procedure; those files are the rules.

## 1. Find what already exists

Before writing anything:

- **Is there a component for this?** Look in `frontend/src/components/`, and
  if you started from a Figma design, `get_code_connect_map` on its nodes tells
  you exactly which component each piece is. Use it, with the right variant,
  rather than building a lookalike.
- **Is there one almost like it?** Prefer a new variant on an existing
  component over a new component. Adding a variant means updating its
  `*_VARIANTS` map, CSS, `.figma.ts`, `.states.jsx` and tests together.
- **Where does it go?** Used by one page: under that page. Used by more than
  one: `components/`.

## 2. Copy the closest reference

Pick the reference the folder's `CLAUDE.md` names (`Badge` or `Button` for
variants, `Input` for form fields, `OrdersPage` for a page) and follow its
shape: signature, class names, how it handles `className`, how it falls back.
Matching the existing code beats any pattern you'd pick from scratch.

## 3. Write it

- Styles: BEM-style classes, tokens only (`var(--space-md)`, never `16px`;
  `var(--color-accent)`, never a hex).
- Markup: native elements first (`<button type="button">`, `<label htmlFor>`,
  `<select>`), so keyboard and screen-reader behavior come for free.
- Data: shared components take props; pages fetch, following the page
  `CLAUDE.md` (`ok` check, loading, error and empty states).
- Text: the exact copy from the design or ticket. Don't invent labels.

## 4. Keep the siblings in sync

For a shared component (or a page-level one that has them):

| You changed | Also update |
| --- | --- |
| Props or variants | `<Name>.figma.ts`, `<Name>.states.jsx`, tests |
| Anything visual | run `npm run mocks:build` |
| A new component | all of the above, plus `docs/components/<Name>.md` |
| A new page | `routes.js` and `App.jsx` (see `pages/CLAUDE.md`) |

Then write or update tests with the `code-write-tests` skill.

## 5. Look at it

Run the app (`npm start`) and screenshot the result with Playwright. If it came
from a Figma design, compare against the frame (`get_screenshot`) and fix
differences in spacing, type and color. "It compiles" is not "it's right."
