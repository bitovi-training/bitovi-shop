import express from 'express';
import productsRouter from './routes/products.js';
import cartRouter from './routes/cart.js';
import checkoutRouter from './routes/checkout.js';
import ordersRouter from './routes/orders.js';
import adminRouter from './routes/admin.js';
import uploadRouter from './routes/upload.js';
import { initializeDatabase } from './database/db.js';

const PORT = 3001;
const HOST = '127.0.0.1';
const ENABLE_ADMIN_SQL = process.env.ENABLE_ADMIN_SQL !== 'false';

async function startServer() {
  await initializeDatabase();

  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use('/api/upload', uploadRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/cart', cartRouter);
  app.use('/api/checkout', checkoutRouter);
  app.use('/api/orders', ordersRouter);

  if (ENABLE_ADMIN_SQL) {
    app.use('/api/admin', adminRouter);
  }

  app.listen(PORT, HOST, () => {
    console.log(`Server listening on http://${HOST}:${PORT}`);
    if (!ENABLE_ADMIN_SQL) {
      console.log('Admin SQL routes are disabled (ENABLE_ADMIN_SQL=false).');
    }
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});