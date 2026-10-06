// States for the generated mock (npm run mocks:build). Like a story: what's worth seeing.
// Select wraps a native <select>, so opening it works in the mock with no extra code.
import Select from './Select';

const options = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
];

export default [
  { name: 'placeholder', render: () => <Select label="Sort by" options={options} placeholder="Choose one" /> },
  { name: 'selected', render: () => <Select label="Sort by" options={options} defaultValue="price-asc" /> },
  { name: 'with icon', render: () => <Select label="Sort by" iconVariant="filter" options={options} defaultValue="featured" /> },
];
