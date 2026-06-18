import express from 'express';
import { getAllOrders, getOrderByNumber } from '../database/db.js';

const router = express.Router();

/**
 * GET /api/orders
 * List orders with optional limit
 */
router.get('/', (req, res) => {
  const parsedLimit = Number.parseInt(req.query.limit || '50', 10);
  const limit = Number.isInteger(parsedLimit) && parsedLimit > 0 ? parsedLimit : 50;

  try {
    const orders = getAllOrders(limit);
    return res.json({
      ok: true,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: {
        message: error.message || 'Failed to fetch orders.',
        code: error.code || 'ORDERS_FETCH_ERROR',
      },
    });
  }
});

/**
 * GET /api/orders/:orderNumber
 * Get a single order by order number
 */
router.get('/:orderNumber', (req, res) => {
  const orderNumber = req.params.orderNumber;

  if (typeof orderNumber !== 'string' || orderNumber.trim().length === 0) {
    return res.status(400).json({
      ok: false,
      error: {
        message: 'Order number is required.',
        code: 'INVALID_ORDER_NUMBER',
      },
    });
  }

  try {
    const result = getOrderByNumber(orderNumber.trim());

    if (!result) {
      return res.status(404).json({
        ok: false,
        error: {
          message: `Order with number "${orderNumber}" not found.`,
          code: 'ORDER_NOT_FOUND',
        },
      });
    }

    return res.json({
      ok: true,
      receipt: result,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: {
        message: error.message || 'Failed to fetch order.',
        code: error.code || 'ORDER_FETCH_ERROR',
      },
    });
  }
});

export default router;
