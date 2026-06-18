import Button, { BUTTON_VARIANTS } from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import LineItem from '../../../components/LineItem/LineItem';
import './CheckoutSection.css';

function formatCurrency(amountCents) {
  if (!Number.isFinite(amountCents)) {
    return '$0.00';
  }

  return `$${(amountCents / 100).toFixed(2)}`;
}

export default function CheckoutSection({
  customerName,
  customerEmail,
  onNameChange,
  onEmailChange,
  pricing,
  taxRate,
  isSubmitting,
  submitError,
  onSubmit,
  canSubmit,
}) {
  const taxPercent = Math.round((taxRate || 0) * 100);

  return (
    <section className="checkout-section" aria-label="Checkout">
      <h2>Checkout</h2>

      <form className="checkout-section__form" onSubmit={onSubmit}>
        <Input
          id="checkout-name"
          name="name"
          label="Name"
          value={customerName}
          onValueChange={onNameChange}
          placeholder=""
          className="checkout-section__input"
        />

        <Input
          id="checkout-email"
          name="email"
          label="Email"
          value={customerEmail}
          onValueChange={onEmailChange}
          placeholder=""
          className="checkout-section__input"
        />

        <div className="checkout-section__pricing" aria-label="Pricing info">
          <LineItem label="Cart Total" value={formatCurrency(pricing?.subtotalCents)} />
          <LineItem label={`Tax (${taxPercent}%)`} value={formatCurrency(pricing?.taxCents)} />
          <LineItem label="Final Price" value={formatCurrency(pricing?.totalCents)} />
        </div>

        {submitError ? <p className="checkout-section__error">{submitError}</p> : null}

        <Button
          type="submit"
          variant={BUTTON_VARIANTS.ACCENT}
          className="checkout-section__submit"
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting ? 'Placing Order...' : 'Place Order'}
        </Button>
      </form>
    </section>
  );
}
