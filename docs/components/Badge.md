---
component: Badge
status: stable
figma_node: 7-36
---

# Badge

A short, non-interactive label that qualifies something near it: a status,
a count, a category. A badge is never a control. If it can be clicked, it
is a button that looks like a badge, and it should be one.

## Variants

Each of the five colors comes in solid and ghost.

**Solid** variants carry their own background and read clearly on any
surface.

**Ghost** variants are outlined and take their contrast from what sits
behind them. On white they read correctly; on the page background they wash
out and the border effectively disappears.

The color carries meaning and is not a styling choice. Success for
completed or in-stock, Error for failed or unavailable, Accent for a
promotion or something time-limited, Default for a neutral category.

## Placement

A badge that qualifies a title belongs on the same line as the title,
immediately after it. Moved to its own line it stops reading as a property
of the thing above it and starts reading as a separate element.

## Content

One or two words. A badge holding a sentence is a message, not a badge.
