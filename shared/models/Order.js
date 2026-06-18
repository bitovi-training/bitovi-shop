import { Customer } from './Customer.js';
import { OrderItem } from './OrderItem.js';
import { PricingSummary } from './PricingSummary.js';

export class Order {
  constructor({
    id,
    orderNumber,
    customer,
    items = [],
    pricingSummary = null,
    createdAt = new Date(),
  }) {
    this.id = id;
    this.orderNumber = orderNumber;
    this.customer = customer instanceof Customer ? customer : new Customer(customer);
    this.items = items.map((item) => (item instanceof OrderItem ? item : new OrderItem(item)));
    this.pricingSummary =
      pricingSummary instanceof PricingSummary ? pricingSummary : new PricingSummary(pricingSummary || {
        subtotalCents: this.subtotalCents,
      });
    this.createdAt = createdAt;
  }

  get subtotalCents() {
    return this.items.reduce((sum, item) => sum + item.lineTotalCents, 0);
  }

  get subtotal() {
    return this.subtotalCents / 100;
  }

  get totalCents() {
    return this.pricingSummary.totalCents;
  }

  get total() {
    return this.totalCents / 100;
  }

  get itemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  toJSON() {
    return {
      id: this.id,
      orderNumber: this.orderNumber,
      customer: this.customer,
      items: this.items,
      pricingSummary: this.pricingSummary,
      subtotalCents: this.subtotalCents,
      subtotal: this.subtotal,
      totalCents: this.totalCents,
      total: this.total,
      itemCount: this.itemCount,
      createdAt: this.createdAt,
    };
  }
}