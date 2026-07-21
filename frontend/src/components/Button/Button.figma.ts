// url=https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop?node-id=8-3
// source=frontend/src/components/Button/Button.jsx
// component=Button
import figma from 'figma'

const instance = figma.selectedInstance

// The Figma Button encodes both variant and disabled state in one "Variant" property.
// Two getEnum calls split it into the two separate code props.
// Note: Figma has typos — "Accen Disabled" and "Erro Disabled" are intentional here.
const variant = instance.getEnum('Variant', {
  'Default': 'default',
  'Default Disabled': 'default',
  'Primary': 'primary',
  'Primary Disabled': 'primary',
  'Accent': 'accent',
  'Accen Disabled': 'accent',
  'Success': 'success',
  'Success Disabled': 'success',
  'Error': 'error',
  'Erro Disabled': 'error',
})

const disabled = instance.getEnum('Variant', {
  'Default': false,
  'Default Disabled': true,
  'Primary': false,
  'Primary Disabled': true,
  'Accent': false,
  'Accen Disabled': true,
  'Success': false,
  'Success Disabled': true,
  'Error': false,
  'Erro Disabled': true,
})

const textNode = instance.findText('Text')
const label = 'textContent' in textNode ? textNode.textContent : 'Button'

export default {
  example: figma.code`<Button${figma.helpers.react.renderProp('variant', variant)}${figma.helpers.react.renderProp('disabled', disabled)}>${label}</Button>`,
  imports: ['import Button, { BUTTON_VARIANTS } from "components/Button/Button"'],
  id: 'button',
  metadata: { nestable: true },
}
