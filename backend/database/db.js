import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import initSqlJs from 'sql.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const SHOP_DB_PATH = path.join(__dirname, 'shop.db');
const LEGACY_DB_PATH = path.join(__dirname, 'todos.db');

let db;
let activeDbPath = SHOP_DB_PATH;
import DEMO_PRODUCTS_DATA from '../../shared/data/products.js';
import SITE_SETTINGS_DATA from '../../shared/data/siteSettings.js';
const DEMO_PRODUCT_SLUGS = DEMO_PRODUCTS_DATA.map((product) => product.slug);
const DEMO_PRODUCT_SLUG_PLACEHOLDERS = DEMO_PRODUCT_SLUGS.map(() => '?').join(', ');
const DEMO_CART_ID = 1;

function isImageDataUri(value) {
  return typeof value === 'string' && /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(value);
}

function isDatabaseInitialized() {
  return Boolean(db);
}

function mapProduct(row) {
  const availableQuantity = Number.isFinite(row.available_quantity)
    ? Math.max(0, Math.trunc(row.available_quantity))
    : (row.in_stock ? 1 : 0);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price_cents: row.price_cents,
    image_path: row.image_path,
    available_quantity: availableQuantity,
    in_stock: availableQuantity > 0,
    width_cm: row.width_cm,
    height_cm: row.height_cm,
    depth_cm: row.depth_cm,
    weight_kg: row.weight_kg,
    delivery_window: row.delivery_window,
    created_at: row.created_at,
  };
}

function mapOrder(row) {
  const taxRate = row.subtotal_cents > 0
    ? Math.round((row.tax_cents / row.subtotal_cents) * 100) / 100
    : 0;

  return {
    id: row.id,
    order_number: row.order_number,
    customer_name: row.customer_name,
    customer_email: row.customer_email,
    subtotal_cents: row.subtotal_cents,
    tax_cents: row.tax_cents,
    tax_rate: taxRate,
    total_cents: row.total_cents,
    created_at: row.created_at,
  };
}

function persist() {
  if (!db) {
    return;
  }

  const data = db.export();
  fs.writeFileSync(activeDbPath, Buffer.from(data));
}

function stripLeadingComments(sql) {
  let value = sql.trimStart();

  while (value.length > 0) {
    if (value.startsWith('--')) {
      const newlineIndex = value.indexOf('\n');
      value = newlineIndex === -1 ? '' : value.slice(newlineIndex + 1).trimStart();
      continue;
    }

    if (value.startsWith('/*')) {
      const endCommentIndex = value.indexOf('*/');
      if (endCommentIndex === -1) {
        return '';
      }
      value = value.slice(endCommentIndex + 2).trimStart();
      continue;
    }

    break;
  }

  return value;
}

function detectStatementType(sql) {
  const sanitized = stripLeadingComments(sql);
  if (!sanitized) {
    return 'unknown';
  }

  const match = sanitized.match(/^([a-zA-Z]+)/);
  return match ? match[1].toLowerCase() : 'unknown';
}

function isWriteStatement(statementType) {
  return new Set(['insert', 'update', 'delete', 'create', 'alter', 'drop', 'replace', 'truncate']).has(
    statementType,
  );
}

function normalizeExecResult(execResult) {
  if (!execResult || execResult.length === 0) {
    return {
      rows: [],
      columns: [],
      rowCount: 0,
    };
  }

  const [firstResult] = execResult;
  const columns = firstResult.columns || [];
  const values = firstResult.values || [];
  const rows = values.map((valueRow) =>
    columns.reduce((accumulator, column, index) => {
      accumulator[column] = valueRow[index];
      return accumulator;
    }, {}),
  );

  return {
    rows,
    columns,
    rowCount: rows.length,
  };
}

function executeSql(sql, params = []) {
  if (!isDatabaseInitialized()) {
    const error = new Error('Database is not initialized yet.');
    error.code = 'DATABASE_NOT_INITIALIZED';
    throw error;
  }

  if (typeof sql !== 'string' || sql.trim().length === 0) {
    const error = new Error('SQL must be a non-empty string.');
    error.code = 'INVALID_SQL';
    throw error;
  }

  if (!Array.isArray(params)) {
    const error = new Error('SQL params must be an array.');
    error.code = 'INVALID_PARAMS';
    throw error;
  }

  const statementType = detectStatementType(sql);
  const writeStatement = isWriteStatement(statementType);

  try {
    if (writeStatement) {
      db.run(sql, params);

      const rowCountResult = db.exec('SELECT changes() AS rowCount');
      const rowCount = rowCountResult?.[0]?.values?.[0]?.[0] ?? 0;

      persist();

      return {
        statementType,
        rows: [],
        rowCount,
        columns: [],
        persisted: true,
      };
    }

    const { rows, columns, rowCount } = normalizeExecResult(db.exec(sql, params));

    return {
      statementType,
      rows,
      rowCount,
      columns,
      persisted: false,
    };
  } catch (executionError) {
    const error = new Error(executionError.message || 'SQL execution failed.');
    error.code = 'SQL_EXECUTION_ERROR';
    throw error;
  }
}

