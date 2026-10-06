// url=https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop?node-id=9-82
// source=frontend/src/components/Icon/Icon.jsx
// component=Icon
import figma from 'figma'

const instance = figma.selectedInstance

const variant = instance.getEnum('Variant', {
  'Cart': 'cart',
  'Check': 'check',
  'Chevron Down': 'chevron-down',
  'Chevron Left': 'chevron-left',
  'Chevron Right': 'chevron-right',
  'Chevron Up': 'chevron-up',
  'Close': 'close',
  'Credit Card': 'credit-card',
  'Filter': 'filter',
  'Home': 'home',
  'Info': 'info',
  'Receipt': 'receipt',
  'Search': 'search',
  'Sort': 'sort',
  'Trash': 'trash',
  'Truck': 'truck',
})

export default {
  example: figma.code`<Icon${figma.helpers.react.renderProp('variant', variant)} />`,
  imports: ['import Icon, { ICON_VARIANTS } from "components/Icon/Icon"'],
  id: 'icon',
  metadata: { nestable: true },
}
