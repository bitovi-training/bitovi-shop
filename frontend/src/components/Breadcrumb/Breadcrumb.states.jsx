// States for the generated mock (npm run mocks:build). Like a story: what's worth seeing.
import Breadcrumb from './Breadcrumb';

export default [
  {
    name: 'two levels',
    render: () => <Breadcrumb items={[{ label: 'Home', href: '#/' }, { label: 'Mono Lamp' }]} />,
  },
  {
    name: 'three levels',
    render: () => (
      <Breadcrumb items={[{ label: 'Home', href: '#/' }, { label: 'Cart', href: '#/cart' }, { label: 'Order Confirmation' }]} />
    ),
  },
];