function getSchemaSummary() {
  if (!isDatabaseInitialized()) {
    const error = new Error('Database is not initialized yet.');
    error.code = 'DATABASE_NOT_INITIALIZED';
    throw error;
  }

  const tablesResult = db.exec(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC",
  );
  const tableNames = tablesResult.length > 0 ? tablesResult[0].values.map((row) => row[0]) : [];

  const tables = tableNames.map((tableName) => {
    const columnRows = db.exec(`PRAGMA table_info(${JSON.stringify(tableName)})`);
    const columns =
      columnRows.length > 0
        ? columnRows[0].values.map((row) => ({
            name: row[1],
            type: row[2],
            notNull: Boolean(row[3]),
            pk: Boolean(row[5]),
          }))
        : [];

    const rowCountResult = db.exec(`SELECT COUNT(*) AS rowCount FROM ${JSON.stringify(tableName)}`);
    const rowCount = rowCountResult?.[0]?.values?.[0]?.[0] ?? 0;

    return {
      name: tableName,
      columns,
      rowCount,
    };
  });

  return {
    tables,
  };
}

function createSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price_cents INTEGER NOT NULL,
      image_path TEXT NOT NULL,
      available_quantity INTEGER NOT NULL DEFAULT 0,
      in_stock INTEGER NOT NULL DEFAULT 1,
      width_cm REAL,
      height_cm REAL,
      depth_cm REAL,
      weight_kg REAL,
      delivery_window TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS carts (
      id INTEGER PRIMARY KEY,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      cart_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      PRIMARY KEY (cart_id, product_id),
      FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      subtotal_cents INTEGER NOT NULL DEFAULT 0,
      tax_cents INTEGER NOT NULL DEFAULT 0,
      total_cents INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      unit_price_cents INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS product_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_slug TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      author TEXT NOT NULL,
      quote TEXT NOT NULL,
      stars INTEGER NOT NULL,
      UNIQUE(product_slug, sort_order)
    );
  `);
}

function removeOrdersPaymentMethodColumn() {
  const columnRows = db.exec('PRAGMA table_info(orders)');
  const orderColumns = columnRows.length > 0 ? columnRows[0].values.map((row) => row[1]) : [];

  if (!orderColumns.includes('payment_method')) {
    return;
  }

  db.run('PRAGMA foreign_keys = OFF');
  db.run('BEGIN');

  try {
    db.run(`
      CREATE TABLE orders_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT NOT NULL UNIQUE,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        subtotal_cents INTEGER NOT NULL DEFAULT 0,
        tax_cents INTEGER NOT NULL DEFAULT 0,
        total_cents INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    db.run(`
      INSERT INTO orders_new (
        id,
        order_number,
        customer_name,
        customer_email,
        subtotal_cents,
        tax_cents,
        total_cents,
        created_at
      )
      SELECT
        id,
        order_number,
        customer_name,
        customer_email,
        subtotal_cents,
        tax_cents,
        total_cents,
        created_at
      FROM orders
    `);

    db.run('DROP TABLE orders');
    db.run('ALTER TABLE orders_new RENAME TO orders');

    db.run('COMMIT');
    db.run('PRAGMA foreign_keys = ON');
    persist();
  } catch (error) {
    db.run('ROLLBACK');
    db.run('PRAGMA foreign_keys = ON');
    throw error;
  }
}

function ensureProductColumns() {
  const columnRows = db.exec('PRAGMA table_info(products)');
  const existingColumns = new Set(
    columnRows.length > 0 ? columnRows[0].values.map((row) => row[1]) : [],
  );

  const missingColumns = [
    { name: 'available_quantity', sqlType: 'INTEGER NOT NULL DEFAULT 0' },
    { name: 'width_cm', sqlType: 'REAL' },
    { name: 'height_cm', sqlType: 'REAL' },
    { name: 'depth_cm', sqlType: 'REAL' },
    { name: 'weight_kg', sqlType: 'REAL' },
    { name: 'delivery_window', sqlType: 'TEXT' },
  ].filter((column) => !existingColumns.has(column.name));

  if (missingColumns.length === 0) {
    return;
  }

  for (const column of missingColumns) {
    db.run(`ALTER TABLE products ADD COLUMN ${column.name} ${column.sqlType}`);
  }

  db.run(`
    UPDATE products
    SET available_quantity = CASE WHEN in_stock = 1 THEN 1 ELSE 0 END
    WHERE available_quantity IS NULL
  `);

  persist();
}

