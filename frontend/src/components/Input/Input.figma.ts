// url=https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop?node-id=8-39
// source=frontend/src/components/Input/Input.jsx
// component=Input
// Figma name: "Text Field"
import figma from 'figma'

const instance = figma.selectedInstance

const showLabel = instance.getBoolean('Show Label')
const label = showLabel ? instance.getString('Label') : undefined
const value = instance.getString('Value')
const placeholder = instance.getString('Placeholder')
// The design only ever uses the Search icon in this field.
const iconVariant = instance.getBoolean('Show Icon') ? 'search' : undefined

export default {
  example: figma.code`<Input${figma.helpers.react.renderProp('label', label)}${figma.helpers.react.renderProp('value', value)}${figma.helpers.react.renderProp('placeholder', placeholder)}${figma.helpers.react.renderProp('iconVariant', iconVariant)} />`,
  imports: ['import Input from "components/Input/Input"'],
  id: 'input',
  metadata: { nestable: false },
}
