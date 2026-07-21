// url=https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop?node-id=9-167
// source=frontend/src/components/Logo/Logo.jsx
// component=Logo
import figma from 'figma'

const instance = figma.selectedInstance

const variant = instance.getEnum('Variant', {
  Light: 'light',
  Dark: 'dark',
})

export default {
  example: figma.code`<Logo${figma.helpers.react.renderProp('variant', variant)} />`,
  imports: ['import Logo, { LOGO_VARIANTS } from "components/Logo/Logo"'],
  id: 'logo',
  metadata: { nestable: true },
}