function syncDemoProducts() {
  if (DEMO_PRODUCT_SLUGS.length === 0) {
    return;
  }

  const stmt = db.prepare(
    `INSERT INTO products (
      slug,
      name,
      description,
      price_cents,
      image_path,
      available_quantity,
      in_stock,
      width_cm,
      height_cm,
      depth_cm,
      weight_kg,
      delivery_window
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      name = excluded.name,
      description = excluded.description,
      price_cents = excluded.price_cents,
      image_path = excluded.image_path,
      available_quantity = excluded.available_quantity,
      in_stock = excluded.in_stock,
      width_cm = excluded.width_cm,
      height_cm = excluded.height_cm,
      depth_cm = excluded.depth_cm,
      weight_kg = excluded.weight_kg,
      delivery_window = excluded.delivery_window`,
  );

  for (const product of DEMO_PRODUCTS_DATA) {
    const imageValue = product.imageData || product.imagePath;
    const availableQuantity = Number.isInteger(product.availableQuantity)
      ? Math.max(0, product.availableQuantity)
      : (product.inStock ? 1 : 0);

    if (!isImageDataUri(imageValue)) {
      throw new Error(`Seed product "${product.slug}" must provide imageData as a base64 data URI.`);
    }

    stmt.run([
      product.slug,
      product.name,
      product.description,
      product.priceCents,
      imageValue,
      availableQuantity,
      availableQuantity > 0 ? 1 : 0,
      product.widthCm,
      product.heightCm,
      product.depthCm,
      product.weightKg,
      product.deliveryWindow,
    ]);
  }

  stmt.free();
}

function syncSiteSettings() {
  const settings = Array.isArray(SITE_SETTINGS_DATA) ? SITE_SETTINGS_DATA : [];

  if (settings.length === 0) {
    return;
  }

  const stmt = db.prepare(
    `INSERT INTO site_settings (key, value, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET
       value = excluded.value,
       updated_at = datetime('now')`,
  );

  for (const setting of settings) {
    stmt.run([setting.key, setting.value]);
  }

  stmt.free();
  persist();
}

function ensureDemoCart() {
  db.run(
    `INSERT INTO carts (id, created_at, updated_at)
     VALUES (?, datetime('now'), datetime('now'))
     ON CONFLICT(id) DO NOTHING`,
    [DEMO_CART_ID],
  );
  persist();
}

function syncDemoProductReviews() {
  db.run('DELETE FROM product_reviews');

  const stmt = db.prepare(
    `INSERT INTO product_reviews (product_slug, sort_order, author, quote, stars)
     VALUES (?, ?, ?, ?, ?)`,
  );

  for (const product of DEMO_PRODUCTS_DATA) {
    const reviews = Array.isArray(product.reviews) ? product.reviews : [];
    reviews.forEach((review, index) => {
      stmt.run([product.slug, index + 1, review.author, review.quote, review.stars]);
    });
  }

  stmt.free();
  persist();
}

function resetDemoRuntimeData() {
  db.run('DELETE FROM cart_items');
  db.run('DELETE FROM order_items');
  db.run('DELETE FROM orders');
  db.run(`UPDATE carts SET updated_at = datetime('now') WHERE id = ?`, [DEMO_CART_ID]);
  persist();
}

