import express from 'express';
import { createOrder } from '../database/db.js';

const router = express.Router();

/**
 * POST /api/checkout
 * Create an order from a cart
 */
router.post('/', (req, res) => {
  const { customerName, customerEmail } = req.body || {};

  // Validate customerName
  if (typeof customerName !== 'string' || customerName.trim().length < 2) {
    return res.status(400).json({
      ok: false,
      error: {
        message: 'Field "customerName" is required and must be at least 2 characters.',
        code: 'INVALID_CUSTOMER_NAME',
      },
    });
  }

  // Validate customerEmail
  if (typeof customerEmail !== 'string' || !customerEmail.includes('@')) {
    return res.status(400).json({
      ok: false,
      error: {
        message: 'Field "customerEmail" is required and must be a valid email.',
        code: 'INVALID_CUSTOMER_EMAIL',
      },
    });
  }

  try {
    const receipt = createOrder({
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
    });

    return res.json({
      ok: true,
      receipt,
    });
  } catch (error) {
    // Handle known error codes
    if (error.code === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({
        ok: false,
        error: {
          message: error.message,
          code: 'PRODUCT_NOT_FOUND',
        },
      });
    }

    if (error.code === 'INSUFFICIENT_STOCK') {
      return res.status(400).json({
        ok: false,
        error: {
          message: error.message,
          code: 'INSUFFICIENT_STOCK',
        },
      });
    }

    if (error.code === 'CART_EMPTY') {
      return res.status(400).json({
        ok: false,
        error: {
          message: error.message,
          code: 'CART_EMPTY',
        },
      });
    }

    // Generic error
    return res.status(500).json({
      ok: false,
      error: {
        message: error.message || 'Failed to create order.',
        code: error.code || 'CHECKOUT_ERROR',
      },
    });
  }
});

export default router;
