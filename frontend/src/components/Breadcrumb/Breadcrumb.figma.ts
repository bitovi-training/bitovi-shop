// url=https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop?node-id=9-155
// source=frontend/src/components/Breadcrumb/Breadcrumb.jsx
// component=Breadcrumb
// Note: The Figma component has no variant properties (Breadcrumbs has fixed text layers
// for Page 1/2/3). The items array is shown as a static representative example.
import figma from 'figma'

export default {
  example: figma.code`<Breadcrumb
  items={[
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Current Page' },
  ]}
/>`,
  imports: ['import Breadcrumb from "components/Breadcrumb/Breadcrumb"'],
  id: 'breadcrumb',
  metadata: { nestable: false },
}
