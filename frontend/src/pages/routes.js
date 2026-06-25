import { useEffect, useState } from 'react';

export const ROUTES = {
  HOME: '/',
  CART: '/cart',
  ORDERS: '/orders',
  ORDER_CONFIRMATION: '/order-confirmation',
};

function parseQuery(queryString = '') {
  if (!queryString) {
    return {};
  }

  const searchParams = new URLSearchParams(queryString);
  const query = {};

  for (const [key, value] of searchParams.entries()) {
    if (typeof key === 'string' && key.length > 0) {
      query[key] = value;
    }
  }

  return query;
}

const STATIC_ROUTE_MAP = {
  [ROUTES.HOME]: 'home',
  [ROUTES.CART]: 'cart',
  [ROUTES.ORDERS]: 'orders',
  [ROUTES.ORDER_CONFIRMATION]: 'orderConfirmation',
};

const PRODUCT_ROUTE_PATTERN = /^\/products\/([^/]+)$/;

export function getProductPath(productId) {
  return `/products/${productId}`;
}

function normalizePath(path) {
  if (!path) {
    return ROUTES.HOME;
  }

  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
  return withLeadingSlash;
}

export function parseRoute(path) {
  const [rawPathname, rawQuery = ''] = (path || '').split('?');
  const normalizedPath = normalizePath(rawPathname);
  const query = parseQuery(rawQuery);
  const staticRoute = STATIC_ROUTE_MAP[normalizedPath];

  if (staticRoute) {
    return {
      path: normalizedPath,
      route: staticRoute,
      params: {
        orderNumber: query.order || '',
      },
      query,
      found: true,
    };
  }

  const productMatch = normalizedPath.match(PRODUCT_ROUTE_PATTERN);

  if (productMatch) {
    return {
      path: normalizedPath,
      route: 'product',
      params: {
        productId: decodeURIComponent(productMatch[1]),
      },
      query,
      found: true,
    };
  }

  return {
    path: normalizedPath,
    route: 'notFound',
    params: {},
    query,
    found: false,
  };
}

function getPathFromHash() {
  const hashValue = window.location.hash.replace(/^#/, '');
  return hashValue || ROUTES.HOME;
}

export function useHashRoute() {
  const [routeData, setRouteData] = useState(() => parseRoute(getPathFromHash()));

  useEffect(() => {
    const handleHashChange = () => {
      setRouteData(parseRoute(getPathFromHash()));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return routeData;
}
