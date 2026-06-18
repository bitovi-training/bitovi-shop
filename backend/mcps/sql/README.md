# SQL MCP Server

This MCP server exposes SQL tools backed by the Bitovi Shop backend.

## Tools

- `get_schema`: Reads table/column metadata from the live backend database.
- `execute_sql`: Runs SQL against the same live in-memory database instance the app uses.

## Requirements

- Backend running at `http://127.0.0.1:3001` (or set `TODO_APP_BACKEND_URL`).
- Node.js 18+.

## Run

1. Install dependencies from the project root:
   - `npm install`
2. Start the backend from the project root:
   - `npm run backend`
2. Start the MCP server from the project root:
   - `npm run mcp:sql`

## Configuration

- `TODO_APP_BACKEND_URL` (default: `http://127.0.0.1:3001`)
- `BACKEND_TIMEOUT_MS` (default: `10000`)

## Notes

The MCP server does not open the SQLite file directly. It only calls backend admin routes so all reads and writes target the app's live in-memory database instance.
