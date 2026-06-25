import { describe, expect, it } from 'vitest';
import { Cart } from './Cart.js';
import { CartItem } from './CartItem.js';

describe('Cart', () => {
  it('creates cart items from plain object input', () => {
    const cart = new Cart({
      items: [
        {
          productId: 1,
          productName: 'Desk',
          unitPriceCents: 10000,
          quantity: 1,
        },
      ],
    });

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]).toBeInstanceOf(CartItem);
  });

  it('merges quantities cumulatively when the same product is added multiple times', () => {
    const cart = new Cart({
      items: [
        {
          productId: 1,
          productName: 'Desk',
          unitPriceCents: 10000,
          quantity: 1,
        },
      ],
    });

    cart.addItem({
      productId: 1,
      productName: 'Desk',
      unitPriceCents: 10000,
      quantity: 2,
    });

    cart.addItem({
      productId: 1,
      productName: 'Desk',
      unitPriceCents: 10000,
      quantity: 1,
    });

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(4);
    expect(cart.itemCount).toBe(4);
  });

  it('calculates subtotal and pricing summary', () => {
    const cart = new Cart({
      items: [
        {
          productId: 1,
          productName: 'Desk',
          unitPriceCents: 10000,
          quantity: 1,
        },
        {
          productId: 2,
          productName: 'Lamp',
          unitPriceCents: 2500,
          quantity: 2,
        },
      ],
    });

    expect(cart.subtotalCents).toBe(15000);
    expect(cart.subtotal).toBe(150);

    const pricingSummary = cart.getPricingSummary(0.1);
    expect(pricingSummary.taxCents).toBe(1500);
    expect(pricingSummary.totalCents).toBe(16500);
  });
});
