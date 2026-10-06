// States for the generated mock (npm run mocks:build). Like a story: what's worth seeing.
import Button, { BUTTON_VARIANTS } from './Button';

export default Object.entries(BUTTON_VARIANTS).flatMap(([key, variant]) => [
  { name: key.toLowerCase(), variant, render: () => <Button variant={variant}>Add to cart</Button> },
  { name: `${key.toLowerCase()} disabled`, variant, render: () => <Button variant={variant} disabled>Add to cart</Button> },
]);
