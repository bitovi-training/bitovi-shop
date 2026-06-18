import { useEffect, useState } from 'react';
import useLiveRefresh from '../../hooks/useLiveRefresh';
import PageTemplate from '../PageTemplate/PageTemplate';
import OrderCard from './OrderCard/OrderCard';
import './OrdersPage.css';

export default function OrdersPage({ currentPath, cartCount = 0 }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadOrders() {
    try {
      const response = await fetch('/api/orders');
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload?.error?.message || 'Failed to load orders.');
      }

      setOrders(Array.isArray(payload.orders) ? payload.orders : []);
      setError('');
    } catch (fetchError) {
      setError(fetchError.message || 'Failed to load orders.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  useLiveRefresh(loadOrders);

  return (
    <PageTemplate
      currentPath={currentPath}
      cartCount={cartCount}
      title="Past Orders"
    >
      <section className="orders-page" aria-label="Past orders">
        {isLoading ? <p>Loading orders...</p> : null}
        {error ? <p>{error}</p> : null}
        {!isLoading && !error && orders.length === 0 ? <p>No orders yet.</p> : null}
        {!isLoading && !error ? orders.map((order) => (
          <OrderCard key={order.order?.id ?? order.id ?? order.order?.order_number} order={order} />
        )) : null}
      </section>
    </PageTemplate>
  );
}
