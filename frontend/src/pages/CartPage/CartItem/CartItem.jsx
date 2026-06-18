import './CartItem.css';
import Icon, { ICON_VARIANTS } from '../../../components/Icon/Icon';

function formatPrice(priceCents) {
  if (!Number.isFinite(priceCents)) {
    return '$0.00';
  }

  return `$${(priceCents / 100).toFixed(2)}`;
}

export default function CartItem({
  productName,
  unitPriceCents,
  quantity = 1,
  imageSrc = '',
  onRemove,
  className = '',
}) {
  return (
    <article className={`cart-item ${className}`.trim()} aria-label={productName || 'Cart item'}>
      <div className="cart-item__image-wrap" aria-hidden="true">
        {imageSrc ? (
          <img className="cart-item__image" src={imageSrc} alt="" />
        ) : (
          <div className="cart-item__image-fallback">
            <span className="cart-item__mug" />
            <span className="cart-item__mug-handle" />
          </div>
        )}
      </div>

      <div className="cart-item__body">
        <div className="cart-item__product-info">
          <p className="cart-item__name">{productName || 'Untitled product'}</p>
          <p className="cart-item__price">
            {formatPrice(unitPriceCents)} each
            {quantity > 1 ? ` - Qty ${quantity}` : ''}
          </p>
        </div>

        <button
          className="cart-item__remove"
          type="button"
          aria-label={`Remove ${productName || 'item'} from cart`}
          onClick={onRemove}
        >
          <Icon variant={ICON_VARIANTS.TRASH} className="cart-item__trash-icon" />
        </button>
      </div>
    </article>
  );
}
