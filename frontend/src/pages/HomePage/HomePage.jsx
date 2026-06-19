import { useEffect, useRef, useState } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const searchQueryRef = useRef('');

  async function loadProducts(query = '') {
    try {
      const url = query ? `/api/products?search=${encodeURIComponent(query)}` : '/api/products';
      const response = await fetch(url);
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload?.error?.message || 'Failed to load products.');
      }

      if (query === '') {
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
        setFeaturedProduct(featuredPayload?.product || null);
      }

      setProducts(Array.isArray(payload.products) ? payload.products : []);
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

  useLiveRefresh(() => loadProducts(searchQueryRef.current), { intervalMs: 5000 });

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadProducts(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  function handleSearchChange(value) {
    searchQueryRef.current = value;
    setSearchQuery(value);
  }

  return (
    <PageTemplate
      currentPath={currentPath}
      cartCount={cartCount}
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
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
        {!isLoading && !error && products.length === 0 && searchQuery
          ? <p className="home-products__empty">No products found for &ldquo;{searchQuery}&rdquo;</p>
          : null}
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
