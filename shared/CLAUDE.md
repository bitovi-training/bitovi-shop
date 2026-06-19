## Shared context and constraints

### Role of shared
- shared/ acts as a contract boundary between frontend and backend, not a frontend-only utility folder.

### Modeling and data rules
- Changes in shared models should preserve compatibility expectations for both runtime surfaces.
- Shared modules should stay framework-agnostic so they remain importable from both sides.
- Currency fields should stay in cents-based representations in shared models and data.
- Seed data in shared/data should remain stable and predictable for repeatable demos and tests.

### Change coordination
- Naming changes in shared contracts should be treated as coordinated changes across frontend, backend, and MCP tooling.
- Avoid duplicate domain definitions outside shared/ when an existing shared model already captures that shape.
