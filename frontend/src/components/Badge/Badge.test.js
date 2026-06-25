import { describe, expect, it } from 'vitest';
import Badge, { BADGE_VARIANTS } from './Badge.jsx';

describe('Badge component', () => {
  it('uses default badge class by default', () => {
    const element = Badge({ children: 'New' });

    expect(element.type).toBe('span');
    expect(element.props.className).toContain('badge--default');
  });

  it('applies the requested badge variant', () => {
    const element = Badge({ children: 'Hot', variant: BADGE_VARIANTS.ACCENT_GHOST });

    expect(element.props.className).toContain('badge--accent-ghost');
  });

  it('falls back to default variant for invalid values', () => {
    const element = Badge({ children: 'Unknown', variant: 'invalid' });

    expect(element.props.className).toContain('badge--default');
  });
});
