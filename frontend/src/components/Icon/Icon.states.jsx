// States for the generated mock (npm run mocks:build). Like a story: what's worth seeing.
import Icon, { ICON_VARIANTS } from './Icon';

export default Object.values(ICON_VARIANTS).map((variant) => ({
  name: variant,
  variant,
  render: () => <Icon variant={variant} alt={variant} />,
}));
