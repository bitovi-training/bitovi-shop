import { useMemo, useState } from 'react';
import Button, { BUTTON_VARIANTS } from '../../components/Button/Button';
import PageTemplate from '../PageTemplate/PageTemplate';
import { ROUTES } from '../routes';
import CartItem from './CartItem/CartItem';
import CheckoutSection from './CheckoutSection/CheckoutSection';
import './CartPage.css';

const LATEST_RECEIPT_STORAGE_KEY = 'bitovi-shop.latestReceipt';

function formatCurrency(amountCents) {
  if (!Number.isFinite(amountCents)) {
    return '$0.00';
  }

  return `$${(amountCents / 100).toFixed(2)}`;
}

export default function CartPage({
  currentPath,
  cartCount = 0,
  cart,
  onRemoveFromCart,
  onCheckoutSuccess,
}) {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const safeCart = cart || { items: [], getPricingSummary: () => ({ subtotalCents: 0, taxCents: 0, totalCents: 0 }) };
  const cartTaxRate = Number(safeCart.taxRate ?? 0);
  const pricing = useMemo(() => safeCart.getPricingSummary(cartTaxRate), [safeCart, cartTaxRate]);
  const hasItems = safeCart.items.length > 0;

  const canSubmit =
    hasItems
    && customerName.trim().length >= 2
    && customerEmail.includes('@');

  const handleRemoveItem = (productId) => {
    onRemoveFromCart?.(productId);
    setSubmitError('');
  };

  const handleCheckout = async (event) => {
    event.preventDefault();

    if (!canSubmit || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName,
          customerEmail,
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error?.message || 'Failed to place order.');
      }

      const receipt = payload.receipt || null;
      const orderNumber = receipt?.order?.order_number || '';

      if (receipt) {
        window.sessionStorage.setItem(LATEST_RECEIPT_STORAGE_KEY, JSON.stringify(receipt));
      }

      onCheckoutSuccess?.(receipt);

      window.location.hash = orderNumber
        ? `#${ROUTES.ORDER_CONFIRMATION}?order=${encodeURIComponent(orderNumber)}`
        : `#${ROUTES.ORDER_CONFIRMATION}`;
    } catch (error) {
      setSubmitError(error.message || 'Failed to place order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToShop = () => {
    window.location.hash = `#${ROUTES.HOME}`;
  };

  return (
    <PageTemplate
      currentPath={currentPath}
      cartCount={cartCount}
    >
      <section className="cart-page" aria-label="Cart items">
        <h1 className="cart-page__title">Your Cart</h1>

        {!hasItems ? (
          <div className="cart-page__empty-state">
            <p className="cart-page__empty">Your cart is empty. Add an item from the shop to continue.</p>
            <Button
              variant={BUTTON_VARIANTS.ACCENT}
              className="cart-page__empty-cta"
              onClick={handleGoToShop}
            >
              Go To Shop
            </Button>
          </div>
        ) : null}

        {hasItems ? (
          <>
            <div className="cart-page__items">
              {safeCart.items.map((item) => (
                <CartItem
                  key={item.productId}
                  productName={item.productName}
                  unitPriceCents={item.unitPriceCents}
                  quantity={item.quantity}
                  imageSrc={item.image || ''}
                  onRemove={() => handleRemoveItem(item.productId)}
                />
              ))}
            </div>

            <p className="cart-page__subtotal">
              <span>Subtotal:</span>
              <span className="cart-page__subtotal-value">{formatCurrency(pricing.subtotalCents)}</span>
            </p>

            <hr className="cart-page__divider" />

            <CheckoutSection
              customerName={customerName}
              customerEmail={customerEmail}
              onNameChange={setCustomerName}
              onEmailChange={setCustomerEmail}
              pricing={pricing}
              taxRate={cartTaxRate}
              submitError={submitError}
              isSubmitting={isSubmitting}
              onSubmit={handleCheckout}
              canSubmit={canSubmit}
            />
          </>
        ) : null}
      </section>
    </PageTemplate>
  );
}
