# Pages

One folder per page, plus the components only that page uses.

```
OrdersPage/
  OrdersPage.jsx
  OrdersPage.css
  OrderCard/            used only by OrdersPage, so it lives here
    OrderCard.jsx
    OrderCard.css
    OrderCard.figma.ts
```

When a page-level component starts being used by a second page, move it to
`../components/` and update its imports, Code Connect file and mock.

## Copy this

`OrdersPage/OrdersPage.jsx` is the reference page: it wraps its content in
`PageTemplate`, loads data with `fetch`, and handles loading, error and empty
states.

## Adding a page: what changes together

1. `pages/<Name>Page/<Name>Page.jsx` and `.css`
2. `routes.js`: add the path to `ROUTES` and to `STATIC_ROUTE_MAP` (or a pattern
   like `PRODUCT_ROUTE_PATTERN` for a route with a parameter)
3. `../App.jsx`: add a `case` for the route name in the page switch
4. `PageTemplate/Header/Header.jsx`: only if it needs a nav link
5. Tests for any new logic, in `<Name>Page.test.jsx`

## Conventions

- **Every page renders inside `PageTemplate`** with `currentPath` and
  `cartCount`. Pass `title` for a plain H1, or render your own H1 as
  `CartPage` does. One H1 per page.
- **Data loading:** `fetch('/api/...')`, then check `response.ok && payload.ok`,
  and read the error from `payload.error.message`. Keep `isLoading`, `error`
  and the data in `useState`. Use `useLiveRefresh` (`../hooks/useLiveRefresh.js`)
  when the page should refresh as data changes.
- **Design every state:** loading, error and empty, not just the full state.
  `CartPage` has the empty-cart pattern.
- **Links** use hash routes: `` href={`#${getProductPath(id)}`} ``, never a bare
  path.
- **Prices** are integer cents in data and formatted for display as `$32.00`
  (see `formatPrice` in `HomePage/ProductCard/ProductCard.jsx`).
