## Scope

Include only guidance that is invisible to code: human preferences, historical baggage, negative constraints, and decision rationale.

## Project context and constraints

### Environment and purpose
- This codebase is used for workshop demos.
- Prefer as few external dependencies as possible. If practical, build a small local implementation instead of adding a package.
- The app is primarily run in GitHub Codespaces, often with forwarded ports for the frontend and backend.
- All branches should stay aligned with `main` as the baseline and be kept up to date with mainline history.
- The database is automatically cleared/reset when servers restart to keep demo runs reproducible.
- The app is intended to be used with both Claude Code and GitHub Copilot.

### Workflow expectations
- Primary workflows should remain runnable from the repo root scripts with minimal setup steps.
- A clean start experience (`npm install` then `npm start`) is treated as a core quality bar for this repo.
- Demo behavior should stay deterministic and easy to reset between runs.

## Scoped context files
- Backend rules: `backend/CLAUDE.md`
- Frontend rules: `frontend/CLAUDE.md`
- Shared rules: `shared/CLAUDE.md`
