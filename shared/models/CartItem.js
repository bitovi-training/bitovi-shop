export class CartItem {
  constructor({ productId, productName, unitPriceCents, quantity = 1, image = null }) {
    this.productId = productId;
    this.productName = productName;
    this.unitPriceCents = unitPriceCents;
    this.quantity = quantity;
    this.image = image;
  }

  get lineTotalCents() {
    return this.unitPriceCents * this.quantity;
  }

  get unitPrice() {
    return this.unitPriceCents / 100;
  }

  get lineTotal() {
    return this.lineTotalCents / 100;
  }

  toJSON() {
    return {
      productId: this.productId,
      productName: this.productName,
      unitPriceCents: this.unitPriceCents,
      unitPrice: this.unitPrice,
      quantity: this.quantity,
      image: this.image,
      lineTotalCents: this.lineTotalCents,
      lineTotal: this.lineTotal,
    };
  }
}