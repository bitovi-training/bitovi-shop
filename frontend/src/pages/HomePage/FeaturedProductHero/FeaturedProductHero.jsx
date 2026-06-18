import FeaturedProductCard from '../FeaturedProductCard/FeaturedProductCard';
import './FeaturedProductHero.css';

export default function FeaturedProductHero({ product, onAddToCart, isRecentlyAdded = false }) {
  if (!product) {
    return null;
  }

  return (
    <section className="featured-product-hero" aria-label="Featured product hero">
      <div className="featured-product-hero__content">
        <div className="featured-product-hero__copy">
          <p>Featured Product</p>
          <p>HANDPICKED FOR THE WEEK</p>
        </div>

        <FeaturedProductCard
          product={product}
          onAddToCart={onAddToCart}
          isRecentlyAdded={isRecentlyAdded}
        />
      </div>

      <svg className="featured-product-hero__wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none" aria-hidden="true">
        <rect width="1440" height="320" fill="var(--color-background)" />
        <path fill="var(--color-primary-dark)" d="M0,0L0,64L80,58.7C160,53,320,43,480,69.3C640,96,800,160,960,186.7C1120,213,1280,203,1360,197.3L1440,192L1440,0Z" />
      </svg>
    </section>
  );
}
