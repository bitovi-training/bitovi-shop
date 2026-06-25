import { describe, expect, it } from 'vitest';
import { CartItem } from './CartItem.js';

describe('CartItem', () => {
  it('computes line totals and dollar values', () => {
    const item = new CartItem({
      productId: 1,
      productName: 'Widget',
      unitPriceCents: 1299,
      quantity: 3,
    });

    expect(item.lineTotalCents).toBe(3897);
    expect(item.unitPrice).toBe(12.99);
    expect(item.lineTotal).toBe(38.97);
  });

  it('serializes derived values in toJSON', () => {
    const item = new CartItem({
      productId: 2,
      productName: 'Lamp',
      unitPriceCents: 2500,
      quantity: 2,
      image: '/images/lamp.png',
    });

    expect(item.toJSON()).toEqual({
      productId: 2,
      productName: 'Lamp',
      unitPriceCents: 2500,
      unitPrice: 25,
      quantity: 2,
      image: '/images/lamp.png',
      lineTotalCents: 5000,
      lineTotal: 50,
    });
  });
});
