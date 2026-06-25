import { describe, expect, it } from 'vitest';
import Button, { BUTTON_VARIANTS } from './Button.jsx';

describe('Button component', () => {
  it('uses default variant class when no variant is provided', () => {
    const element = Button({ children: 'Buy now' });

    expect(element.type).toBe('button');
    expect(element.props.className).toContain('button--default');
    expect(element.props.type).toBe('button');
  });

  it('uses provided variant when it is valid', () => {
    const element = Button({
      children: 'Checkout',
      variant: BUTTON_VARIANTS.PRIMARY,
      className: 'extra',
    });

    expect(element.props.className).toContain('button--primary');
    expect(element.props.className).toContain('extra');
  });

  it('normalizes CMS-provided variant values before applying classes', () => {
    const element = Button({ children: 'Oops', variant: ' Primary ' });

    expect(element.props.className).toContain('button--primary');
  });
});
