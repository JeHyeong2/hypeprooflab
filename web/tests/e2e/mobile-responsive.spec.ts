import { test, expect } from '@playwright/test';

test.describe('Mobile Responsive — no horizontal overflow', () => {
  const pages = [
    { name: 'Homepage', path: '/' },
    { name: 'Columns list', path: '/columns' },
    { name: 'Novels list', path: '/novels' },
    { name: 'My Activity', path: '/my-activity' },
  ];

  for (const { name, path } of pages) {
    test(`${name} — fits viewport @mobile`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      const fits = await page.evaluate(() => document.body.scrollWidth <= window.innerWidth);
      expect(fits, `${name} should not have horizontal scroll`).toBe(true);
    });
  }

  test('Column detail — fits viewport @mobile', async ({ page }) => {
    await page.goto('/columns', { waitUntil: 'domcontentloaded' });
    await page.locator('a[href*="/columns/"]').first().click();
    await page.waitForLoadState('domcontentloaded');
    const fits = await page.evaluate(() => document.body.scrollWidth <= window.innerWidth);
    expect(fits).toBe(true);
  });

  test('Novel detail — fits viewport @mobile', async ({ page }) => {
    await page.goto('/novels', { waitUntil: 'domcontentloaded' });
    const link = page.locator('a[href*="/novels/"]').first();
    if (await link.count() > 0) {
      await link.click();
      await page.waitForLoadState('domcontentloaded');
      const fits = await page.evaluate(() => document.body.scrollWidth <= window.innerWidth);
      expect(fits).toBe(true);
    }
  });
});