function seedDemoOrders() {
  const seedOrders = [
    {
      customerName: 'Maya Chen',
      customerEmail: 'maya.chen@example.com',
      daysAgo: 14,
      items: [
        { slug: 'aero-bottle', quantity: 1 },
        { slug: 'daily-notebook', quantity: 2 },
      ],
    },
    {
      customerName: 'Diego Park',
      customerEmail: 'diego.park@example.com',
      daysAgo: 12,
      items: [
        { slug: 'sunset-mug', quantity: 2 },
      ],
    },
    {
      customerName: 'Maya Chen',
      customerEmail: 'maya.chen@example.com',
      daysAgo: 10,
      items: [
        { slug: 'desk-mat', quantity: 1 },
        { slug: 'aero-bottle', quantity: 1 },
      ],
    },
    {
      customerName: 'Sam Rivera',
      customerEmail: 'sam.rivera@example.com',
      daysAgo: 8,
      items: [
        { slug: 'mono-lamp', quantity: 1 },
      ],
    },
    {
      customerName: 'Priya Nair',
      customerEmail: 'priya.nair@example.com',
      daysAgo: 5,
      items: [
        { slug: 'daily-notebook', quantity: 3 },
        { slug: 'sunset-mug', quantity: 1 },
      ],
    },
    {
      customerName: 'Diego Park',
      customerEmail: 'diego.park@example.com',
      daysAgo: 3,
      items: [
        { slug: 'aero-bottle', quantity: 1 },
        { slug: 'desk-mat', quantity: 1 },
      ],
    },
    {
      customerName: 'Sam Rivera',
      customerEmail: 'sam.rivera@example.com',
      daysAgo: 1,
      items: [
        { slug: 'sunset-mug', quantity: 1 },
        { slug: 'daily-notebook', quantity: 1 },
      ],
    },
  ];

  const productResult = db.exec(
    `SELECT id, slug, name, price_cents
     FROM products
     WHERE slug IN (${DEMO_PRODUCT_SLUG_PLACEHOLDERS})`,
    DEMO_PRODUCT_SLUGS,
  );

  const productBySlug = new Map(
    (productResult.length === 0 ? [] : productResult[0].values).map((row) => [row[1], {
      id: row[0],
      slug: row[1],
      name: row[2],
      price_cents: row[3],
    }]),
  );

  const taxRate = getTaxRate();
  const nowMs = Date.now();

  const orderStmt = db.prepare(
    `INSERT INTO orders (
      order_number,
      customer_name,
      customer_email,
      subtotal_cents,
      tax_cents,
      total_cents,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );

  const itemStmt = db.prepare(
    `INSERT INTO order_items (order_id, product_id, product_name, unit_price_cents)
     VALUES (?, ?, ?, ?)`,
  );

  seedOrders.forEach((seedOrder, index) => {
    const expandedItems = seedOrder.items.flatMap((item) => {
      const product = productBySlug.get(item.slug);
      if (!product) {
        throw new Error(`Seed order references unknown product slug: ${item.slug}`);
      }

      const quantity = Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : 1;
      return Array.from({ length: quantity }, () => product);
    });

    const subtotalCents = expandedItems.reduce((sum, item) => sum + item.price_cents, 0);
    const taxCents = Math.round(subtotalCents * taxRate);
    const totalCents = subtotalCents + taxCents;
    const createdAt = new Date(nowMs - (seedOrder.daysAgo * 24 * 60 * 60 * 1000)).toISOString();
    const orderNumber = `ORD-${new Date(createdAt).getTime() + index}`;

    orderStmt.run([
      orderNumber,
      seedOrder.customerName,
      seedOrder.customerEmail,
      subtotalCents,
      taxCents,
      totalCents,
      createdAt,
    ]);

    const orderIdResult = db.exec('SELECT last_insert_rowid() AS id');
    const orderId = orderIdResult?.[0]?.values?.[0]?.[0];

    expandedItems.forEach((item) => {
      itemStmt.run([orderId, item.id, item.name, item.price_cents]);
    });
  });

  orderStmt.free();
  itemStmt.free();
  persist();
}

async function initializeDatabase() {
  const SQL = await initSqlJs({
    locateFile: (file) => path.join(ROOT_DIR, 'node_modules', 'sql.js', 'dist', file),
  });

  if (!fs.existsSync(SHOP_DB_PATH) && fs.existsSync(LEGACY_DB_PATH)) {
    fs.copyFileSync(LEGACY_DB_PATH, SHOP_DB_PATH);
  }

  if (fs.existsSync(SHOP_DB_PATH)) {
    activeDbPath = SHOP_DB_PATH;
    db = new SQL.Database(fs.readFileSync(SHOP_DB_PATH));
  } else {
    activeDbPath = SHOP_DB_PATH;
    db = new SQL.Database();
  }

  createSchema();
  removeOrdersPaymentMethodColumn();
  ensureProductColumns();
  syncDemoProducts();
  syncSiteSettings();
  ensureDemoCart();
  syncDemoProductReviews();
  resetDemoRuntimeData();
  seedDemoOrders();
}

function mapCartRowToPayload(cartRow, itemRows) {
  const items = itemRows.map((itemRow) => ({
    productId: itemRow.product_id,
    productName: itemRow.product_name,
    unitPriceCents: itemRow.unit_price_cents,
    quantity: itemRow.quantity,
    image: itemRow.image_path,
    lineTotalCents: itemRow.unit_price_cents * itemRow.quantity,
    unitPrice: itemRow.unit_price_cents / 100,
    lineTotal: (itemRow.unit_price_cents * itemRow.quantity) / 100,
  }));

  const subtotalCents = items.reduce((sum, item) => sum + item.lineTotalCents, 0);
  const taxRate = getTaxRate();
  const taxCents = Math.round(subtotalCents * taxRate);
  const totalCents = subtotalCents + taxCents;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: DEMO_CART_ID,
    items,
    subtotalCents,
    subtotal: subtotalCents / 100,
    taxRate,
    taxCents,
    tax: taxCents / 100,
    totalCents,
    total: totalCents / 100,
    itemCount,
    createdAt: cartRow?.created_at || new Date().toISOString(),
  };
}

function getGlobalCart() {
  ensureDemoCart();

  const cartResult = db.exec(
    `SELECT id, created_at, updated_at
     FROM carts
     WHERE id = ?
     LIMIT 1`,
    [DEMO_CART_ID],
  );

  const cartRow = cartResult?.[0]?.values?.[0]
    ? {
        id: cartResult[0].values[0][0],
        created_at: cartResult[0].values[0][1],
        updated_at: cartResult[0].values[0][2],
      }
    : { id: DEMO_CART_ID, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };

  const itemsResult = db.exec(
    `SELECT ci.product_id, p.name AS product_name, p.price_cents AS unit_price_cents, ci.quantity, p.image_path
     FROM cart_items ci
     INNER JOIN products p ON p.id = ci.product_id
     WHERE ci.cart_id = ?
     ORDER BY ci.product_id ASC`,
    [DEMO_CART_ID],
  );

  const itemRows = itemsResult.length === 0
    ? []
    : itemsResult[0].values.map((valueRow) => ({
        product_id: valueRow[0],
        product_name: valueRow[1],
        unit_price_cents: valueRow[2],
        quantity: valueRow[3],
        image_path: valueRow[4],
      }));

  return mapCartRowToPayload(cartRow, itemRows);
}

function addGlobalCartItem(productId, quantity = 1) {
  if (!Number.isInteger(productId) || productId <= 0) {
    const error = new Error('Invalid product id.');
    error.code = 'INVALID_PRODUCT_ID';
    throw error;
  }

  const safeQuantity = Number.isInteger(quantity) && quantity > 0 ? quantity : 1;

  ensureDemoCart();

  const productResult = db.exec(
    `SELECT id, name, available_quantity
     FROM products
     WHERE id = ?
     LIMIT 1`,
    [productId],
  );

  if (productResult.length === 0 || productResult[0].values.length === 0) {
    const error = new Error('One or more products were not found.');
    error.code = 'PRODUCT_NOT_FOUND';
    throw error;
  }

  const availableQuantity = Math.max(0, Math.trunc(productResult[0].values[0][2] ?? 0));
  if (availableQuantity <= 0) {
    const error = new Error(`Product "${productResult[0].values[0][1]}" is out of stock.`);
    error.code = 'INSUFFICIENT_STOCK';
    throw error;
  }

  db.run(
    `INSERT INTO cart_items (cart_id, product_id, quantity)
     VALUES (?, ?, ?)
     ON CONFLICT(cart_id, product_id) DO UPDATE SET
       quantity = cart_items.quantity + excluded.quantity`,
    [DEMO_CART_ID, productId, safeQuantity],
  );
  db.run(`UPDATE carts SET updated_at = datetime('now') WHERE id = ?`, [DEMO_CART_ID]);
  persist();

  return getGlobalCart();
}

function removeGlobalCartItem(productId) {
  if (!Number.isInteger(productId) || productId <= 0) {
    const error = new Error('Invalid product id.');
    error.code = 'INVALID_PRODUCT_ID';
    throw error;
  }

  ensureDemoCart();
  db.run(`DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?`, [DEMO_CART_ID, productId]);
  db.run(`UPDATE carts SET updated_at = datetime('now') WHERE id = ?`, [DEMO_CART_ID]);
  persist();
  return getGlobalCart();
}

function clearGlobalCart() {
  ensureDemoCart();
  db.run(`DELETE FROM cart_items WHERE cart_id = ?`, [DEMO_CART_ID]);
  db.run(`UPDATE carts SET updated_at = datetime('now') WHERE id = ?`, [DEMO_CART_ID]);
  persist();
  return getGlobalCart();
}

const PRODUCT_SELECT_COLUMNS = `
  id,
  slug,
  name,
  description,
  price_cents,
  image_path,
  available_quantity,
  in_stock,
  width_cm,
  height_cm,
  depth_cm,
  weight_kg,
  delivery_window,
  created_at`;

function mapProductQueryResult(result) {
  if (result.length === 0) {
    return [];
  }

  const [query] = result;
  return query.values.map((valueRow) => {
    const row = query.columns.reduce((accumulator, column, index) => {
      accumulator[column] = valueRow[index];
      return accumulator;
    }, {});

    return mapProduct(row);
  });
}

function getAllProducts() {
  const result = db.exec(
    `SELECT ${PRODUCT_SELECT_COLUMNS}
     FROM products
     ORDER BY id ASC`,
  );

  return mapProductQueryResult(result);
}

function searchProducts(query) {
  const pattern = `%${query.toLowerCase()}%`;
  const result = db.exec(
    `SELECT ${PRODUCT_SELECT_COLUMNS}
     FROM products
     WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ?
     ORDER BY id ASC`,
    [pattern, pattern],
  );

  return mapProductQueryResult(result);
}

function getProductById(productId) {
  const result = db.exec(
    `SELECT
      id,
      slug,
      name,
      description,
      price_cents,
      image_path,
      available_quantity,
      in_stock,
      width_cm,
      height_cm,
      depth_cm,
      weight_kg,
      delivery_window,
      created_at
     FROM products
     WHERE id = ?
     LIMIT 1`,
    [productId],
  );

  if (result.length === 0 || result[0].values.length === 0) {
    return null;
  }

  const [query] = result;
  const row = query.columns.reduce((accumulator, column, index) => {
    accumulator[column] = query.values[0][index];
    return accumulator;
  }, {});

  const product = mapProduct(row);
  const reviewResult = db.exec(
    `SELECT id, author, quote, stars
     FROM product_reviews
     WHERE product_slug = ?
     ORDER BY sort_order ASC, id ASC`,
    [product.slug],
  );

  const reviews = reviewResult.length === 0
    ? []
    : reviewResult[0].values.map((valueRow) => ({
        id: `${product.id}-${valueRow[0]}`,
        author: valueRow[1],
        quote: valueRow[2],
        stars: valueRow[3],
      }));

  return {
    ...product,
    reviews,
  };
}

function getTaxRate() {
  const result = db.exec(
    `SELECT value FROM site_settings WHERE key = 'tax_rate' LIMIT 1`,
  );

  if (result.length === 0 || result[0].values.length === 0) {
    return 0;
  }

  const rateValue = result[0].values[0][0];
  const parsed = Number.parseFloat(rateValue);
  return Number.isFinite(parsed) ? parsed : 0;
}

function createOrder({ customerName, customerEmail, productIds }) {
  const resolvedProductIds = Array.isArray(productIds)
    ? productIds
    : (() => {
        const cartItemsResult = db.exec(
          `SELECT product_id, quantity
           FROM cart_items
           WHERE cart_id = ?`,
          [DEMO_CART_ID],
        );

        if (cartItemsResult.length === 0 || cartItemsResult[0].values.length === 0) {
          return [];
        }

        return cartItemsResult[0].values.flatMap((row) =>
          Array.from({ length: Math.max(0, Math.trunc(row[1] ?? 0)) }, () => row[0]),
        );
      })();

  if (!Array.isArray(resolvedProductIds) || resolvedProductIds.length === 0) {
    const error = new Error('Cart cannot be empty.');
    error.code = 'CART_EMPTY';
    throw error;
  }

  const requestedQuantityById = resolvedProductIds.reduce((accumulator, productId) => {
    accumulator[productId] = (accumulator[productId] || 0) + 1;
    return accumulator;
  }, {});

  const uniqueIds = Object.keys(requestedQuantityById).map((id) => Number.parseInt(id, 10));
  const placeholders = uniqueIds.map(() => '?').join(', ');

  const productResult = db.exec(
    `SELECT id, name, price_cents, available_quantity
     FROM products
     WHERE id IN (${placeholders})`,
    uniqueIds,
  );

  const loadedProducts = productResult.length === 0 ? [] : productResult[0].values.map((valueRow) => ({
    id: valueRow[0],
    name: valueRow[1],
    price_cents: valueRow[2],
    available_quantity: Math.max(0, Math.trunc(valueRow[3] ?? 0)),
  }));

  if (loadedProducts.length !== uniqueIds.length) {
    const error = new Error('One or more products were not found.');
    error.code = 'PRODUCT_NOT_FOUND';
    throw error;
  }

  const outOfStock = loadedProducts.find((item) => {
    const requestedQuantity = requestedQuantityById[item.id] || 0;
    return item.available_quantity < requestedQuantity;
  });
  if (outOfStock) {
    const error = new Error(`Product "${outOfStock.name}" is out of stock.`);
    error.code = 'INSUFFICIENT_STOCK';
    throw error;
  }

  const lineItems = loadedProducts.map((product) => {
    const quantity = requestedQuantityById[product.id] || 0;
    return {
      ...product,
      quantity,
    };
  });

  const subtotalCents = lineItems.reduce((sum, item) => sum + (item.price_cents * item.quantity), 0);
  const taxRate = getTaxRate();
  const taxCents = Math.round(subtotalCents * taxRate);
  const totalCents = subtotalCents + taxCents;
  const orderNumber = `ORD-${Date.now()}`;

  db.run('BEGIN');

  try {
    db.run(
      `INSERT INTO orders (order_number, customer_name, customer_email, subtotal_cents, tax_cents, total_cents)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [orderNumber, customerName, customerEmail, subtotalCents, taxCents, totalCents],
    );

    const orderIdResult = db.exec('SELECT last_insert_rowid() AS id');
    const orderId = orderIdResult?.[0]?.values?.[0]?.[0];

    const itemStmt = db.prepare(
      `INSERT INTO order_items (order_id, product_id, product_name, unit_price_cents)
       VALUES (?, ?, ?, ?)`,
    );

    for (const item of lineItems) {
      for (let index = 0; index < item.quantity; index += 1) {
        itemStmt.run([orderId, item.id, item.name, item.price_cents]);
      }
    }

    itemStmt.free();

    const stockStmt = db.prepare(
      `UPDATE products
       SET available_quantity = CASE
         WHEN available_quantity > ? THEN available_quantity - ?
         ELSE 0
       END,
       in_stock = CASE
         WHEN available_quantity > ? THEN 1
         ELSE 0
       END
       WHERE id = ?`,
    );

    for (const item of lineItems) {
      stockStmt.run([item.quantity, item.quantity, item.quantity, item.id]);
    }

    stockStmt.free();

    db.run(`DELETE FROM cart_items WHERE cart_id = ?`, [DEMO_CART_ID]);
    db.run(`UPDATE carts SET updated_at = datetime('now') WHERE id = ?`, [DEMO_CART_ID]);

    db.run('COMMIT');
    persist();

    const createdOrder = db.exec(
      `SELECT id, order_number, customer_name, customer_email, subtotal_cents, tax_cents, total_cents, created_at
       FROM orders
       WHERE id = ?
       LIMIT 1`,
      [orderId],
    );

    const [query] = createdOrder;
    const orderRow = query.columns.reduce((accumulator, column, index) => {
      accumulator[column] = query.values[0][index];
      return accumulator;
    }, {});

    return {
      order: mapOrder(orderRow),
      items: lineItems.map((item) => ({
        product_id: item.id,
        product_name: item.name,
        unit_price_cents: item.price_cents,
        quantity: item.quantity,
      })),
    };
  } catch (error) {
    db.run('ROLLBACK');
    throw error;
  }
}

