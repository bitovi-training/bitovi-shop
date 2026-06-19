## Backend context and constraints

### Runtime and data lifecycle
- The backend defaults to host 127.0.0.1 in this repo; if host binding changes, re-check admin route expectations.
- Database reset behavior is intentional here. Do not "fix" it by making demo state persistent unless requested.
- Admin SQL endpoints exist for tooling and workshops. Disable them only when intentionally testing a locked-down mode.

### Integration contracts
- MCP tools depend on backend HTTP routes, not direct SQLite file access. Route behavior is the integration contract.
- If route names or payload shapes change, update frontend and MCP clients in the same change.
- Product images are expected to work as data URIs in API payloads and storage.

### API and money conventions
- Keep the common response envelope stable (`ok` plus error codes) because tooling depends on it.
- Keep money values in cents through DB and API layers, and convert to display units only at presentation time.
