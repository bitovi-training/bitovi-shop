// url=https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop?node-id=9-244
// source=frontend/src/components/Select/Select.jsx
// component=Select
// Figma name: "Select Field"
// The Figma "Variant" mixes two things: open/closed state (UI only, no prop)
// and whether the Filter icon shows. Only the icon reaches code.
import figma from 'figma'

const instance = figma.selectedInstance

const label = instance.getString('Label')
const value = instance.getString('Value')
const iconVariant = instance.getEnum('Variant', {
  Closed: undefined,
  Open: 'filter',
  Icon: 'filter',
})

export default {
  example: figma.code`<Select${figma.helpers.react.renderProp('label', label)}${figma.helpers.react.renderProp('value', value)}${figma.helpers.react.renderProp('iconVariant', iconVariant)} options={options} />`,
  imports: ['import Select from "components/Select/Select"'],
  id: 'select',
  metadata: { nestable: false },
}
