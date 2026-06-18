import express from 'express';

const router = express.Router();

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

/**
 * POST /api/upload
 * Upload an image as base64
 * 
 * Request body:
 * {
 *   "imageData": "data:image/png;base64,iVBORw0KGgoAAAANS..."
 * }
 * 
 * Response:
 * {
 *   "ok": true,
 *   "imageData": "data:image/png;base64,iVBORw0KGgoAAAANS..."
 * }
 */
router.post('/', (req, res) => {
  try {
    const { imageData } = req.body;

    if (!imageData) {
      return res.status(400).json({
        ok: false,
        error: {
          message: 'Missing imageData in request body.',
          code: 'MISSING_IMAGE_DATA',
        },
      });
    }

    if (typeof imageData !== 'string') {
      return res.status(400).json({
        ok: false,
        error: {
          message: 'imageData must be a string.',
          code: 'INVALID_IMAGE_DATA_TYPE',
        },
      });
    }

    // Validate data URI format
    const dataUriMatch = imageData.match(/^data:([^;]+);base64,(.+)$/);
    if (!dataUriMatch) {
      return res.status(400).json({
        ok: false,
        error: {
          message: 'imageData must be a valid data URI with base64 encoding.',
          code: 'INVALID_DATA_URI_FORMAT',
        },
      });
    }

    const [, mimeType, base64String] = dataUriMatch;

    // Validate MIME type
    if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      return res.status(400).json({
        ok: false,
        error: {
          message: `Image type "${mimeType}" is not allowed. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
          code: 'INVALID_IMAGE_TYPE',
        },
      });
    }

    // Validate file size (rough estimate: base64 is ~33% larger than binary)
    const estimatedSize = Math.ceil((base64String.length * 3) / 4);
    if (estimatedSize > MAX_IMAGE_SIZE) {
      return res.status(413).json({
        ok: false,
        error: {
          message: `Image size exceeds maximum of ${MAX_IMAGE_SIZE / 1024 / 1024}MB.`,
          code: 'IMAGE_TOO_LARGE',
        },
      });
    }

    return res.json({
      ok: true,
      imageData,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: {
        message: error.message || 'Failed to upload image.',
        code: error.code || 'UPLOAD_ERROR',
      },
    });
  }
});

export default router;