function getFeaturedProduct() {
  const slugResult = db.exec(
    `SELECT value FROM site_settings WHERE key = 'featured_product_slug' LIMIT 1`,
  );

  if (slugResult.length === 0 || slugResult[0].values.length === 0) {
    return null;
  }

  const productSlug = slugResult[0].values[0][0];

  const result = db.exec(
    `SELECT
      id,
      slug,
      name,
      description,
      price_cents,
      image_path,
      available_quantity,
      in_stock,
      width_cm,
      height_cm,
      depth_cm,
      weight_kg,
      delivery_window,
      created_at
     FROM products
     WHERE slug = ?
     LIMIT 1`,
    [productSlug],
  );

  if (result.length === 0 || result[0].values.length === 0) {
    return null;
  }

  const [query] = result;
  const row = query.columns.reduce((accumulator, column, index) => {
    accumulator[column] = query.values[0][index];
    return accumulator;
  }, {});

  return mapProduct(row);
}

function getOrderByNumber(orderNumber) {
  const orderResult = db.exec(
    `SELECT id, order_number, customer_name, customer_email, subtotal_cents, tax_cents, total_cents, created_at
     FROM orders
     WHERE order_number = ?
     LIMIT 1`,
    [orderNumber],
  );

  if (orderResult.length === 0 || orderResult[0].values.length === 0) {
    return null;
  }

  const [orderQuery] = orderResult;
  const orderRow = orderQuery.columns.reduce((accumulator, column, index) => {
    accumulator[column] = orderQuery.values[0][index];
    return accumulator;
  }, {});

  const itemsResult = db.exec(
    `SELECT product_id, product_name, unit_price_cents
     FROM order_items
     WHERE order_id = ?
     ORDER BY id ASC`,
    [orderRow.id],
  );

  const items = itemsResult.length === 0
    ? []
    : itemsResult[0].values.map((valueRow) => ({
        product_id: valueRow[0],
        product_name: valueRow[1],
        unit_price_cents: valueRow[2],
      }));

  return {
    order: mapOrder(orderRow),
    items,
  };
}

