import { expect, test } from '@playwright/test';

test.describe('Add To Cart Toast', () => {
  test('shows the most recently added product image and name', async ({ page }) => {
    await page.goto('/');

    const addButtons = page.locator('.home-product-card__button', { hasText: 'Add to cart' });
    await expect(addButtons.first()).toBeVisible();
    const availableButtonCount = await addButtons.count();
    expect(availableButtonCount).toBeGreaterThan(1);

    const firstButton = addButtons.nth(0);
    const secondButton = addButtons.nth(1);

    const firstCard = firstButton.locator('xpath=ancestor::article[1]');
    const secondCard = secondButton.locator('xpath=ancestor::article[1]');

    const secondProductName = (await secondCard.locator('h2').innerText()).trim();
    const secondProductImage = await secondCard.locator('img.home-product-card__image').getAttribute('src');
    expect(secondProductImage).toBeTruthy();

    await firstButton.click();
    await secondButton.click();

    const toast = page.getByTestId('added-to-cart-toast');
    await expect(toast).toBeVisible();
    await expect(page.getByTestId('added-to-cart-toast-product-name')).toHaveText(secondProductName);

    // Give delayed image updates time to settle so stale async updates are visible.
    await page.waitForTimeout(400);

    const toastImage = page.getByTestId('added-to-cart-toast-image');
    await expect(toastImage).toBeVisible();
    await expect(toastImage).toHaveAttribute('src', secondProductImage);
  });
});
