import express from 'express';
import {
  getGlobalCart,
  addGlobalCartItem,
  removeGlobalCartItem,
  clearGlobalCart,
} from '../database/db.js';

const router = express.Router();

router.get('/', (_req, res) => {
  try {
    const cart = getGlobalCart();
    return res.json({ ok: true, cart });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: {
        message: error.message || 'Failed to load cart.',
        code: error.code || 'CART_READ_ERROR',
      },
    });
  }
});

router.post('/items', (req, res) => {
  const { productId, quantity = 1 } = req.body || {};

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({
      ok: false,
      error: {
        message: 'Field "productId" must be a positive integer.',
        code: 'INVALID_PRODUCT_ID',
      },
    });
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({
      ok: false,
      error: {
        message: 'Field "quantity" must be a positive integer.',
        code: 'INVALID_QUANTITY',
      },
    });
  }

  try {
    const cart = addGlobalCartItem(productId, quantity);
    return res.json({ ok: true, cart });
  } catch (error) {
    const status = error.code === 'PRODUCT_NOT_FOUND' ? 404 : 400;
    return res.status(status).json({
      ok: false,
      error: {
        message: error.message,
        code: error.code || 'CART_ADD_ERROR',
      },
    });
  }
});

router.delete('/items/:productId', (req, res) => {
  const productId = Number.parseInt(req.params.productId, 10);

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({
      ok: false,
      error: {
        message: 'Route param "productId" must be a positive integer.',
        code: 'INVALID_PRODUCT_ID',
      },
    });
  }

  try {
    const cart = removeGlobalCartItem(productId);
    return res.json({ ok: true, cart });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: {
        message: error.message || 'Failed to remove cart item.',
        code: error.code || 'CART_REMOVE_ERROR',
      },
    });
  }
});

router.delete('/', (_req, res) => {
  try {
    const cart = clearGlobalCart();
    return res.json({ ok: true, cart });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: {
        message: error.message || 'Failed to clear cart.',
        code: error.code || 'CART_CLEAR_ERROR',
      },
    });
  }
});

export default router;
