import { describe, expect, it } from 'vitest';
import { PricingSummary } from './PricingSummary.js';

describe('PricingSummary', () => {
  it('calculates tax and total from subtotal and tax rate', () => {
    const summary = new PricingSummary({ subtotalCents: 1000, taxRate: 0.08 });

    expect(summary.taxCents).toBe(80);
    expect(summary.totalCents).toBe(1080);
    expect(summary.subtotal).toBe(10);
    expect(summary.tax).toBe(0.8);
    expect(summary.total).toBe(10.8);
  });

  it('uses explicit taxCents and totalCents when provided', () => {
    const summary = new PricingSummary({
      subtotalCents: 1000,
      taxRate: 0.08,
      taxCents: 50,
      totalCents: 1050,
    });

    expect(summary.taxCents).toBe(50);
    expect(summary.totalCents).toBe(1050);
  });
});