function getAllOrders(limit = 50) {
  const safeLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 200) : 50;
  const ordersResult = db.exec(
    `SELECT id, order_number, customer_name, customer_email, subtotal_cents, tax_cents, total_cents, created_at
     FROM orders
     ORDER BY id DESC
     LIMIT ?`,
    [safeLimit],
  );

  if (ordersResult.length === 0 || ordersResult[0].values.length === 0) {
    return [];
  }

  const [ordersQuery] = ordersResult;
  return ordersQuery.values.map((valueRow) => {
    const orderRow = ordersQuery.columns.reduce((accumulator, column, index) => {
      accumulator[column] = valueRow[index];
      return accumulator;
    }, {});

    const itemsResult = db.exec(
      `SELECT product_id, product_name, unit_price_cents
       FROM order_items
       WHERE order_id = ?
       ORDER BY id ASC`,
      [orderRow.id],
    );

    const items = itemsResult.length === 0
      ? []
      : itemsResult[0].values.map((itemRow) => ({
          product_id: itemRow[0],
          product_name: itemRow[1],
          unit_price_cents: itemRow[2],
        }));

    return {
      order: mapOrder(orderRow),
      items,
    };
  });
}

function createProduct(productData) {
  const {
    slug,
    name,
    description,
    priceCents,
    imagePath,
    availableQuantity = null,
    inStock = true,
    widthCm = null,
    heightCm = null,
    depthCm = null,
    weightKg = null,
    deliveryWindow = null,
  } = productData;

  // Validate required fields
  if (typeof slug !== 'string' || slug.trim().length === 0) {
    const error = new Error('Field "slug" is required.');
    error.code = 'INVALID_PRODUCT_SLUG';
    throw error;
  }

  if (typeof name !== 'string' || name.trim().length === 0) {
    const error = new Error('Field "name" is required.');
    error.code = 'INVALID_PRODUCT_NAME';
    throw error;
  }

  if (typeof description !== 'string' || description.trim().length === 0) {
    const error = new Error('Field "description" is required.');
    error.code = 'INVALID_PRODUCT_DESCRIPTION';
    throw error;
  }

  if (!Number.isInteger(priceCents) || priceCents < 0) {
    const error = new Error('Field "priceCents" must be a non-negative integer.');
    error.code = 'INVALID_PRICE';
    throw error;
  }

  if (typeof imagePath !== 'string' || imagePath.trim().length === 0) {
    const error = new Error('Field "imagePath" is required.');
    error.code = 'INVALID_IMAGE_PATH';
    throw error;
  }

  let resolvedAvailableQuantity = null;
  if (availableQuantity !== null && availableQuantity !== undefined) {
    const parsedQuantity = Number(availableQuantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      const error = new Error('Field "availableQuantity" must be a non-negative integer.');
      error.code = 'INVALID_AVAILABLE_QUANTITY';
      throw error;
    }
    resolvedAvailableQuantity = parsedQuantity;
  } else {
    resolvedAvailableQuantity = inStock ? 1 : 0;
  }

  try {
    db.run(
      `INSERT INTO products (
        slug, name, description, price_cents, image_path, available_quantity, in_stock,
        width_cm, height_cm, depth_cm, weight_kg, delivery_window
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug.trim(),
        name.trim(),
        description.trim(),
        priceCents,
        imagePath.trim(),
        resolvedAvailableQuantity,
        resolvedAvailableQuantity > 0 ? 1 : 0,
        widthCm,
        heightCm,
        depthCm,
        weightKg,
        deliveryWindow ? deliveryWindow.trim() : null,
      ],
    );

    persist();

    // Fetch and return the created product by slug (guaranteed unique)
    const productResult = db.exec(
      `SELECT
        id,
        slug,
        name,
        description,
        price_cents,
        image_path,
        available_quantity,
        in_stock,
        width_cm,
        height_cm,
        depth_cm,
        weight_kg,
        delivery_window,
        created_at
       FROM products
       WHERE slug = ?
       LIMIT 1`,
      [slug.trim()],
    );

    if (!productResult || productResult.length === 0 || productResult[0].values.length === 0) {
      const error = new Error('Failed to retrieve created product.');
      error.code = 'PRODUCT_CREATION_FAILED';
      throw error;
    }

    const [query] = productResult;
    const row = query.columns.reduce((accumulator, column, index) => {
      accumulator[column] = query.values[0][index];
      return accumulator;
    }, {});

    const product = mapProduct(row);

    // Fetch reviews for this product
    const reviewResult = db.exec(
      `SELECT id, author, quote, stars
       FROM product_reviews
       WHERE product_slug = ?
       ORDER BY sort_order ASC, id ASC`,
      [product.slug],
    );

    const reviews = reviewResult.length === 0
      ? []
      : reviewResult[0].values.map((valueRow) => ({
          id: `${product.id}-${valueRow[0]}`,
          author: valueRow[1],
          quote: valueRow[2],
          stars: valueRow[3],
        }));

    return {
      ...product,
      reviews,
    };
  } catch (error) {
    // Handle constraint violation for duplicate slug
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      const uniqueError = new Error(`Product with slug "${slug}" already exists.`);
      uniqueError.code = 'DUPLICATE_SLUG';
      throw uniqueError;
    }

    throw error;
  }
}

export {
  initializeDatabase,
  isDatabaseInitialized,
  executeSql,
  getSchemaSummary,
  getAllProducts,
  searchProducts,
  getFeaturedProduct,
  getProductById,
  getGlobalCart,
  addGlobalCartItem,
  removeGlobalCartItem,
  clearGlobalCart,
  createProduct,
  createOrder,
  getOrderByNumber,
  getAllOrders,
};