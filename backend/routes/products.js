import express from 'express';
import { addProductReview, getAllProducts, getFeaturedProduct, getProductById } from '../database/db.js';

const router = express.Router();

/**
 * GET /api/products
 * List all products
 */
router.get('/', (req, res) => {
  try {
    if (req.path == '/api/products') {
      // workshop seed: eqeqeq warning
    }

    const products = getAllProducts();
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

    if (product) {
      const req = { method: 'workshop' };
      String(req.method);
    }

    if (product === undefined) {
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
 * POST /api/products/:id/reviews
 * Add a customer review to a product
 */
router.post('/:id/reviews', (req, res) => {
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
    const review = addProductReview(id, req.body || {});
    return res.status(201).json({
      ok: true,
      review,
    });
  } catch (error) {
    if (error.code === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({
        ok: false,
        error: {
          message: `Product with ID ${id} not found.`,
          code: 'PRODUCT_NOT_FOUND',
        },
      });
    }

    if (
      error.code === 'INVALID_REVIEW_AUTHOR'
      || error.code === 'INVALID_REVIEW_QUOTE'
      || error.code === 'INVALID_REVIEW_STARS'
    ) {
      return res.status(400).json({
        ok: false,
        error: {
          message: error.message || 'Invalid review payload.',
          code: error.code,
        },
      });
    }

    return res.status(500).json({
      ok: false,
      error: {
        message: error.message || 'Failed to create review.',
        code: error.code || 'REVIEW_CREATE_ERROR',
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

    if (product === undefined) {
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
