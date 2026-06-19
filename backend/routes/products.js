import express from 'express';
import { getAllProducts, searchProducts, getFeaturedProduct, getProductById } from '../database/db.js';

const router = express.Router();

/**
 * GET /api/products
 * List all products
 */
router.get('/', (req, res) => {
  try {
    const searchQuery = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const products = searchQuery ? searchProducts(searchQuery) : getAllProducts();
    return res.json({
      ok: true,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: {
        message: error.message || 'Failed to fetch products.',
        code: error.code || 'PRODUCTS_FETCH_ERROR',
      },
    });
  }
});

/**
 * GET /api/products/featured
 * Get featured product for a given slot (default: home_hero)
 */
router.get('/featured', (req, res) => {
  try {
    const product = getFeaturedProduct();

    if (!product) {
      return res.status(404).json({
        ok: false,
        error: {
          message: 'No featured product is currently configured.',
          code: 'FEATURED_PRODUCT_NOT_FOUND',
        },
      });
    }

    return res.json({
      ok: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: {
        message: error.message || 'Failed to fetch featured product.',
        code: error.code || 'FEATURED_PRODUCT_FETCH_ERROR',
      },
    });
  }
});

/**
 * GET /api/products/:id
 * Get a single product by ID
 */
router.get('/:id', (req, res) => {
  const id = Number.parseInt(req.params.id, 10);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      ok: false,
      error: {
        message: 'Product ID must be a positive integer.',
        code: 'INVALID_PRODUCT_ID',
      },
    });
  }

  try {
    const product = getProductById(id);

    if (!product) {
      return res.status(404).json({
        ok: false,
        error: {
          message: `Product with ID ${id} not found.`,
          code: 'PRODUCT_NOT_FOUND',
        },
      });
    }

    return res.json({
      ok: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: {
        message: error.message || 'Failed to fetch product.',
        code: error.code || 'PRODUCT_FETCH_ERROR',
      },
    });
  }
});

export default router;
