# Backend

Express API on port 3001, mounted under `/api` in `index.js`. SQLite through
`sql.js`; the database lives in memory and persists to `database/shop.db`.

## Where things go

- **Routes:** `routes/<resource>.js`, an `express.Router()` registered in
  `index.js` (`app.use('/api/<resource>', router)`). `routes/products.js` is the
  reference.
- **Data access:** functions in `database/db.js`, exported from the block at the
  bottom of the file. Routes call these; routes never run SQL themselves.
- **Schema and seed data:** the `CREATE TABLE` statements in `database/db.js`,
  seeded from `shared/data/`.

## Response shape (never change it)

```js
res.json({ ok: true, products });                     // success: ok plus named data
res.status(404).json({ ok: false, error: { message, code } });   // failure
```

Every route wraps its body in `try`/`catch` and returns a 500 with
`{ ok: false, error: { message, code } }` on an unexpected error. Codes are
UPPER_SNAKE_CASE (`PRODUCTS_FETCH_ERROR`). The frontend depends on `ok` and
`error.message`, so new routes follow the same shape.

## Watch out for

- **List and detail endpoints return different fields.** `GET /api/products`
  (`getAllProducts`) has no reviews or ratings; only `GET /api/products/:id`
  (`getProductById`) does. A design that shows ratings on a product list needs
  a backend change first.
- **Prices are integer cents** (`price_cents`). Never store or return dollars.
- **Admin SQL routes** (`routes/admin.js`) are on by default; set
  `ENABLE_ADMIN_SQL=false` to turn them off.
- A schema change is its own piece of work: discuss it, don't slip it into a UI
  change.
