import LineItem from '../../../components/LineItem/LineItem';
import Card from '../../../components/Card/Card';
import './OrderCard.css';

function formatPrice(cents) {
  if (!Number.isFinite(cents)) return '$0.00';
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(raw) {
  if (!raw) return '';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export default function OrderCard({ order }) {
  if (!order) return null;

  // API returns { order: {...}, items: [...] }
  const info = order.order ?? order;
  const items = Array.isArray(order.items) ? order.items : [];

  const orderNumber = info.order_number ?? info.orderNumber;
  const customerName = info.customer_name ?? info.customer?.name;
  const customerEmail = info.customer_email ?? info.customer?.email;
  const subtotalCents = info.subtotal_cents ?? info.subtotalCents ?? 0;
  const taxCents = info.tax_cents ?? info.taxCents ?? 0;
  const taxRate = info.tax_rate ?? info.taxRate ?? 0;
  const totalCents = info.total_cents ?? info.totalCents ?? 0;
  const createdAt = info.created_at ?? info.createdAt;
  const taxPercent = Math.round(taxRate * 100);

  return (
    <Card as="article" className="order-card" aria-label={`Order ${orderNumber}`}>
      <div className="order-card__top">
        <h2>{orderNumber}</h2>
        <span className="order-card__date">{formatDate(createdAt)}</span>
      </div>

      {(customerName || customerEmail) ? (
        <p className="order-card__customer">
          {[customerName, customerEmail].filter(Boolean).join(' • ')}
        </p>
      ) : null}

      <div className="order-card__items">
        {items.map((item, i) => {
          const name = item.product_name ?? item.productName;
          const lineCents = item.line_total_cents ?? item.lineTotalCents ?? (item.unit_price_cents ?? item.unitPriceCents ?? 0);
          const qty = item.quantity ?? 1;
          return (
            <LineItem
              key={i}
              label={qty > 1 ? `${name} ×${qty}` : name}
              value={formatPrice(lineCents)}
            />
          );
        })}
        <hr />
        <LineItem label="Subtotal" value={formatPrice(subtotalCents)} />
        <LineItem label={`Tax (${taxPercent}%)`} value={formatPrice(taxCents)} />
        <LineItem label="Total" value={formatPrice(totalCents)} />
      </div>
    </Card>
  );
}
