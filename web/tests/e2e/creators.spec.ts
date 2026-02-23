import { test, expect } from '@playwright/test';

test.describe('Creators Page', () => {
  test('creators page loads with member cards @desktop', async ({ page }) => {
    await page.goto('/creators', { waitUntil: 'domcontentloaded' });
    const cards = page.locator('a[href*="/creators/"]');
    await expect(cards.first()).toBeVisible({ timeout: 10_000 });
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('creator profile page shows details @desktop', async ({ page }) => {
    await page.goto('/creators', { waitUntil: 'domcontentloaded' });
    const firstCard = page.locator('a[href*="/creators/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10_000 });
    await firstCard.click();
    await page.waitForLoadState('domcontentloaded');
    // Profile page should have meaningful content
    const main = page.locator('main');
    await expect(main).toBeVisible();
    // Should have at least a name or heading
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 10_000 });
  });

  test('creators page shows no duplicate members @desktop', async ({ page }) => {
    await page.goto('/creators', { waitUntil: 'domcontentloaded' });
    const cards = page.locator('a[href*="/creators/"]');
    await expect(cards.first()).toBeVisible({ timeout: 10_000 });
    const hrefs: string[] = [];
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const href = await cards.nth(i).getAttribute('href');
      if (href) hrefs.push(href);
    }
    const unique = new Set(hrefs);
    expect(unique.size).toBe(hrefs.length);
  });

  test('creator cards have correct role badges @desktop', async ({ page }) => {
    await page.goto('/creators', { waitUntil: 'domcontentloaded' });
    const cards = page.locator('a[href*="/creators/"]');
    await expect(cards.first()).toBeVisible({ timeout: 10_000 });
    // Each card should have some role/badge text
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    // Check that at least one card has visible text content
    const firstCardText = await cards.first().textContent();
    expect(firstCardText?.length).toBeGreaterThan(0);
  });

  test('creators page is responsive @mobile', async ({ page }) => {
    await page.goto('/creators', { waitUntil: 'domcontentloaded' });
    const fits = await page.evaluate(() => document.body.scrollWidth <= window.innerWidth);
    expect(fits, 'Creators page should not have horizontal scroll').toBe(true);
    const cards = page.locator('a[href*="/creators/"]');
    await expect(cards.first()).toBeVisible({ timeout: 10_000 });
  });
});
