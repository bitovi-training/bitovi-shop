# Shop MCP Server

This MCP server exposes the main storefront and admin app actions by calling the existing backend HTTP routes.

## Tools

- `get_products`
- `get_featured_product`
- `get_product`
- `get_cart`
- `add_cart_item`
- `remove_cart_item`
- `clear_cart`
- `checkout`
- `get_orders`
- `get_order`
- `create_product`
- `upload_image`

## Requirements

- Backend running at `http://127.0.0.1:3001` (or set `TODO_APP_BACKEND_URL`).
- Node.js 18+.

## Run

1. Install dependencies from the project root.
2. Start the backend with `npm run backend`.
3. Start the MCP server with `npm run mcp:shop`.

## Configuration

- `TODO_APP_BACKEND_URL` default: `http://127.0.0.1:3001`
- `BACKEND_TIMEOUT_MS` default: `10000`

## Notes

The MCP server uses the same live backend routes as the frontend, so cart mutations, checkout, orders, and product creation all operate on the running app state.

Checkout requires `customerName` and `customerEmail` only.