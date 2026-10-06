// url=https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop?node-id=9-155
// source=frontend/src/components/Breadcrumb/Breadcrumb.jsx
// component=Breadcrumb
// Figma name: "Breadcrumbs". Labels come from the three text layers.
// Routes aren't in Figma, so earlier crumbs get a placeholder href.
import figma from 'figma'

const instance = figma.selectedInstance

const text = (layer) => {
  const node = instance.findText(layer)
  return 'textContent' in node ? node.textContent : layer
}

export default {
  example: figma.code`<Breadcrumb
  items={[
    { label: ${JSON.stringify(text('Page 1'))}, href: "#" },
    { label: ${JSON.stringify(text('Page 2'))}, href: "#" },
    { label: ${JSON.stringify(text('Page 3'))} },
  ]}
/>`,
  imports: ['import Breadcrumb from "components/Breadcrumb/Breadcrumb"'],
  id: 'breadcrumb',
  metadata: { nestable: false },
}
