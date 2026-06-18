import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import {
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
} from './backendClient.js';

const server = new Server(
  {
    name: 'shop-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

const emptyInputSchema = {
  type: 'object',
  properties: {},
};

const positiveIntegerSchema = {
  type: 'integer',
  minimum: 1,
};

const toolDefinitions = [
  {
    name: 'get_products',
    description: 'List all products available in the storefront catalog.',
    inputSchema: emptyInputSchema,
  },
  {
    name: 'get_featured_product',
    description: 'Get the storefront featured product.',
    inputSchema: emptyInputSchema,
  },
  {
    name: 'get_product',
    description: 'Get a single product by numeric product ID. Pass { "productId": 1 }.',
    inputSchema: {
      type: 'object',
      properties: {
        productId: positiveIntegerSchema,
      },
      required: ['productId'],
    },
  },
  {
    name: 'get_cart',
    description: 'Read the current shared demo cart.',
    inputSchema: emptyInputSchema,
  },
  {
    name: 'add_cart_item',
    description: 'Add a product to the shared demo cart. Pass { "productId": 1, "quantity": 2 }.',
    inputSchema: {
      type: 'object',
      properties: {
        productId: positiveIntegerSchema,
        quantity: positiveIntegerSchema,
      },
      required: ['productId'],
    },
  },
  {
    name: 'remove_cart_item',
    description: 'Remove a product from the shared demo cart by product ID. Pass { "productId": 1 }.',
    inputSchema: {
      type: 'object',
      properties: {
        productId: positiveIntegerSchema,
      },
      required: ['productId'],
    },
  },
  {
    name: 'clear_cart',
    description: 'Remove all items from the shared demo cart.',
    inputSchema: emptyInputSchema,
  },
  {
    name: 'checkout',
    description: 'Create an order from the current cart. Pass { "customerName": "...", "customerEmail": "..." }.',
    inputSchema: {
      type: 'object',
      properties: {
        customerName: { type: 'string', minLength: 1 },
        customerEmail: { type: 'string', minLength: 1 },
      },
      required: ['customerName', 'customerEmail'],
    },
  },
  {
    name: 'get_orders',
    description: 'List recent orders. Optionally pass { "limit": 10 }.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: positiveIntegerSchema,
      },
    },
  },
  {
    name: 'get_order',
    description: 'Get a single order by order number. Pass { "orderNumber": "ORD-..." }.',
    inputSchema: {
      type: 'object',
      properties: {
        orderNumber: { type: 'string', minLength: 1 },
      },
      required: ['orderNumber'],
    },
  },
  {
    name: 'create_product',
    description: 'Create a product through the admin route. Pass slug, name, description, priceCents, imagePath, and optional inventory or dimension fields.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', minLength: 1 },
        name: { type: 'string', minLength: 1 },
        description: { type: 'string', minLength: 1 },
        priceCents: { type: 'integer' },
        imagePath: { type: 'string', minLength: 1 },
        availableQuantity: { type: 'integer' },
        widthCm: { type: 'number' },
        heightCm: { type: 'number' },
        depthCm: { type: 'number' },
        weightKg: { type: 'number' },
        deliveryWindow: { type: 'string' },
      },
      required: ['slug', 'name', 'description', 'priceCents', 'imagePath'],
    },
  },
  {
    name: 'upload_image',
    description: 'Validate and store image data through the upload route. Pass { "imageData": "data:image/png;base64,..." }.',
    inputSchema: {
      type: 'object',
      properties: {
        imageData: { type: 'string', minLength: 1 },
      },
      required: ['imageData'],
    },
  },
];

function asTextResult(payload) {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(payload, null, 2),
      },
    ],
    structuredContent: payload,
  };
}

function asErrorResult(error, fallbackMessage) {
  const message = error instanceof Error ? error.message : fallbackMessage;
  return {
    isError: true,
    content: [
      {
        type: 'text',
        text: message,
      },
    ],
  };
}

function requirePositiveInteger(value, fieldName) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Field "${fieldName}" must be a positive integer.`);
  }
}

function requireNonEmptyString(value, fieldName) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Field "${fieldName}" must be a non-empty string.`);
  }

  return value.trim();
}

function getArgumentsObject(value) {
  if (value === undefined) {
    return {};
  }

  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Tool arguments must be a JSON object.');
  }

  return value;
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: toolDefinitions,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const args = getArgumentsObject(request.params.arguments);

  switch (request.params.name) {
    case 'get_products':
      try {
        return asTextResult(await getProducts());
      } catch (error) {
        return asErrorResult(error, 'Failed to fetch products.');
      }

    case 'get_featured_product':
      try {
        return asTextResult(await getFeaturedProduct());
      } catch (error) {
        return asErrorResult(error, 'Failed to fetch featured product.');
      }

    case 'get_product':
      try {
        requirePositiveInteger(args.productId, 'productId');
        return asTextResult(await getProductById(args.productId));
      } catch (error) {
        return asErrorResult(error, 'Failed to fetch product.');
      }

    case 'get_cart':
      try {
        return asTextResult(await getCart());
      } catch (error) {
        return asErrorResult(error, 'Failed to fetch cart.');
      }

    case 'add_cart_item':
      try {
        requirePositiveInteger(args.productId, 'productId');

        const quantity = args.quantity === undefined ? 1 : args.quantity;
        requirePositiveInteger(quantity, 'quantity');

        return asTextResult(await addCartItem(args.productId, quantity));
      } catch (error) {
        return asErrorResult(error, 'Failed to add cart item.');
      }

    case 'remove_cart_item':
      try {
        requirePositiveInteger(args.productId, 'productId');
        return asTextResult(await removeCartItem(args.productId));
      } catch (error) {
        return asErrorResult(error, 'Failed to remove cart item.');
      }

    case 'clear_cart':
      try {
        return asTextResult(await clearCart());
      } catch (error) {
        return asErrorResult(error, 'Failed to clear cart.');
      }

    case 'checkout':
      try {
        const customerName = requireNonEmptyString(args.customerName, 'customerName');
        const customerEmail = requireNonEmptyString(args.customerEmail, 'customerEmail');

        return asTextResult(await checkout(customerName, customerEmail));
      } catch (error) {
        return asErrorResult(error, 'Failed to create order.');
      }

    case 'get_orders':
      try {
        if (args.limit !== undefined) {
          requirePositiveInteger(args.limit, 'limit');
        }

        return asTextResult(await getOrders(args.limit));
      } catch (error) {
        return asErrorResult(error, 'Failed to fetch orders.');
      }

    case 'get_order':
      try {
        const orderNumber = requireNonEmptyString(args.orderNumber, 'orderNumber');
        return asTextResult(await getOrderByNumber(orderNumber));
      } catch (error) {
        return asErrorResult(error, 'Failed to fetch order.');
      }

    case 'create_product':
      try {
        return asTextResult(await createProduct(args));
      } catch (error) {
        return asErrorResult(error, 'Failed to create product.');
      }

    case 'upload_image':
      try {
        const imageData = requireNonEmptyString(args.imageData, 'imageData');
        return asTextResult(await uploadImage(imageData));
      } catch (error) {
        return asErrorResult(error, 'Failed to upload image.');
      }

    default:
      return asErrorResult(new Error(`Tool not found: ${request.params.name}`), 'Tool not found.');
  }
});

async function start() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

start().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});