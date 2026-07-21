// url=https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop?node-id=9-244
// source=frontend/src/components/Select/Select.jsx
// component=Select
// Figma name: "Select Field"
// Note: The Figma component's "Variant" property (Closed/Open/Icon) reflects UI state,
// not a code prop. Only "Label" maps meaningfully to code.
import figma from 'figma'

const instance = figma.selectedInstance

const label = instance.getString('Label')

export default {
  example: figma.code`<Select${figma.helpers.react.renderProp('label', label)} options={[]} />`,
  imports: ['import Select from "components/Select/Select"'],
  id: 'select',
  metadata: { nestable: false },
}
