import { expect, test } from '@playwright/test';

async function addHomeProductToCart(page, index) {
  const addButtons = page.locator('.home-product-card__button');
  await expect(addButtons.nth(index)).toBeVisible();
  const productCard = addButtons.nth(index).locator('xpath=ancestor::article[1]');

  const productName = (await productCard.locator('h2').innerText()).trim();
  await addButtons.nth(index).click();

  return productName;
}

test.describe('Cart And Checkout Flows', () => {
  test.beforeEach(async ({ page, request }) => {
    await request.delete('/api/cart');
    await page.goto('/');
  });

  test('adds multiple items and combines quantity for duplicate adds', async ({ page }) => {
    const addButtons = page.locator('.home-product-card__button');
    await expect(addButtons.first()).toBeVisible();
    expect(await addButtons.count()).toBeGreaterThan(1);

    const firstProductName = await addHomeProductToCart(page, 0);
    const secondProductName = await addHomeProductToCart(page, 1);
    await addHomeProductToCart(page, 0);

    await page.getByRole('link', { name: /go to cart with/i }).click();

    const cartItems = page.locator('.cart-item');
    await expect(cartItems).toHaveCount(2);

    const firstProductCartItem = page.getByRole('article', { name: firstProductName });
    await expect(firstProductCartItem).toContainText('Qty 2');

    const secondProductCartItem = page.getByRole('article', { name: secondProductName });
    await expect(secondProductCartItem).toBeVisible();
  });

  test('removes an item from cart', async ({ page }) => {
    const addButtons = page.locator('.home-product-card__button');
    await expect(addButtons.first()).toBeVisible();
    expect(await addButtons.count()).toBeGreaterThan(1);

    const firstProductName = await addHomeProductToCart(page, 0);
    const secondProductName = await addHomeProductToCart(page, 1);

    await page.getByRole('link', { name: /go to cart with/i }).click();
    await expect(page.locator('.cart-item')).toHaveCount(2);

    await page.getByRole('button', { name: `Remove ${secondProductName} from cart` }).click();

    await expect(page.locator('.cart-item')).toHaveCount(1);
    await expect(page.getByRole('article', { name: secondProductName })).toHaveCount(0);
    await expect(page.getByRole('article', { name: firstProductName })).toBeVisible();
  });

  test('checks out and shows the new order in orders list', async ({ page }) => {
    const productName = await addHomeProductToCart(page, 0);
    const uniqueSuffix = Date.now();
    const customerName = `Playwright Customer ${uniqueSuffix}`;
    const customerEmail = `playwright-${uniqueSuffix}@example.com`;

    await page.getByRole('link', { name: /go to cart with/i }).click();

    await page.getByLabel('Name').fill(customerName);
    await page.getByLabel('Email').fill(customerEmail);
    await page.getByRole('button', { name: 'Place Order' }).click();

    await expect(page).toHaveURL(/#\/order-confirmation\?order=/);

    const orderNumberHeading = page.locator('.confirmation-card__order-number');
    await expect(orderNumberHeading).toBeVisible();
    const orderNumber = (await orderNumberHeading.innerText()).trim();
    expect(orderNumber).toMatch(/^ORD-/);

    await expect(page.locator('.confirmation-card')).toContainText(productName);

    await page.getByRole('button', { name: 'View all orders' }).click();
    await expect(page).toHaveURL(/#\/orders$/);

    const createdOrderCard = page.getByLabel(`Order ${orderNumber}`);
    await expect(createdOrderCard).toBeVisible();
    await expect(createdOrderCard).toContainText(customerName);
    await expect(createdOrderCard).toContainText(customerEmail);
  });
});