export class PricingSummary {
  constructor({ subtotalCents = 0, taxRate = 0, taxCents = null, totalCents = null } = {}) {
    this.subtotalCents = subtotalCents;
    this.taxRate = taxRate;
    this.taxCents = taxCents === null ? Math.round(subtotalCents * taxRate) : taxCents;
    this.totalCents = totalCents === null ? subtotalCents + this.taxCents : totalCents;
  }

  get subtotal() {
    return this.subtotalCents / 100;
  }

  get tax() {
    return this.taxCents / 100;
  }

  get total() {
    return this.totalCents / 100;
  }

  toJSON() {
    return {
      subtotalCents: this.subtotalCents,
      subtotal: this.subtotal,
      taxRate: this.taxRate,
      taxCents: this.taxCents,
      tax: this.tax,
      totalCents: this.totalCents,
      total: this.total,
    };
  }
}