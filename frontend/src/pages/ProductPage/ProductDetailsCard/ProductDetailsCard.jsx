import Badge, { BADGE_VARIANTS } from '../../../components/Badge/Badge';
import Button, { BUTTON_VARIANTS } from '../../../components/Button/Button';
import Card from '../../../components/Card/Card';
import { ROUTES } from '../../routes';
import './ProductDetailsCard.css';

const SHIPPING_BULLETS = [
  '30-day easy returns',
  'Ships in 1 business day',
  'No account required at checkout',
];

function formatPrice(priceCents) {
  if (!Number.isFinite(priceCents)) {
    return '$0.00';
  }

  return `$${(priceCents / 100).toFixed(2)}`;
}

export default function ProductDetailsCard({ product, onAddToCart, isRecentlyAdded = false }) {
  if (!product) {
    return null;
  }

  const imagePath = product?.image_path || product?.image || '';
  const priceCents = Number(product?.price_cents ?? product?.priceCents ?? 0);
  const availableQuantity = Number(
    product?.available_quantity
      ?? product?.availableQuantity
      ?? ((product?.in_stock ?? product?.inStock) ? 1 : 0),
  );
  const inStock = Number.isFinite(availableQuantity) && availableQuantity > 0;

  return (
    <Card as="article" className="product-details-card" aria-label={`${product.name} details`}>
      <div className="product-details-card__image-wrap" aria-hidden="true">
        {imagePath ? (
          <img className="product-details-card__image" src={imagePath} alt={product.name} />
        ) : (
          <div className="product-details-card__image-fallback">
            <span className="product-details-card__shape-circle" />
            <span className="product-details-card__shape-stem" />
            <span className="product-details-card__shape-base" />
          </div>
        )}
      </div>

      <div className="product-details-card__info">
        <div className="product-details-card__header-row">
          <p className="product-details-card__eyebrow">PRODUCT DETAIL</p>
          {!inStock ? (
            <Badge variant={BADGE_VARIANTS.ERROR}>out of stock</Badge>
          ) : null}
        </div>

        <h2>{product.name}</h2>
        <p className="product-details-card__description">{product.description}</p>
        <p className="product-details-card__price">{formatPrice(priceCents)}</p>

        <div className="product-details-card__actions">
          <Button
            variant={isRecentlyAdded ? BUTTON_VARIANTS.SUCCESS : BUTTON_VARIANTS.ACCENT}
            disabled={!inStock}
            onClick={() => onAddToCart?.(product)}
          >
            {inStock ? (isRecentlyAdded ? 'Added' : 'Add to cart') : 'Out of stock'}
          </Button>
          <a href={`#${ROUTES.CART}`}>
            <Button variant={BUTTON_VARIANTS.DEFAULT}>Go to cart</Button>
          </a>
        </div>

        <ul className="product-details-card__shipping">
          {SHIPPING_BULLETS.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
