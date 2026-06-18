import { useEffect, useMemo, useState } from 'react';
import Button, { BUTTON_VARIANTS } from '../../components/Button/Button';
import PageTemplate from '../PageTemplate/PageTemplate';
import OrderConfirmationCard from './OrderConfirmationCard/OrderConfirmationCard';
import { ROUTES } from '../routes';
import './OrderConfirmationPage.css';

const LATEST_RECEIPT_STORAGE_KEY = 'bitovi-shop.latestReceipt';

function normalizeReceipt(receipt) {
  if (!receipt || typeof receipt !== 'object') {
    return null;
  }

  const order = receipt.order || receipt;
  const items = Array.isArray(receipt.items) ? receipt.items : [];

  return {
    order,
    items,
  };
}

function aggregateItems(items = []) {
  const grouped = new Map();

  for (const item of items) {
    const name = item.product_name ?? item.productName ?? 'Item';
    const unitPriceCents = item.unit_price_cents ?? item.unitPriceCents ?? 0;
    const quantity = item.quantity ?? 1;
    const key = `${name}::${unitPriceCents}`;
    const existing = grouped.get(key);

    if (existing) {
      existing.quantity += quantity;
      existing.lineTotalCents += unitPriceCents * quantity;
      continue;
    }

    grouped.set(key, {
      name,
      quantity,
      lineTotalCents: unitPriceCents * quantity,
    });
  }

  return Array.from(grouped.values());
}

function readStoredReceipt() {
  const raw = window.sessionStorage.getItem(LATEST_RECEIPT_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return normalizeReceipt(JSON.parse(raw));
  } catch {
    return null;
  }
}

function saveStoredReceipt(receipt) {
  if (!receipt) {
    return;
  }

  window.sessionStorage.setItem(LATEST_RECEIPT_STORAGE_KEY, JSON.stringify(receipt));
}

export default function OrderConfirmationPage({ currentPath, cartCount = 0, orderNumber = '' }) {
  const [receipt, setReceipt] = useState(() => readStoredReceipt());
  const [isLoading, setIsLoading] = useState(Boolean(orderNumber));
  const [error, setError] = useState('');

  const breadcrumbItems = [
    { label: 'Home', href: `#${ROUTES.HOME}` },
    { label: 'Cart', href: `#${ROUTES.CART}` },
    { label: 'Order Confirmed' },
  ];

  useEffect(() => {
    let ignore = false;

    async function loadReceipt() {
      const cachedReceipt = readStoredReceipt();
      const cachedOrderNumber = cachedReceipt?.order?.order_number;

      if (!ignore && cachedReceipt && (!orderNumber || cachedOrderNumber === orderNumber)) {
        setReceipt(cachedReceipt);
        setError('');
      }

      if (!orderNumber) {
        if (!ignore) {
          setIsLoading(false);
          if (!cachedReceipt) {
            setError('No recent order confirmation was found.');
          }
        }
        return;
      }

      if (!ignore) {
        setIsLoading(true);
      }

      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}`);
        const payload = await response.json();

        if (!response.ok || !payload?.ok) {
          throw new Error(payload?.error?.message || 'Failed to load order confirmation.');
        }

        const normalizedReceipt = normalizeReceipt(payload.receipt);

        if (!ignore && normalizedReceipt) {
          setReceipt(normalizedReceipt);
          setError('');
          saveStoredReceipt(normalizedReceipt);
        }
      } catch (fetchError) {
        if (!ignore && !cachedReceipt) {
          setError(fetchError.message || 'Failed to load order confirmation.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadReceipt();

    return () => {
      ignore = true;
    };
  }, [orderNumber]);

  const orderInfo = receipt?.order || null;
  const items = useMemo(() => aggregateItems(receipt?.items || []), [receipt]);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  const orderSubtotalCents = orderInfo?.subtotal_cents ?? 0;
  const orderTaxCents = orderInfo?.tax_cents ?? 0;
  const orderTaxRate = orderInfo?.tax_rate ?? 0;
  const orderTotalCents = orderInfo?.total_cents ?? 0;

  return (
    <PageTemplate
      currentPath={currentPath}
      cartCount={cartCount}
      title="Order Confirmed"
      breadcrumbItems={breadcrumbItems}
    >
      <section className="confirmation-page" aria-label="Order confirmation">
        {isLoading ? <p>Loading order confirmation...</p> : null}
        {error ? <p>{error}</p> : null}

        {!isLoading && !error && orderInfo ? (
          <>
            <OrderConfirmationCard
              orderInfo={orderInfo}
              items={items}
              itemCount={itemCount}
              orderSubtotalCents={orderSubtotalCents}
              orderTaxCents={orderTaxCents}
              orderTaxRate={orderTaxRate}
              orderTotalCents={orderTotalCents}
            />

            <footer className="confirmation-page__actions">
              <a href={`#${ROUTES.ORDERS}`}>
                <Button variant={BUTTON_VARIANTS.DEFAULT}>View all orders</Button>
              </a>
              <a href={`#${ROUTES.HOME}`}>
                <Button variant={BUTTON_VARIANTS.ACCENT}>Continue shopping</Button>
              </a>
            </footer>
          </>
        ) : null}

        {!isLoading && !error && !orderInfo ? (
          <div className="confirmation-page__empty">
            <p>We could not find the order details for this confirmation page.</p>
            <a href={`#${ROUTES.ORDERS}`}>
              <Button variant={BUTTON_VARIANTS.DEFAULT}>Go to orders</Button>
            </a>
          </div>
        ) : null}
      </section>
    </PageTemplate>
  );
}
