import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button, { BUTTON_VARIANTS } from './Button';

describe('Button', () => {
  it('renders its label as an accessible button', () => {
    render(<Button>Add to cart</Button>);
    expect(screen.getByRole('button', { name: 'Add to cart' })).toBeInTheDocument();
  });

  it('applies the variant class', () => {
    render(<Button variant={BUTTON_VARIANTS.ACCENT}>Add to cart</Button>);
    expect(screen.getByRole('button')).toHaveClass('button', 'button--accent');
  });

  it('falls back to the default variant for an unknown value', () => {
    render(<Button variant="sparkly">Add to cart</Button>);
    expect(screen.getByRole('button')).toHaveClass('button--default');
  });

  it('calls onClick, and not when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>Add to cart</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(<Button onClick={onClick} disabled>Add to cart</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('defaults to type="button" so it never submits a form by accident', () => {
    render(<Button>Add to cart</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });
});
