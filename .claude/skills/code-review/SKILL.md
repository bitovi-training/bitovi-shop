---
name: code-review
description: Self-review a code change in this repo before calling it done, the way a reviewer here would. Use after implementing anything, as the last step of design-to-code, or when asked to review a diff, branch or pull request. Reports blocking issues separately from suggestions.
---

# Reviewing a change

Review the diff (`git diff`, or `git diff <base>...HEAD` for a branch, where `<base>` is
the branch it started from: `ai-enablement` in this repo) as the
reviewer who'd approve or reject this PR. Fix what's blocking before you
report done; list the rest.

## First, the automated checks

Run the list in the root `CLAUDE.md` ("Before you report work complete"). A
failing check is blocking, and anything a check already catches isn't worth a
review comment.

## Blocking: a reviewer here would send it back

- **A raw value where a token exists:** a hex color, a pixel spacing, a font
  size not from the type scale.
- **A lookalike:** new markup or CSS that recreates an existing component
  instead of using it.
- **Out-of-sync siblings:** a component's props or variants changed but its
  `.figma.ts`, `.states.jsx`, mock or tests didn't.
- **A changed API response shape or schema** slipped into UI work.
- **Missing states:** a page or component that fetches but doesn't handle
  loading, error or empty.
- **Accessibility basics:** a clickable `div`, an input with no associated
  label, an icon-only button with no `aria-label`, a `<button>` without
  `type`.
- **A broken design rule:** check `list_rules` (design-rules MCP) for the
  components in the change; an approved `must` rule broken is blocking.
- **Unrelated changes:** reformatting, renames or cleanup the task didn't ask
  for.
- **Untested behavior:** new logic or a new state with no test.

## Worth considering

Naming, a simpler approach, a `should` design rule, a reference
implementation that would have fit better, copy that doesn't match the design.

## Output

```markdown
## Blocking
- `CartPage.jsx:42`: hard-coded `#F5532D`; use `var(--color-accent)`.

## Worth considering
- `SuggestionsRow` could reuse the `home-products` layout class.

## Outside this diff
- `OrdersPage` has the same missing empty state (not touched here).
```

Say "nothing blocking" plainly when that's true. Don't pad the list.
