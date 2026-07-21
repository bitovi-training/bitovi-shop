// url=https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop?node-id=8-39
// source=frontend/src/components/Input/Input.jsx
// component=Input
// Figma name: "Text Field"
import figma from 'figma'

const instance = figma.selectedInstance

const label = instance.getString('Label')
const placeholder = instance.getString('Placeholder')
// The Figma design only uses the Search icon variant; iconVariant is omitted when Show Icon is false.
const showIcon = instance.getBoolean('Show Icon')
const iconProp = showIcon ? figma.helpers.react.renderProp('iconVariant', 'search') : null

export default {
  example: figma.code`<Input${figma.helpers.react.renderProp('label', label)}${figma.helpers.react.renderProp('placeholder', placeholder)}${iconProp} />`,
  imports: ['import Input from "components/Input/Input"'],
  id: 'input',
  metadata: { nestable: false },
}
