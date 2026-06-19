---
name: feature-review
description: Quick acceptance criteria check of a diff or implementation. Given acceptance criteria, verify the code satisfies them at a high level. Use this skill whenever you need to review code against acceptance criteria.
---

## Review

Given acceptance criteria, check the diff/implementation:

1. Does the code satisfy the acceptance criteria? Yes/no + brief note.
2. Any obvious bugs that would block it? List if found.
3. Does it build/run without errors?

That's it. Quick check only.

## Output Format

Short review summary:

**Blockers** (must fix):
- Any issues that break acceptance criteria or cause build failures.

**Clear to ship**: yes/no.

## Guardrails

- This is a quick review, not a deep code audit.
- Flag only critical blockers.
- Do not nitpick or require perfection.
