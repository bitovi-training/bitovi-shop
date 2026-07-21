// url=https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop?node-id=20-914
// source=frontend/src/pages/PageTemplate/Header/Header.jsx
// component=Header
// Note: Header has no configurable Figma properties. currentPath controls the
// active nav link and cartCount drives the cart badge.
import figma from 'figma'

export default {
  example: figma.code`<Header currentPath="/" cartCount={0} />`,
  imports: ['import Header from "pages/PageTemplate/Header/Header"'],
  id: 'header',
  metadata: { nestable: false },
}
