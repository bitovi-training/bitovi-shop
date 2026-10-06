---
name: code-commit
description: Branch, commit and open pull requests the way this repo does. Use when committing work, writing a commit message, creating a branch, or opening a PR - including at the end of design-to-code. Always offers rather than commits on its own.
---

# Committing

## Ask first

Never commit, push or open a PR on your own initiative. When the work is done
and the checks pass, **offer**:

> All checks pass. Want me to commit? Two options for the message:
>
> 1. `Suggest products when the cart is empty`
> 2. `Add a suggestions row to the empty cart`

Give two candidate messages and let the person pick or rewrite one. Commit
only the files the change touched (`git add <paths>`, not `git add -A`), and
check `git status` for anything unexpected first.

## Commit messages

Match the existing history (`git log --oneline`):

- **Imperative, sentence case, no full stop:** "Add the design rules store",
  "Give the review sole ownership of annotations"
- **Under about 60 characters** for the subject. Say what changed for the
  user or the codebase, not which files.
- **No prefixes** (`feat:`, `[UI]`), no ticket key in the subject.
- **A body when the why isn't obvious:** a blank line, then a few sentences on
  why. Put the ticket link there.
- One logical change per commit. If the work did two things, offer two
  commits.

## Branches

- Feature work: a short kebab-case name for the outcome, e.g.
  `empty-cart-suggestions`. Include the ticket key if there is one:
  `fd-12-empty-cart-suggestions`.
- Prototypes: `prototype/<name>` (see `prototype-in-code`). Never merged.

## Pull requests

Only when asked. Push the branch, then `gh pr create` with:

- the commit subject as the title
- a body with what changed and why, a link to the Figma frame or ticket, a
  screenshot of the result, and how it was verified (which checks ran)
