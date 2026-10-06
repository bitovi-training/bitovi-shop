// url=https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop?node-id=20-823
// source=frontend/src/pages/CartPage/CartItem/CartItem.jsx
// component=CartItem
// Figma name: "Cart Item". Quantity isn't a Figma property, so it uses the code default.
import figma from 'figma'

const instance = figma.selectedInstance

const productName = instance.getString('Name')
const price = instance.getString('Price')
const unitPriceCents = Math.round(parseFloat(String(price).replace(/[^0-9.]/g, '')) * 100) || 0

export default {
  example: figma.code`<CartItem${figma.helpers.react.renderProp('productName', productName)} unitPriceCents={${unitPriceCents}} />`,
  imports: ['import CartItem from "pages/CartPage/CartItem/CartItem"'],
  id: 'cart-item',
  metadata: { nestable: false },
}
