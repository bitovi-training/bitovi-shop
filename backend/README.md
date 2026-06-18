# Backend API

This backend serves the storefront API for Bitovi Shop.

- Runtime: Node.js + Express
- DB: `sql.js`, persisted to `backend/database/shop.db`
- Base URL (local): `http://127.0.0.1:3001`

## Running The Backend

From the repo root:

```bash
npm run backend
```

If you want to disable admin SQL routes:

```bash
ENABLE_ADMIN_SQL=false npm run backend
```

## API Reference

All endpoints return JSON.

### Response Envelopes

Success envelope:

```json
{
  "ok": true,
  "...": "payload fields"
}
```

Error envelope:

```json
{
  "ok": false,
  "error": {
    "message": "Human readable message",
    "code": "MACHINE_READABLE_CODE"
  }
}
```

### Shared Schemas

`Product`

```json
{
  "id": 1,
  "slug": "aero-bottle",
  "name": "Aero Bottle",
  "description": "...",
  "price_cents": 3200,
  "image_path": "data:image/png;base64,...",
  "available_quantity": 12,
  "in_stock": true,
  "width_cm": 8.5,
  "height_cm": 24,
  "depth_cm": 8.5,
  "weight_kg": 0.48,
  "delivery_window": "2-4 business days",
  "created_at": "2026-06-18T10:00:00.000Z"
}
```

`ProductWithReviews`

```json
{
  "id": 1,
  "slug": "aero-bottle",
  "name": "Aero Bottle",
  "description": "...",
  "price_cents": 3200,
  "image_path": "data:image/png;base64,...",
  "available_quantity": 12,
  "in_stock": true,
  "width_cm": 8.5,
  "height_cm": 24,
  "depth_cm": 8.5,
  "weight_kg": 0.48,
  "delivery_window": "2-4 business days",
  "created_at": "2026-06-18T10:00:00.000Z",
  "reviews": [
    {
      "id": "1-4",
      "author": "Sam",
      "quote": "Great!",
      "stars": 5
    }
  ]
}
```

`Cart`

```json
{
  "id": 1,
  "items": [
    {
      "productId": 1,
      "productName": "Aero Bottle",
      "unitPriceCents": 3200,
      "quantity": 2,
      "image": "data:image/png;base64,...",
      "lineTotalCents": 6400,
      "unitPrice": 32,
      "lineTotal": 64
    }
  ],
  "subtotalCents": 6400,
  "subtotal": 64,
  "taxRate": 0.0825,
  "taxCents": 528,
  "tax": 5.28,
  "totalCents": 6928,
  "total": 69.28,
  "itemCount": 2,
  "createdAt": "2026-06-18T10:00:00.000Z"
}
```

`Order`

```json
{
  "id": 101,
  "order_number": "ORD-1768000000000",
  "customer_name": "John Smith",
  "customer_email": "john@example.com",
  "subtotal_cents": 6400,
  "tax_cents": 528,
  "tax_rate": 0.08,
  "total_cents": 6928,
  "created_at": "2026-06-18T10:10:00.000Z"
}
```

`OrderItem`

```json
{
  "product_id": 1,
  "product_name": "Aero Bottle",
  "unit_price_cents": 3200,
  "quantity": 2
}
```

`OrderReceipt`

```json
{
  "order": {
    "id": 101,
    "order_number": "ORD-1768000000000",
    "customer_name": "John Smith",
    "customer_email": "john@example.com",
    "subtotal_cents": 6400,
    "tax_cents": 528,
    "tax_rate": 0.08,
    "total_cents": 6928,
    "created_at": "2026-06-18T10:10:00.000Z"
  },
  "items": [
    {
      "product_id": 1,
      "product_name": "Aero Bottle",
      "unit_price_cents": 3200,
      "quantity": 2
    }
  ]
}
```

### Storefront Endpoints

#### GET /api/products

- Returns all products.
- Success: `200`

Response body:

```json
{
  "ok": true,
  "products": ["Product", "..."]
}
```

Error codes: `PRODUCTS_FETCH_ERROR`

#### GET /api/products/featured

- Returns featured product from site settings.
- Success: `200`
- Not found: `404`

Response body:

```json
{
  "ok": true,
  "product": "Product"
}
```

Error codes: `FEATURED_PRODUCT_NOT_FOUND`, `FEATURED_PRODUCT_FETCH_ERROR`

#### GET /api/products/:id

- Path params:
  - `id` (positive integer)
- Success: `200`
- Validation: `400`
- Not found: `404`

Response body:

```json
{
  "ok": true,
  "product": "ProductWithReviews"
}
```

Error codes: `INVALID_PRODUCT_ID`, `PRODUCT_NOT_FOUND`, `PRODUCT_FETCH_ERROR`

#### GET /api/cart

- Returns the shared demo cart.
- Success: `200`

Response body:

```json
{
  "ok": true,
  "cart": "Cart"
}
```

Error codes: `CART_READ_ERROR`

#### POST /api/cart/items

- Adds an item to the shared cart.

Request body:

```json
{
  "productId": 1,
  "quantity": 1
}
```

- `productId` required, positive integer.
- `quantity` optional, defaults to `1`, must be positive integer.
- Success: `200`
- Validation: `400`
- Not found: `404`

Response body:

