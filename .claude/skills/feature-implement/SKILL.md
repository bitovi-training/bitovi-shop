---
name: feature-implement
description: Implements a GitHub issue by parsing requirements, breaking down work into steps, coding the solution, and creating a linked pull request. Use this skill whenever the user wants to convert a GitHub issue into working code.
---

## Parameters

- `ISSUE_NUMBER`: GitHub issue number to implement. Required.
- `ISSUE_BODY`: Full parsed issue content (problem, acceptance criteria, technical notes, etc.). Required.
- `ISSUE_URL`: Full URL to the GitHub issue. Required for comments and PR linking.
- `AGENT_EMOJI`: Special marker emoji for agent comments (e.g., `🤖`). Optional; defaults to `🤖`.

## High-Level Workflow

1. Fetch and parse the issue to extract acceptance criteria.
2. Leave an initial comment on the issue.
3. Create a feature branch with a derived name.
4. Break work into 3-4 simple TODO steps internally using the TaskCreate/TaskList/TaskUpdate tools.
5. Implement the simplest version that satisfies criteria.
6. Create and link a pull request.
7. Leave a final comment with PR link.

## Step 1: Get Issue Details

Use GitHub CLI or API to fetch the issue:

- `gh issue view <ISSUE_NUMBER> --json body,title,number,url`

Parse the output to extract:
- acceptance criteria
- technical notes
- any constraints or dependencies

## Step 2: Initial Progress Comment

Leave a comment on the issue using:

- `gh issue comment <ISSUE_NUMBER> --body "<AGENT_EMOJI> Starting implementation. Breaking down work now..."`

Format the comment with the agent emoji so humans can distinguish agent comments.

## Step 3: Create Feature Branch

Derive a short, kebab-case branch name from the issue title. Prefix with `feat-` and append the issue number.

Examples:
- Issue #12 "Add star ratings to product page" → `feat/star-ratings-12`
- Issue #7 "Search bar filter for homepage" → `feat/search-bar-filter-7`

Create and switch to the branch:

- `git checkout -b feat/<slugified-title>-<ISSUE_NUMBER>`

Keep the slug short (2-4 words max, lowercase, hyphens only).

## Step 4: Break Down Work

Create 3-4 simple TODOs only using the TaskCreate/TaskList/TaskUpdate tools. Do not write code yet. Be sure to use the built in tools for task management instead of free-form text to ensure the tasks are tracked properly.:

- [ ] Implement core logic
- [ ] Test happy path
- [ ] Create PR

Keep it minimal for demo speed.

## Step 5: Implement

Code the simplest version that meets acceptance criteria.

No extensive testing, edge cases, or optimization for demo.

Optional: leave one mid-point comment if significant progress:

## Step 6: Quick Check (Optional)

If desired, invoke `code-review` skill for a light review.

Otherwise, skip and go straight to PR.

## Step 7: Create Pull Request

Use the `pr-template.md` to structure the PR body, then create via GitHub CLI:

- `gh pr create --title "[#<ISSUE_NUMBER>] <title>" --body-file pr-template.md --draft`
- Or omit `--draft` if ready for review.

Capture the PR URL and number.

## Step 8: Link PR Back to Issue

Leave a final comment on the issue with the PR link:

- `gh issue comment <ISSUE_NUMBER> --body "<AGENT_EMOJI> Implementation complete. PR: <PR_URL>"`

## Guardrails

- Keep implementation minimal and fast for demo.
- Use agent emoji on initial and final comments.
- Do not merge the PR; user handles final review.
- Prioritize speed over perfection.
