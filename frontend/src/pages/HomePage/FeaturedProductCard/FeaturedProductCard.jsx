import Badge, { BADGE_VARIANTS } from '../../../components/Badge/Badge';
import Button, { BUTTON_VARIANTS } from '../../../components/Button/Button';
import Card from '../../../components/Card/Card';
import { getProductPath } from '../../routes';
import './FeaturedProductCard.css';

function formatPrice(priceCents) {
  if (!Number.isFinite(priceCents)) {
    return '$0.00';
  }

  return `$${(priceCents / 100).toFixed(2)}`;
}

export default function FeaturedProductCard({ product, onAddToCart, isRecentlyAdded = false }) {
  const imagePath = product?.image_path || product?.image || '';
  const availableQuantity = Number(
    product?.available_quantity
      ?? product?.availableQuantity
      ?? ((product?.in_stock ?? product?.inStock) ? 1 : 0),
  );
  const inStock = Number.isFinite(availableQuantity) && availableQuantity > 0;
  const priceCents = Number(product?.price_cents ?? product?.priceCents ?? 0);

  if (!product) {
    return null;
  }

  return (
    <Card as="article" className="featured-product-card" aria-label={`Featured product: ${product.name}`}>
      <a className="featured-product-card__image-link" href={`#${getProductPath(product.id)}`}>
        <div className="featured-product-card__image-wrap" aria-hidden="true">
          {imagePath ? (
            <img className="featured-product-card__image" src={imagePath} alt={product.name} />
          ) : (
            <div className="featured-product-card__image-placeholder" />
          )}
        </div>
      </a>

      <div className="featured-product-card__info">
        <div className="featured-product-card__badges">
          <Badge variant={BADGE_VARIANTS.PRIMARY}>Featured pick</Badge>
          <Badge variant={inStock ? BADGE_VARIANTS.SUCCESS : BADGE_VARIANTS.ERROR}>
            {inStock ? 'In stock' : 'Out of stock'}
          </Badge>
        </div>

        <p className="featured-product-card__kicker">THIS WEEK</p>
        <h2>{product.name}</h2>
        <p className="featured-product-card__description">{product.description}</p>
        <p className="featured-product-card__price">{formatPrice(priceCents)}</p>

        <div className="featured-product-card__actions">
          <a href={`#${getProductPath(product.id)}`}>
            <Button variant={BUTTON_VARIANTS.DEFAULT}>View details</Button>
          </a>
          <Button
            variant={inStock && isRecentlyAdded ? BUTTON_VARIANTS.SUCCESS : BUTTON_VARIANTS.ACCENT}
            disabled={!inStock}
            onClick={() => onAddToCart?.(product)}
          >
            {inStock ? (isRecentlyAdded ? 'Added' : 'Add to cart') : 'Out of stock'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
