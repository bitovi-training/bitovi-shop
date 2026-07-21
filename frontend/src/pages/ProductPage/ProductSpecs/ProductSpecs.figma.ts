// url=https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop?node-id=16-245
// source=frontend/src/pages/ProductPage/ProductSpecs/ProductSpecs.jsx
// component=ProductSpecs
// Figma name: "Product Specs/Default"
import figma from 'figma'

const instance = figma.selectedInstance

const width = instance.getString('Width')
const height = instance.getString('Height')
const depth = instance.getString('Depth')
const weight = instance.getString('Weight')
const delivery = instance.getString('Delivery')

export default {
  example: figma.code`<ProductSpecs
  specs={[
    { label: 'Width', value: '${width}' },
    { label: 'Height', value: '${height}' },
    { label: 'Depth', value: '${depth}' },
    { label: 'Weight', value: '${weight}' },
    { label: 'Delivery', value: '${delivery}' },
  ]}
/>`,
  imports: ['import ProductSpecs from "pages/ProductPage/ProductSpecs/ProductSpecs"'],
  id: 'product-specs',
  metadata: { nestable: false },
}
