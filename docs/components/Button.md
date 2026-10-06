---
component: Button
status: stable
figma_node: 8-3
---

# Button

Triggers an action in the interface. For moving between pages, use a link:
a button that navigates is a button the user cannot middle-click, bookmark
or open in a new tab.

## Variants

**Default** is the workhorse. Secondary actions, anything sitting alongside
a primary action, and any case where nothing about the action is special.

**Primary** marks the recommended path through the view. It is a
recommendation, which is why there is only ever one: a view with three
primary buttons has recommended nothing.

**Accent** is the strongest emphasis available and uses the brand orange.
Reserved for the single most important action on the page, typically a
purchase or a commit step.

**Success** and **Error** report an outcome rather than invite an action.
Error in particular is for destructive confirmation, deleting an order or
emptying a cart. A form that failed validation is not an Error button
situation, it is an inline message situation.

## States

Every variant has a disabled state. A disabled button should be rare: if an
action cannot be taken, it is usually better to explain why than to present
a dead control.

## Accessibility

Button text is the accessible name, so it has to describe the action rather
than the location. "Add to cart" rather than "Click here". Where an icon is
the only content, the button needs an accessible label.
