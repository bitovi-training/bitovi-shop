# Bitovi Shop

Bitovi Shop is a simple ecommerce demo with:

- Product catalog
- Product detail page
- Cart (add/remove, no quantities yet)
- Fake checkout flow (name and email)
- Confirmation page

The architecture remains the same:

- React + Vite frontend
- Express backend
- `sql.js` database persisted to `backend/database/shop.db`

## Prerequisites

Node.js 24 or newer and npm 10 or newer.

## Setup

1. Run `npm install`
2. Run `npm start`
3. Open `http://localhost:5173`

## API Endpoints

### Storefront

- `GET /api/products`
- `GET /api/products/featured`
- `GET /api/products/:id`
- `GET /api/cart`
- `POST /api/cart/items`
- `DELETE /api/cart/items/:productId`
- `DELETE /api/cart`
- `POST /api/checkout`
- `GET /api/orders`
- `GET /api/orders/:orderNumber`
- `POST /api/upload`

### Admin SQL Harness (for MCP/demo tools)

- `POST /api/admin/products`
- `POST /api/admin/sql`
- `GET /api/admin/schema`

Detailed request/response schemas and error codes live in [backend/README.md](backend/README.md).

## Scripts

- `npm start` runs the backend and frontend together
- `npm run backend` runs the API server on `http://127.0.0.1:3001`
- `npm run frontend` runs the Vite app on `http://localhost:5173`
- `npm run build` builds the frontend bundle
- `npm run mcp:sql` runs the SQL MCP server
- `npm run mcp:shop` runs the shop MCP server

## MCP Servers

- The SQL MCP server exposes schema inspection and raw SQL against the live app backend.
- The shop MCP server exposes route-backed app actions like listing products, mutating the cart, checking out, listing orders, creating products, and uploading images.
- Both MCP servers require the backend to be running first.

## Styling System

- Global design tokens are defined as CSS variables in `frontend/src/styles.css`.
- The token set covers color, typography, spacing, radii, and page-width primitives used throughout the app.
- Shared UI building blocks live in `frontend/src/components`, including `Button`, `Card`, `Badge`, `Input`, `Select`, `Rating`, and `Logo`.
- Page and component styles are organized as plain CSS files colocated with their React components under `frontend/src/components` and `frontend/src/pages`.
- Layout is standardized through shared wrappers like `PageTemplate`, while individual components consume the same CSS variable palette for consistent styling.

## Notes

- Cart state is managed through the backend cart API and persisted in the SQLite snapshot.
- Product catalog and orders persist via the backend SQLite snapshot file.
- If an older `backend/database/todos.db` file exists, the app copies it forward into `backend/database/shop.db` on startup.
- Checkout is intentionally simplified for demo use.