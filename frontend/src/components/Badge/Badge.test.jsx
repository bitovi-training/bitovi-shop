import { render, screen } from '@testing-library/react';
import Badge, { BADGE_VARIANTS } from './Badge';

describe('Badge', () => {
  it.each(Object.values(BADGE_VARIANTS))('renders the %s variant', (variant) => {
    render(<Badge variant={variant}>label</Badge>);
    expect(screen.getByText('label')).toHaveClass('badge', `badge--${variant}`);
  });

  it('falls back to the default variant for an unknown value', () => {
    render(<Badge variant="nope">label</Badge>);
    expect(screen.getByText('label')).toHaveClass('badge--default');
  });
});
