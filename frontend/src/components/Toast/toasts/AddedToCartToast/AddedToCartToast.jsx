import Icon, { ICON_VARIANTS } from '../../../Icon/Icon';
import Toast from '../../Toast';
import './AddedToCartToast.css';

export default function AddedToCartToast({ productName = 'Item', imageSrc = '' }) {
  return (
    <Toast className="added-to-cart-toast" aria-label={`${productName} added to cart`}>
      <div className="added-to-cart-toast__thumb" aria-hidden="true">
        {imageSrc ? (
          <img className="added-to-cart-toast__image" src={imageSrc} alt="" />
        ) : (
          <div className="added-to-cart-toast__image-fallback" />
        )}
      </div>

      <p className="added-to-cart-toast__label">Added to cart</p>

      <Icon className="added-to-cart-toast__icon" variant={ICON_VARIANTS.CART} />
    </Toast>
  );
}