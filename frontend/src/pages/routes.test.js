import { describe, expect, it } from 'vitest';
import { ROUTES, getProductPath, parseRoute } from './routes.js';

describe('routes', () => {
  it('parses static routes and query params', () => {
    const route = parseRoute('/order-confirmation?order=ABC123');

    expect(route.route).toBe('orderConfirmation');
    expect(route.path).toBe(ROUTES.ORDER_CONFIRMATION);
    expect(route.params.orderNumber).toBe('ABC123');
    expect(route.found).toBe(true);
  });

  it('parses product routes and decodes product id', () => {
    const route = parseRoute('/products/fancy%20lamp');

    expect(route.route).toBe('product');
    expect(route.params.productId).toBe('fancy lamp');
    expect(route.found).toBe(true);
  });

  it('normalizes trailing slashes', () => {
    const route = parseRoute('/cart/');

    expect(route.path).toBe('/cart');
    expect(route.route).toBe('cart');
    expect(route.found).toBe(true);
  });

  it('returns notFound for unknown routes', () => {
    const route = parseRoute('/does-not-exist');

    expect(route.route).toBe('notFound');
    expect(route.found).toBe(false);
  });

  it('builds a product path with URL encoding', () => {
    expect(getProductPath('fancy lamp')).toBe('/products/fancy%20lamp');
  });
});
