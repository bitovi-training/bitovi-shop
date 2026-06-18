import { useEffect, useRef, useState } from 'react';
import { Cart as CartModel } from '@shared/models/Cart.js';
import AddedToCartToast from './components/Toast/toasts/AddedToCartToast/AddedToCartToast';
import useLiveRefresh from './hooks/useLiveRefresh';
import CartPage from './pages/CartPage/CartPage';
import HomePage from './pages/HomePage/HomePage';
import OrderConfirmationPage from './pages/OrderConfirmationPage/OrderConfirmationPage';
import OrdersPage from './pages/OrdersPage/OrdersPage';
import ProductPage from './pages/ProductPage/ProductPage';
import PageTemplate from './pages/PageTemplate/PageTemplate';
import { ROUTES, useHashRoute } from './pages/routes';

const BUTTON_FEEDBACK_MS = 1200;
const TOAST_VISIBILITY_MS = 2200;

function createEmptyCart() {
  return new CartModel();
}

function createCartFromData(data) {
  if (!data || typeof data !== 'object') {
    return createEmptyCart();
  }

  const cart = new CartModel({
    id: data.id || null,
    items: Array.isArray(data.items) ? data.items : [],
    createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
  });

  cart.taxRate = Number(data.taxRate ?? 0);
  return cart;
}

function toCartItemData(product) {
  return {
    productId: Number(product?.id),
    productName: product?.name || 'Untitled product',
    unitPriceCents: Number(product?.price_cents ?? product?.priceCents ?? 0),
    quantity: 1,
    image: product?.image_path || product?.image || '',
  };
}

function App() {
  const routeData = useHashRoute();
  const [cart, setCart] = useState(() => createEmptyCart());
  const [recentlyAddedProductIds, setRecentlyAddedProductIds] = useState([]);
  const [activeToast, setActiveToast] = useState(null);
  const buttonFeedbackTimeoutsRef = useRef(new Map());
  const toastTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  async function loadCart() {
    try {
      const response = await fetch('/api/cart');
      const payload = await response.json();

      if (!response.ok || !payload?.ok) {
        return;
      }

      if (isMountedRef.current) {
        setCart(createCartFromData(payload.cart));
      }
    } catch {
      // Keep local empty cart when the API is unavailable.
    }
  }

  useEffect(() => {
    isMountedRef.current = true;
    loadCart();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useLiveRefresh(loadCart);

  useEffect(() => () => {
    buttonFeedbackTimeoutsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    buttonFeedbackTimeoutsRef.current.clear();

    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
  }, []);

  const handleAddToCart = async (product) => {
    const itemData = toCartItemData(product);

    if (!Number.isInteger(itemData.productId) || itemData.productId <= 0) {
      return;
    }

    try {
      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: itemData.productId,
          quantity: 1,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload?.ok) {
        return;
      }

      setCart(createCartFromData(payload.cart));
    } catch {
      return;
    }

    setRecentlyAddedProductIds((previousProductIds) => (
      previousProductIds.includes(itemData.productId)
        ? previousProductIds
        : [...previousProductIds, itemData.productId]
    ));

    const existingButtonTimeout = buttonFeedbackTimeoutsRef.current.get(itemData.productId);
    if (existingButtonTimeout) {
      window.clearTimeout(existingButtonTimeout);
    }

    buttonFeedbackTimeoutsRef.current.set(
      itemData.productId,
      window.setTimeout(() => {
        setRecentlyAddedProductIds((previousProductIds) => (
          previousProductIds.filter((productId) => productId !== itemData.productId)
        ));
        buttonFeedbackTimeoutsRef.current.delete(itemData.productId);
      }, BUTTON_FEEDBACK_MS),
    );

    setActiveToast({
      productId: itemData.productId,
      productName: itemData.productName,
      imageSrc: itemData.image,
    });

    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = window.setTimeout(() => {
      setActiveToast(null);
      toastTimeoutRef.current = null;
    }, TOAST_VISIBILITY_MS);
  };

  const handleRemoveFromCart = async (productId) => {
    if (!Number.isInteger(productId) || productId <= 0) {
      return;
    }

    try {
      const response = await fetch(`/api/cart/items/${encodeURIComponent(productId)}`, {
        method: 'DELETE',
      });
      const payload = await response.json();
      if (!response.ok || !payload?.ok) {
        return;
      }

      setCart(createCartFromData(payload.cart));
    } catch {
      // Ignore and keep current cart state.
    }
  };

  const handleCheckoutSuccess = () => {
    setCart(createEmptyCart());
  };

  if (!routeData.found) {
    return (
      <>
        <PageTemplate
          currentPath={routeData.path}
          cartCount={cart.itemCount}
          title="Page Not Found"
          subtitle="This route does not exist yet."
        >
          <p>
            Try one of the available pages from the navigation above.
          </p>
        </PageTemplate>
        <div className="app-toast-region" aria-live="polite" aria-atomic="true">
          {activeToast ? (
            <AddedToCartToast
              productName={activeToast.productName}
              imageSrc={activeToast.imageSrc}
            />
          ) : null}
        </div>
      </>
    );
  }

  let page = null;

  switch (routeData.route) {
    case 'home':
      page = (
        <HomePage
          currentPath={ROUTES.HOME}
          cartCount={cart.itemCount}
          onAddToCart={handleAddToCart}
          recentlyAddedProductIds={recentlyAddedProductIds}
        />
      );
      break;
    case 'product':
      page = (
        <ProductPage
          currentPath={routeData.path}
          productId={routeData.params.productId}
          cartCount={cart.itemCount}
          onAddToCart={handleAddToCart}
          recentlyAddedProductIds={recentlyAddedProductIds}
        />
      );
      break;
    case 'cart':
      page = (
        <CartPage
          currentPath={ROUTES.CART}
          cartCount={cart.itemCount}
          cart={cart}
          onRemoveFromCart={handleRemoveFromCart}
          onCheckoutSuccess={handleCheckoutSuccess}
        />
      );
      break;
    case 'orders':
      page = <OrdersPage currentPath={ROUTES.ORDERS} cartCount={cart.itemCount} />;
      break;
    case 'orderConfirmation':
      page = (
        <OrderConfirmationPage
          currentPath={ROUTES.ORDER_CONFIRMATION}
          cartCount={cart.itemCount}
          orderNumber={routeData.params.orderNumber}
        />
      );
      break;
    default:
      page = null;
  }

  return (
    <>
      {page}
      <div className="app-toast-region" aria-live="polite" aria-atomic="true">
        {activeToast ? (
          <AddedToCartToast
            productName={activeToast.productName}
            imageSrc={activeToast.imageSrc}
          />
        ) : null}
      </div>
    </>
  );
}

export default App;