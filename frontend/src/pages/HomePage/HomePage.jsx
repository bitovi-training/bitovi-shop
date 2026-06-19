import { useEffect, useState, useCallback } from 'react';
import useLiveRefresh from '../../hooks/useLiveRefresh';
import PageTemplate from '../PageTemplate/PageTemplate';
import FeaturedProductHero from './FeaturedProductHero/FeaturedProductHero';
import ProductCard from './ProductCard/ProductCard';
import SearchBar from './SearchBar/SearchBar';
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
  const [searchQuery, setSearchQuery] = useState('');

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

  const filterProducts = useCallback(() => {
    if (!searchQuery.trim()) {
      return products;
    }

    const lowerQuery = searchQuery.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        (product.description && product.description.toLowerCase().includes(lowerQuery))
    );
  }, [products, searchQuery]);

  const filteredProducts = filterProducts();

  const handleClear = useCallback(() => {
    setSearchQuery('');
  }, []);

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

      <section className="home-products-section" aria-label="Products">
        {!isLoading && !error ? (
          <SearchBar
            onSearch={setSearchQuery}
            onClear={handleClear}
          />
        ) : null}

        <div className="home-products">
          {isLoading ? <p>Loading products...</p> : null}
          {error ? <p>{error}</p> : null}
          {!isLoading && !error && filteredProducts.length === 0 ? (
            <p className="no-products-message">No products found</p>
          ) : null}
          {!isLoading && !error && filteredProducts.length > 0
            ? filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              isRecentlyAdded={recentlyAddedProductIds.includes(Number(product.id))}
            />
            ))
            : null}
        </div>
      </section>
    </PageTemplate>
  );
}
