import LineItem from '../../../components/LineItem/LineItem';
import Card from '../../../components/Card/Card';
import './OrderConfirmationCard.css';

function formatCurrency(amountCents) {
  if (!Number.isFinite(amountCents)) {
    return '$0.00';
  }

  return `$${(amountCents / 100).toFixed(2)}`;
}

function formatDate(rawDate) {
  if (!rawDate) {
    return '';
  }

  const parsedDate = new Date(rawDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return rawDate;
  }

  return parsedDate.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function OrderConfirmationCard({ orderInfo, items, itemCount, orderSubtotalCents, orderTaxCents, orderTaxRate, orderTotalCents }) {
  if (!orderInfo) {
    return null;
  }

  const subtotal = orderSubtotalCents ?? 0;
  const tax = orderTaxCents ?? 0;
  const total = orderTotalCents ?? 0;
  const taxPercent = Math.round((orderTaxRate ?? 0) * 100);

  return (
    <Card as="article" className="confirmation-card" aria-live="polite">
      <div className="confirmation-card__content">
        <header className="confirmation-card__header">
          <h2 className="confirmation-card__order-number">{orderInfo.order_number || 'Order'}</h2>
          {orderInfo.created_at ? (
            <p className="confirmation-card__order-date">Placed {formatDate(orderInfo.created_at)}</p>
          ) : null}
        </header>

        <div className="confirmation-card__meta">
          <LineItem label="Customer" value={orderInfo.customer_name || 'N/A'} />
          <LineItem label="Email" value={orderInfo.customer_email || 'N/A'} />
          <LineItem label="Items" value={String(itemCount)} />
        </div>

        <div className="confirmation-card__items" aria-label="Purchased items">
          <h3 className="confirmation-card__items-title">Items</h3>
          {items.map((item) => (
            <LineItem
              key={`${item.name}-${item.lineTotalCents}`}
              label={item.quantity > 1 ? `${item.name} x${item.quantity}` : item.name}
              value={formatCurrency(item.lineTotalCents)}
            />
          ))}
        </div>

        <hr className="confirmation-card__divider" />

        <div className="confirmation-card__total" aria-label="Order total">
          <LineItem label="Subtotal" value={formatCurrency(subtotal)} />
          <LineItem label={`Tax (${taxPercent}%)`} value={formatCurrency(tax)} />
          <LineItem label="Order Total" value={formatCurrency(total)} />
        </div>
      </div>
    </Card>
  );
}
