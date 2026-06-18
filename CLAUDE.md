# Claude Instructions For This Repo

## Default Behavior For Feature Work

- Implement the requested feature with the simplest, most straightforward approach.
- Prefer minimal, targeted changes over refactors or architecture changes.
- Do not add extra tooling or dependencies unless the user explicitly asks.
- Specifically: do not install Playwright and do not add Playwright tests unless explicitly requested.
- Do not run test suites, browser automation, or large validation steps unless explicitly requested.
- After implementing, stop and let the user review and run verification themselves.

## When Unsure

- Ask one short clarifying question only if a blocker prevents implementation.
- Otherwise, make a reasonable, simple choice and proceed.

## Scope Discipline

- Only change files needed for the request.
- Avoid unrelated cleanup or stylistic churn.
- Preserve existing patterns and conventions in the codebase.
