// States for the generated mock (npm run mocks:build). Like a story: what's worth seeing.
import Toast from './Toast';
import AddedToCartToast from './toasts/AddedToCartToast/AddedToCartToast';

export default [
  { name: 'plain', render: () => <Toast>Saved.</Toast> },
  { name: 'added to cart', component: 'AddedToCartToast', render: () => <AddedToCartToast productName="Sunset Mug" /> },
];
