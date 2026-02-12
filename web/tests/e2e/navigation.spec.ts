import { test, expect } from '@playwright/test';

test.describe('Navigation — Mobile', () => {
  test('hamburger opens mobile menu overlay @mobile', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('button[aria-label="Open navigation menu"]').click();
    const overlay = page.locator('#mobile-menu');
    await expect(overlay).toBeVisible();
    await expect(overlay).toHaveCSS('background-color', 'rgb(9, 9, 11)');
  });

  test('close button hides mobile menu @mobile', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('button[aria-label="Open navigation menu"]').click();
    await expect(page.locator('#mobile-menu')).toBeVisible();
    await page.locator('button[aria-label="Close navigation menu"]').click();
    await expect(page.locator('#mobile-menu')).not.toBeVisible();
  });

  test('language toggle in mobile menu @mobile', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('button[aria-label="Open navigation menu"]').click();
    await expect(page.locator('#mobile-menu button[aria-label="Switch to English"]')).toBeVisible();
    await expect(page.locator('#mobile-menu button[aria-label="한국어로 전환"]')).toBeVisible();
  });
});

test.describe('Navigation — Desktop', () => {
  test('logo links to homepage @desktop', async ({ page }) => {
    await page.goto('/columns', { waitUntil: 'domcontentloaded' });
    await page.locator('a >> text=HypeProof AI').first().click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('desktop nav links visible @desktop', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('nav').first()).toBeVisible();
  });

  test('language toggle present @desktop', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('button[aria-label="Switch to English"]').first()).toBeVisible();
  });
});

test.describe('Navigation — all nav links respond', () => {
  for (const route of ['/', '/columns', '/novels', '/my-activity']) {
    test(`${route} returns OK @all`, async ({ page }) => {
      const res = await page.goto(route);
      expect(res?.status()).toBeLessThan(400);
    });
  }
});
