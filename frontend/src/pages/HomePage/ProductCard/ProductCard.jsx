import Badge, { BADGE_VARIANTS } from '../../../components/Badge/Badge';
import Button, { BUTTON_VARIANTS } from '../../../components/Button/Button';
import Card from '../../../components/Card/Card';
import { getProductPath } from '../../routes';
import './ProductCard.css';

function formatPrice(priceCents) {
  if (!Number.isFinite(priceCents)) {
    return '$0.00';
  }

  return `$${(priceCents / 100).toFixed(2)}`;
}

export default function ProductCard({ product, onAddToCart, isRecentlyAdded = false }) {
  const imagePath = product?.image_path || product?.image || '';
  const availableQuantity = Number(
    product?.available_quantity
      ?? product?.availableQuantity
      ?? ((product?.in_stock ?? product?.inStock) ? 1 : 0),
  );
  const inStock = Number.isFinite(availableQuantity) && availableQuantity > 0;
  const priceCents = Number(product?.price_cents ?? product?.priceCents ?? 0);

  return (
    <Card as="article" className="home-product-card" aria-label={product?.name || 'Product'}>
      <a className="home-product-card__image-link" href={`#${getProductPath(product.id)}`}>
        <div className="home-product-card__image-wrap" aria-hidden="true">
          {imagePath ? (
            <img className="home-product-card__image" src={imagePath} alt={product.name} />
          ) : (
            <div className="home-product-card__image-placeholder" />
          )}
        </div>
      </a>

      <div className="home-product-card__content">
        <a href={`#${getProductPath(product.id)}`} className="home-product-card__name-link">
          <h2>{product.name}</h2>
        </a>
        <p className="home-product-card__description">{product.description}</p>

        <div className="home-product-card__footer">
          <span className="home-product-card__price">{formatPrice(priceCents)}</span>
          {!inStock ? <Badge variant={BADGE_VARIANTS.ERROR}>out of stock</Badge> : null}
        </div>

        {inStock ? (
          <Button
            className="home-product-card__button"
            variant={isRecentlyAdded ? BUTTON_VARIANTS.SUCCESS : BUTTON_VARIANTS.ACCENT}
            onClick={() => onAddToCart?.(product)}
          >
            {isRecentlyAdded ? 'Added' : 'Add to cart'}
          </Button>
        ) : null}
      </div>
    </Card>
  );
}