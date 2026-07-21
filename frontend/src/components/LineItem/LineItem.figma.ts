// url=https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop?node-id=16-442
// source=frontend/src/components/LineItem/LineItem.jsx
// component=LineItem
// Note: Line Item has no variant properties; text content is read from the
// "Name" and "Price" text layers in the design.
import figma from 'figma'

const instance = figma.selectedInstance

const nameNode = instance.findText('Name')
const label = 'textContent' in nameNode ? nameNode.textContent : 'Label'

const priceNode = instance.findText('Price')
const value = 'textContent' in priceNode ? priceNode.textContent : '$0.00'

export default {
  example: figma.code`<LineItem${figma.helpers.react.renderProp('label', label)}${figma.helpers.react.renderProp('value', value)} />`,
  imports: ['import LineItem from "components/LineItem/LineItem"'],
  id: 'line-item',
  metadata: { nestable: false },
}
