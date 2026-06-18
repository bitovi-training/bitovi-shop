export class Review {
  constructor(rating, text, reviewer) {
    this.rating = rating;
    this.text = text;
    this.reviewer = reviewer;
    this.createdAt = new Date();
  }
}

export class ProductSpecs {
  constructor(width, height, depth, weight, deliveryTime) {
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.weight = weight;
    this.deliveryTime = deliveryTime;
  }
}

export class Product {
  constructor({
    id,
    slug = null,
    name,
    description,
    priceCents,
    availableQuantity = null,
    inStock = true,
    image = null,
    specs = null,
    reviews = [],
  }) {
    this.id = id;
    this.slug = slug;
    this.name = name;
    this.description = description;
    this.priceCents = priceCents;
    const hasNumericQuantity = Number.isFinite(availableQuantity);
    this.availableQuantity = hasNumericQuantity
      ? Math.max(0, Math.trunc(availableQuantity))
      : (inStock ? 1 : 0);
    // image can be a base64 data URI (e.g., "data:image/png;base64,...") or null
    this.image = image;
    this.specs = specs;
    this.reviews = reviews;
    this.createdAt = new Date();
  }

  get inStock() {
    return this.availableQuantity > 0;
  }

  addReview(rating, text, reviewer) {
    if (rating < 0 || rating > 5) {
      throw new Error('Rating must be between 0 and 5');
    }

    const review = new Review(rating, text, reviewer);
    this.reviews.push(review);
    return review;
  }

  get averageRating() {
    if (this.reviews.length === 0) return 0;

    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    return Number(sum / this.reviews.length).toFixed(1);
  }

  get price() {
    return this.priceCents / 100;
  }

  toJSON() {
    return {
      id: this.id,
      slug: this.slug,
      name: this.name,
      description: this.description,
      priceCents: this.priceCents,
      availableQuantity: this.availableQuantity,
      price: this.price,
      inStock: this.inStock,
      image: this.image,
      specs: this.specs,
      reviews: this.reviews,
      averageRating: this.averageRating,
      createdAt: this.createdAt,
    };
  }
}