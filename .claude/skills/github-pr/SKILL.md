---
name: github-pr
description: Provides the technical workflow for creating GitHub pull requests in this environment. Use this skill whenever the user wants to publish a PR and needs command-line steps, fallback behavior, or troubleshooting for PR creation.
---

## Parameters

- `TITLE`: Pull request title. Required. Keep it clear and specific.
- `ISSUE_NUMBER`: GitHub issue number to link and close (e.g., `#42`). Optional but recommended to link work.
- `BODY_TEXT`: Full markdown PR body content. Optional.
- `BODY_FILE_PATH`: Path to a markdown file containing the PR body. Optional.

Usage rule:

- You must have a `TITLE`.
- Optionally include `ISSUE_NUMBER` to link the PR to an issue (e.g., "Closes #42").
- Prefer inline body text with `--body` when `BODY_TEXT` is available.
- Use `--body-file` only when `BODY_FILE_PATH` is already provided.


## Method Priority

1. Use GitHub CLI (`gh`) as the default method.
2. If CLI is unavailable, provide manual user instructions.
3. Only use GitHub API paths when explicitly requested.

## CLI Workflow

1. Confirm explicit user approval to create the PR.
2. Ensure required content exists: `TITLE` and optionally `ISSUE_NUMBER`.
3. Check tooling:
	- `command -v gh`
	- `gh auth status`
4. Create via CLI:
	- If `ISSUE_NUMBER` is provided and you have a body:
	  `gh pr create --title "<TITLE>" --body "<BODY_TEXT or file>" --issue <ISSUE_NUMBER>`
	- Else:
	  `gh pr create --title "<TITLE>" --body "<BODY_TEXT or file>"`
	- Optionally add `--draft` if not ready for review, or omit for ready-to-review.
5. Return PR URL and PR number.

## If GH CLI Is Missing Or Fails

Respond with:

1. A short explanation of what failed.
2. Exact manual steps for the user:
	- Install/auth GitHub CLI, or
	- Open the repo pull requests page and paste the prepared title/body.
3. A copy-paste command they can run once ready.
4. The final title/body text if needed.

## Guardrails

- Keep responses operational and concise.
- Never create a PR without explicit approval.
- Never block on formatting decisions; this skill handles execution mechanics only.
