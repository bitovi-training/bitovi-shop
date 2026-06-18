import express from 'express';
import { executeSql, getSchemaSummary, createProduct } from '../database/db.js';

const router = express.Router();

/**
 * GET /api/admin/schema
 * Get the database schema (table names, columns, row counts)
 */
router.get('/schema', (req, res) => {
  try {
    const schema = getSchemaSummary();
    return res.json({
      ok: true,
      schema,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: {
        message: error.message || 'Failed to fetch schema.',
        code: error.code || 'SCHEMA_FETCH_ERROR',
      },
    });
  }
});

/**
 * POST /api/admin/products
 * Create a new product
 */
router.post('/products', (req, res) => {
  const {
    slug,
    name,
    description,
    priceCents,
    imagePath,
    availableQuantity,
    inStock,
    widthCm,
    heightCm,
    depthCm,
    weightKg,
    deliveryWindow,
  } = req.body || {};

  try {
    const product = createProduct({
      slug,
      name,
      description,
      priceCents,
      imagePath,
      availableQuantity,
      inStock,
      widthCm,
      heightCm,
      depthCm,
      weightKg,
      deliveryWindow,
    });

    return res.status(201).json({
      ok: true,
      product,
    });
  } catch (error) {
    // Handle known error codes
    const status = error.code === 'DUPLICATE_SLUG' ? 409 : 400;
    return res.status(status).json({
      ok: false,
      error: {
        message: error.message || 'Failed to create product.',
        code: error.code || 'PRODUCT_CREATION_ERROR',
      },
    });
  }
});

/**
 * POST /api/admin/sql
 * Execute arbitrary SQL (demo-only, requires ENABLE_ADMIN_SQL=true)
 */
router.post('/sql', (req, res) => {
  const { sql } = req.body || {};

  if (typeof sql !== 'string' || sql.trim().length === 0) {
    return res.status(400).json({
      ok: false,
      error: {
        message: 'Field "sql" is required and must be a non-empty string.',
        code: 'INVALID_SQL',
      },
    });
  }

  try {
    const result = executeSql(sql.trim());
    return res.json({
      ok: true,
      result,
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error: {
        message: error.message || 'SQL execution failed.',
        code: error.code || 'SQL_EXECUTION_ERROR',
      },
    });
  }
});

export default router;
