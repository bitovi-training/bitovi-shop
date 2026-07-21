// url=https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop?node-id=20-823
// source=frontend/src/pages/CartPage/CartItem/CartItem.jsx
// component=CartItem
import figma from 'figma'

const instance = figma.selectedInstance

const productName = instance.getString('Name')

export default {
  example: figma.code`<CartItem${figma.helpers.react.renderProp('productName', productName)} unitPriceCents={1999} quantity={1} />`,
  imports: ['import CartItem from "pages/CartPage/CartItem/CartItem"'],
  id: 'cart-item',
  metadata: { nestable: false },
}
