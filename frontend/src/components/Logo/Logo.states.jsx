// States for the generated mock (npm run mocks:build). Like a story: what's worth seeing.
import Logo, { LOGO_VARIANTS } from './Logo';

export default [
  { name: 'light', variant: 'light', background: 'var(--color-primary)', render: () => <Logo variant={LOGO_VARIANTS.LIGHT} /> },
  { name: 'dark', variant: 'dark', render: () => <Logo variant={LOGO_VARIANTS.DARK} /> },
];
