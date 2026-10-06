// States for the generated mock (npm run mocks:build). Like a story: what's worth seeing.
import Input from './Input';

export default [
  { name: 'empty', render: () => <Input label="Name" placeholder="Your name" /> },
  { name: 'filled', render: () => <Input label="Email" defaultValue="bob@example.com" /> },
  { name: 'with icon', render: () => <Input label="Search" iconVariant="search" placeholder="Search products" /> },
  { name: 'disabled', render: () => <Input label="Name" defaultValue="Bob" disabled /> },
];
