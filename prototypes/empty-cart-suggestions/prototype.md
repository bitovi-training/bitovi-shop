# Prototype: empty cart suggestions

**Mode:** mock
**Open it:** `empty-cart-suggestions.html` (one file, works offline, send it to anyone)
**Source:** `index.html`, composed from the generated component mocks

## What it is

When the cart is empty, show a "You might also like" row of four products
under the existing empty message, so the page sends people somewhere instead
of being a dead end.

## Why mock, not app

The question is "what would this look like, and does it read well?", not
"does it work." Everything on the page is an existing component (Header,
Button, Product Card, the Added to Cart toast), all of which have generated
mocks, so nothing needs inventing.

## What's real and what's faked

| Real (from the component mocks) | Faked |
| --- | --- |
| Header, Button, Product Card, toast markup and CSS | The four products are hard-coded |
| The out-of-stock state on Mono Lamp | Product images (served by the backend, so the placeholder shows) |
| The toast's enter animation (it's CSS, so it comes free) | Add to cart: it bumps the header count and shows the toast, nothing more |
| | Which products get suggested (no recommendation logic) |

## Open questions

- **Which products?** Best sellers, recently viewed, or editorial picks. This
  is a product decision, not a design one.
- **Accent buttons.** Four Add to cart buttons on one screen conflicts with
  the approved `accent-single-action` rule. The Home page does the same
  thing, so this probably needs a rule exception for repeated per-item
  actions rather than a design change.
- **Should "Go to shop" stay** now that there are products right below it?