```json
{
  "ok": true,
  "cart": "Cart"
}
```

Error codes: `INVALID_PRODUCT_ID`, `INVALID_QUANTITY`, `PRODUCT_NOT_FOUND`, `INSUFFICIENT_STOCK`, `CART_ADD_ERROR`

#### DELETE /api/cart/items/:productId

- Path params:
  - `productId` (positive integer)
- Success: `200`
- Validation: `400`

Response body:

```json
{
  "ok": true,
  "cart": "Cart"
}
```

Error codes: `INVALID_PRODUCT_ID`, `CART_REMOVE_ERROR`

#### DELETE /api/cart

- Clears all cart items.
- Success: `200`

Response body:

```json
{
  "ok": true,
  "cart": "Cart"
}
```

Error codes: `CART_CLEAR_ERROR`

#### POST /api/checkout

- Creates an order from the current cart.

Request body:

```json
{
  "customerName": "John Smith",
  "customerEmail": "john@example.com"
}
```

- `customerName` required string, min length 2.
- `customerEmail` required string containing `@`.
- Success: `200`
- Validation/business rule failures: `400`
- Not found: `404`

Response body:

```json
{
  "ok": true,
  "receipt": "OrderReceipt"
}
```

Error codes: `INVALID_CUSTOMER_NAME`, `INVALID_CUSTOMER_EMAIL`, `CART_EMPTY`, `INSUFFICIENT_STOCK`, `PRODUCT_NOT_FOUND`, `CHECKOUT_ERROR`

#### GET /api/orders

- Query params:
  - `limit` (optional integer, defaults to 50, max 200)
- Success: `200`

Response body:

```json
{
  "ok": true,
  "orders": ["OrderReceipt", "..."]
}
```

Error codes: `ORDERS_FETCH_ERROR`

#### GET /api/orders/:orderNumber

- Path params:
  - `orderNumber` (required non-empty string)
- Success: `200`
- Validation: `400`
- Not found: `404`

Response body:

```json
{
  "ok": true,
  "receipt": "OrderReceipt"
}
```

Error codes: `INVALID_ORDER_NUMBER`, `ORDER_NOT_FOUND`, `ORDER_FETCH_ERROR`

#### POST /api/upload

- Validates image upload data URI and echoes it back.

Request body:

```json
{
  "imageData": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

- `imageData` required string.
- Must be valid base64 data URI: `data:<mime>;base64,<payload>`
- Allowed mime types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml`
- Max size: 5MB (estimated from base64 payload)
- Success: `200`
- Validation: `400`
- Payload too large: `413`

Response body:

```json
{
  "ok": true,
  "imageData": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

Error codes: `MISSING_IMAGE_DATA`, `INVALID_IMAGE_DATA_TYPE`, `INVALID_DATA_URI_FORMAT`, `INVALID_IMAGE_TYPE`, `IMAGE_TOO_LARGE`, `UPLOAD_ERROR`

### Admin SQL Harness Endpoints (for MCP/demo tools)

- `POST /api/admin/products`
- `POST /api/admin/sql`
- `GET /api/admin/schema`

#### GET /api/admin/schema

- Returns schema summary.
- Success: `200`

Response body:

```json
{
  "ok": true,
  "schema": {
    "tables": [
      {
        "name": "products",
        "columns": [
          { "name": "id", "type": "INTEGER", "notNull": true, "pk": true }
        ],
        "rowCount": 7
      }
    ]
  }
}
```

Error codes: `SCHEMA_FETCH_ERROR`

#### POST /api/admin/products

- Creates a product.

Request body:

```json
{
  "slug": "new-item",
  "name": "New Item",
  "description": "Description",
  "priceCents": 1999,
  "imagePath": "data:image/png;base64,...",
  "availableQuantity": 10,
  "inStock": true,
  "widthCm": 10,
  "heightCm": 12,
  "depthCm": 5,
  "weightKg": 0.4,
  "deliveryWindow": "2-4 business days"
}
```

- Required: `slug`, `name`, `description`, `priceCents`, `imagePath`
- `priceCents` must be non-negative integer
- `availableQuantity` if present must be non-negative integer
- Success: `201`
- Validation: `400`
- Conflict: `409` when slug already exists

Response body:

```json
{
  "ok": true,
  "product": "ProductWithReviews"
}
```

Error codes: `INVALID_PRODUCT_SLUG`, `INVALID_PRODUCT_NAME`, `INVALID_PRODUCT_DESCRIPTION`, `INVALID_PRICE`, `INVALID_IMAGE_PATH`, `INVALID_AVAILABLE_QUANTITY`, `DUPLICATE_SLUG`, `PRODUCT_CREATION_ERROR`

#### POST /api/admin/sql

- Executes arbitrary SQL (demo use only).

Request body:

```json
{
  "sql": "SELECT * FROM products LIMIT 5"
}
```

- `sql` required non-empty string
- Success: `200`
- Validation/execution failure: `400`

Response body:

```json
{
  "ok": true,
  "result": {
    "statementType": "select",
    "rows": [{ "id": 1, "name": "Aero Bottle" }],
    "rowCount": 1,
    "columns": ["id", "name"],
    "persisted": false
  }
}
```

Error codes: `INVALID_SQL`, `SQL_EXECUTION_ERROR`
