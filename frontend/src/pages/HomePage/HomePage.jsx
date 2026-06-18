import { useEffect, useState } from 'react';
import useLiveRefresh from '../../hooks/useLiveRefresh';
import PageTemplate from '../PageTemplate/PageTemplate';
import FeaturedProductHero from './FeaturedProductHero/FeaturedProductHero';
import ProductCard from './ProductCard/ProductCard';
import './HomePage.css';

export default function HomePage({
  currentPath,
  cartCount = 0,
  onAddToCart,
  recentlyAddedProductIds = [],
}) {
  const [products, setProducts] = useState([]);
  const [featuredProduct, setFeaturedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadProducts() {
    try {
      const response = await fetch('/api/products');
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload?.error?.message || 'Failed to load products.');
      }

      let featuredPayload = null;
      try {
        const featuredResponse = await fetch('/api/products/featured');
        featuredPayload = await featuredResponse.json();

        if (!featuredResponse.ok || !featuredPayload?.ok) {
          featuredPayload = null;
        }
      } catch {
        featuredPayload = null;
      }

      setProducts(Array.isArray(payload.products) ? payload.products : []);
      setFeaturedProduct(featuredPayload?.product || null);
      setError('');
    } catch (fetchError) {
      setError(fetchError.message || 'Failed to load products.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  useLiveRefresh(loadProducts, { intervalMs: 5000 });

  return (
    <PageTemplate
      currentPath={currentPath}
      cartCount={cartCount}
      hero={(
        <FeaturedProductHero
          product={featuredProduct}
          onAddToCart={onAddToCart}
          isRecentlyAdded={recentlyAddedProductIds.includes(Number(featuredProduct?.id))}
        />
      )}
    >

      <section className="home-products" aria-label="Products">
        {isLoading ? <p>Loading products...</p> : null}
        {error ? <p>{error}</p> : null}
        {!isLoading && !error
          ? products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            isRecentlyAdded={recentlyAddedProductIds.includes(Number(product.id))}
          />
          ))
          : null}
      </section>
    </PageTemplate>
  );
}
