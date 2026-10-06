// States for the generated mock (npm run mocks:build). Like a story: what's worth seeing.
import Badge, { BADGE_VARIANTS } from './Badge';

export default Object.entries(BADGE_VARIANTS).map(([key, variant]) => ({
  name: key.toLowerCase().replace('_', ' '),
  variant,
  render: () => <Badge variant={variant}>{variant.replace('-', ' ')}</Badge>,
}));
