import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductCard from './ProductCard';

const product = {
  id: 1,
  name: 'Aero Bottle',
  description: 'Insulated everyday bottle with powder-coated finish.',
  price_cents: 3200,
  in_stock: true,
};

describe('ProductCard', () => {
  it('shows the name, description and a formatted price', () => {
    render(<ProductCard product={product} />);
    expect(screen.getByRole('heading', { name: 'Aero Bottle' })).toBeInTheDocument();
    expect(screen.getByText(product.description)).toBeInTheDocument();
    expect(screen.getByText('$32.00')).toBeInTheDocument();
  });

  it('adds the product to the cart', async () => {
    const user = userEvent.setup();
    const onAddToCart = vi.fn();
    render(<ProductCard product={product} onAddToCart={onAddToCart} />);
    await user.click(screen.getByRole('button', { name: 'Add to cart' }));
    expect(onAddToCart).toHaveBeenCalledWith(product);
  });

  it('replaces the button with an out-of-stock badge when unavailable', () => {
    render(<ProductCard product={{ ...product, in_stock: false }} />);
    expect(screen.queryByRole('button', { name: 'Add to cart' })).not.toBeInTheDocument();
    expect(screen.getByText('out of stock')).toBeInTheDocument();
  });

  it('confirms a recent add with the success variant', () => {
    render(<ProductCard product={product} isRecentlyAdded />);
    expect(screen.getByRole('button', { name: 'Added' })).toHaveClass('button--success');
  });
});
