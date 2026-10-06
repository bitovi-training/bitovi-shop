// States for the generated mock (npm run mocks:build). Like a story: what's worth seeing.
// No image_path: product images come from the backend, so mocks show the placeholder.
import ProductCard from './ProductCard';

const product = {
  id: 1,
  name: 'Aero Bottle',
  description: 'Insulated everyday bottle with powder-coated finish.',
  price_cents: 3200,
};

export default [
  { name: 'in stock', render: () => <ProductCard product={{ ...product, in_stock: true }} onAddToCart={() => {}} /> },
  { name: 'out of stock', render: () => <ProductCard product={{ ...product, id: 2, name: 'Day Pack', price_cents: 8900, in_stock: false }} onAddToCart={() => {}} /> },
];
