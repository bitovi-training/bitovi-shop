// url=https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop?node-id=20-878
// source=frontend/src/pages/OrdersPage/OrderCard/OrderCard.jsx
// component=OrderCard
// Note: Order Card has no configurable Figma properties. The `order` prop is a
// data object supplied at runtime.
import figma from 'figma'

export default {
  example: figma.code`<OrderCard order={order} />`,
  imports: ['import OrderCard from "pages/OrdersPage/OrderCard/OrderCard"'],
  id: 'order-card',
  metadata: { nestable: false },
}
