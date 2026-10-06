// States for the generated mock (npm run mocks:build). Like a story: what's worth seeing.
import Header from './Header';

export default [
  { name: 'empty cart', render: () => <Header currentPath="/" cartCount={0} /> },
  { name: 'items in cart', render: () => <Header currentPath="/cart" cartCount={3} /> },
];
