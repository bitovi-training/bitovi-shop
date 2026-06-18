import { useEffect, useState } from 'react';
import useLiveRefresh from '../../hooks/useLiveRefresh';
import PageTemplate from '../PageTemplate/PageTemplate';
import { ROUTES } from '../routes';
import ProductDetailsCard from './ProductDetailsCard/ProductDetailsCard';
import CustomerReviews from './CustomerReviews/CustomerReviews';
import ProductSpecs from './ProductSpecs/ProductSpecs';
import './ProductPage.css';

const PLACEHOLDER_SPECS = [
  { label: 'Width', value: '18 cm' },
  { label: 'Height', value: '41 cm' },
  { label: 'Depth', value: '18 cm' },
  { label: 'Weight', value: '1.1 kg' },
  { label: 'Delivery', value: '3-5 business days' },
];

export default function ProductPage({
  currentPath,
  productId,
  cartCount = 0,
  onAddToCart,
  recentlyAddedProductIds = [],
}) {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const breadcrumbItems = [
    { label: 'Home', href: `#${ROUTES.HOME}` },
    { label: product?.name || 'Product' },
  ];

  async function loadProduct() {
    if (!productId) {
      setError('Missing product ID.');
      setProduct(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/products/${encodeURIComponent(productId)}`);
      const payload = await response.json();

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error?.message || 'Failed to load product details.');
      }

      setProduct(payload.product || null);
      setError('');
    } catch (fetchError) {
      setProduct(null);
      setError(fetchError.message || 'Failed to load product details.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setIsLoading(true);
    loadProduct();
  }, [productId]);

  useLiveRefresh(loadProduct, { enabled: Boolean(productId), intervalMs: 5000 });

  const productReviews = (product?.reviews || []).map((review) => ({
    rating: review.stars,
    review: review.quote,
    author: review.author,
  }));

  return (
    <PageTemplate
      currentPath={currentPath}
      cartCount={cartCount}
      breadcrumbItems={breadcrumbItems}
    >
      <section className="product-page" aria-label="Product details">
        {isLoading ? <p>Loading product...</p> : null}
        {error ? <p>{error}</p> : null}
        {!isLoading && !error && product ? (
          <ProductDetailsCard
            product={product}
            onAddToCart={onAddToCart}
            isRecentlyAdded={recentlyAddedProductIds.includes(Number(product.id))}
          />
        ) : null}
        {!isLoading && !error && product ? (
          <div className="product-page__secondary">
            <ProductSpecs specs={PLACEHOLDER_SPECS} />
            <CustomerReviews reviews={productReviews} />
          </div>
        ) : null}
      </section>
    </PageTemplate>
  );
}
