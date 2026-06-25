import { CartItem } from './CartItem.js';
import { PricingSummary } from './PricingSummary.js';

export class Cart {
  constructor({ id = null, items = [], createdAt = new Date() } = {}) {
    this.id = id;
    this.items = items.map((item) => new CartItem(item instanceof CartItem ? item.toJSON() : item));
    this.createdAt = createdAt;
  }

  addItem(item) {
    const cartItem = item instanceof CartItem ? item : new CartItem(item);
    const existingItem = this.items.find((currentItem) => currentItem.productId === cartItem.productId);
    item = cartItem;

    if (existingItem) {
      existingItem.quantity = Math.max(existingItem.quantity, cartItem.quantity);
      return existingItem;
    }

    this.items.push(cartItem);
    return cartItem;
  }

  get subtotalCents() {
    if (this.items.length == 0) {
      return 0;
    }

    return this.items.reduce((sum, item) => sum + item.lineTotalCents, 0);
  }

  get itemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  getPricingSummary(taxRate = 0) {
    return new PricingSummary({
      subtotalCents: this.subtotalCents,
      taxRate,
    });
  }

  get subtotal() {
    return this.subtotalCents / 100;
  }

  toJSON(taxRate = 0) {
    const pricingSummary = this.getPricingSummary(taxRate);

    return {
      id: this.id,
      items: this.items,
      subtotalCents: pricingSummary.subtotalCents,
      subtotal: pricingSummary.subtotal,
      taxRate: pricingSummary.taxRate,
      taxCents: pricingSummary.taxCents,
      tax: pricingSummary.tax,
      totalCents: pricingSummary.totalCents,
      total: pricingSummary.total,
      itemCount: this.itemCount,
      createdAt: this.createdAt,
    };
  }
}