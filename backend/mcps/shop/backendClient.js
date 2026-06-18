const DEFAULT_BACKEND_URL = 'http://127.0.0.1:3001';
const DEFAULT_TIMEOUT_MS = Number(process.env.BACKEND_TIMEOUT_MS || 10000);

const backendBaseUrl = (process.env.TODO_APP_BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/$/, '');

function buildUrl(path, query = {}) {
  const url = new URL(`${backendBaseUrl}${path}`);

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  return url;
}

async function requestJson(path, init = {}, query) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(buildUrl(path, query), {
      ...init,
      signal: controller.signal,
      headers: {
        ...(init.body ? { 'content-type': 'application/json' } : {}),
        ...(init.headers || {}),
      },
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const message =
        payload && typeof payload === 'object' && 'error' in payload
          ? String(payload.error?.message || `Backend request failed with ${response.status}`)
          : `Backend request failed with ${response.status}`;

      throw new Error(message);
    }

    return payload;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Backend request timed out after ${DEFAULT_TIMEOUT_MS}ms.`);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function getProducts() {
  return requestJson('/api/products');
}

async function getFeaturedProduct() {
  return requestJson('/api/products/featured');
}

async function getProductById(productId) {
  return requestJson(`/api/products/${productId}`);
}

async function getCart() {
  return requestJson('/api/cart');
}

async function addCartItem(productId, quantity = 1) {
  return requestJson('/api/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });
}

async function removeCartItem(productId) {
  return requestJson(`/api/cart/items/${productId}`, {
    method: 'DELETE',
  });
}

async function clearCart() {
  return requestJson('/api/cart', {
    method: 'DELETE',
  });
}

async function checkout(customerName, customerEmail) {
  return requestJson('/api/checkout', {
    method: 'POST',
    body: JSON.stringify({ customerName, customerEmail }),
  });
}

async function getOrders(limit) {
  return requestJson('/api/orders', {}, { limit });
}

async function getOrderByNumber(orderNumber) {
  return requestJson(`/api/orders/${encodeURIComponent(orderNumber)}`);
}

async function createProduct(product) {
  return requestJson('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify(product),
  });
}

async function uploadImage(imageData) {
  return requestJson('/api/upload', {
    method: 'POST',
    body: JSON.stringify({ imageData }),
  });
}

export {
  addCartItem,
  checkout,
  clearCart,
  createProduct,
  getCart,
  getFeaturedProduct,
  getOrderByNumber,
  getOrders,
  getProductById,
  getProducts,
  removeCartItem,
  uploadImage,
};