---
name: github-issue
description: Provides the technical workflow for creating GitHub issues in this environment. Use this skill whenever the user wants to publish an issue and needs command-line steps, fallback behavior, or troubleshooting for issue creation.
---

## Parameters

- `TITLE`: GitHub issue title. Required. Keep it clear and specific.
- `BODY_TEXT`: Full markdown issue body content. Required unless `BODY_FILE_PATH` is provided.
- `BODY_FILE_PATH`: Path to a markdown file containing the issue body. Optional.

Usage rule:

- You must have a `TITLE` and one of `BODY_TEXT` or `BODY_FILE_PATH`.
- Prefer inline body text with `--body` when `BODY_TEXT` is available.
- Use `--body-file` only when `BODY_FILE_PATH` is already provided.


## Method Priority

1. Use GitHub CLI (`gh`) as the default method.
2. If CLI is unavailable, provide manual user instructions.
3. Only use GitHub API paths when explicitly requested.

## CLI Workflow

1. Confirm explicit user approval to create the issue.
2. Ensure required content exists: `TITLE` and one of `BODY_TEXT` or `BODY_FILE_PATH`.
3. Check tooling:
	- `command -v gh`
	- `gh auth status`
4. Create via CLI:
	- If `BODY_FILE_PATH` exists:
	  `gh issue create --title "<TITLE>" --body-file <BODY_FILE_PATH> [--label <label>]... [--assignee <user>]...`
	- Else use inline body text:
	  `gh issue create --title "<TITLE>" --body "<BODY_TEXT>" [--label <label>]... [--assignee <user>]...`
5. Return issue URL and issue number.

## If GH CLI Is Missing Or Fails

Respond with:

1. A short explanation of what failed.
2. Exact manual steps for the user:
	- Install/auth GitHub CLI, or
	- Open the repo issues page and paste the prepared title/body.
3. A copy-paste command they can run once ready.
4. The final title/body text if needed.

## Guardrails

- Keep responses operational and concise.
- Never create an issue without explicit approval.
- Never block on formatting decisions; this skill handles execution mechanics only.
