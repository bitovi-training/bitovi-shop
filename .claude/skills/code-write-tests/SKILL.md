---
name: code-write-tests
description: How to write and run tests in this codebase (Vitest and React Testing Library). Use when adding or changing a component, page or logic and it needs tests, when asked to write tests, or when a test fails and needs fixing.
---

# Writing tests

`npm test` runs Vitest in jsdom with React Testing Library and the jest-dom
matchers (`toBeInTheDocument`, `toHaveClass`, `toBeDisabled`...). `globals` is
on, so `describe`, `it`, `expect` and `vi` need no import. Watch mode:
`npm run test:watch`.

## Where tests go

Next to the code they test: `Button/Button.test.jsx` beside `Button.jsx`.
Config is the `test` block in `frontend/vite.config.js`; setup is
`frontend/src/test/setup.js`.

## Copy these

| For | Copy |
| --- | --- |
| Variants and fallback | `components/Badge/Badge.test.jsx` (one `it.each` over the variants map) |
| Clicks, disabled state | `components/Button/Button.test.jsx` |
| Typing, labels, focus | `components/Input/Input.test.jsx` |
| A page-level component with data | `pages/HomePage/ProductCard/ProductCard.test.jsx` |

## How to write them

- **Test what a user sees and does,** not implementation details. Query by
  role and accessible name first (`getByRole('button', { name: 'Add to cart' })`),
  then label (`getByLabelText`), then text. Avoid class-name queries, except
  to check a variant class, which is the component's real output.
- **Interactions:** create a user per test with `const user = userEvent.setup()`
  and `await user.click(...)` / `await user.type(...)`.
- **Callbacks:** `vi.fn()` and `toHaveBeenCalledWith(...)`.
- **Cover the states,** not just the happy path: empty, disabled, error,
  out-of-stock, unknown variant falling back. A design often shows only one
  state; the tests are where the others get pinned down.
- **Pages that fetch:** stub `fetch` with `vi.stubGlobal('fetch', vi.fn(...))`
  returning `{ ok: true, json: async () => ({ ok: true, ... }) }`, and use
  `findBy...` queries to wait for the data.
- **One behavior per `it`,** named as a sentence: "replaces the button with an
  out-of-stock badge when unavailable."

## When a test fails

Read the failure before changing anything. If the code is wrong, fix the code.
If the test encoded old behavior that was deliberately changed, update the test
and say so. Never delete or skip a failing test to get to green.

## What's not covered here

There's no end-to-end suite. Whole-page visual checks use Playwright through
its MCP server (screenshot and compare against Figma), not tests.
