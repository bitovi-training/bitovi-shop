// url=https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop?node-id=7-36
// source=frontend/src/components/Badge/Badge.jsx
// component=Badge
import figma from 'figma'

const instance = figma.selectedInstance

// Note: Figma has typos in two variant names — "Priamry Ghost" and "Succes Ghost".
const variant = instance.getEnum('Variant', {
  'Default': 'default',
  'Default Ghost': 'default-ghost',
  'Primary': 'primary',
  'Priamry Ghost': 'primary-ghost',
  'Accent': 'accent',
  'Accent Ghost': 'accent-ghost',
  'Success': 'success',
  'Succes Ghost': 'success-ghost',
  'Error': 'error',
  'Error Ghost': 'error-ghost',
})

const textNode = instance.findText('Text')
const label = 'textContent' in textNode ? textNode.textContent : 'Label'

export default {
  example: figma.code`<Badge${figma.helpers.react.renderProp('variant', variant)}>${label}</Badge>`,
  imports: ['import Badge, { BADGE_VARIANTS } from "components/Badge/Badge"'],
  id: 'badge',
  metadata: { nestable: true },
}
