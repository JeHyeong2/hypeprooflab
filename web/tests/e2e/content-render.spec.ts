import { test, expect } from '@playwright/test';

test.describe('Content Rendering', () => {
  test('homepage shows column cards @desktop', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const columnLinks = page.locator('a[href*="/columns/"]');
    await expect(columnLinks.first()).toBeVisible({ timeout: 10_000 });
    expect(await columnLinks.count()).toBeGreaterThan(0);
  });

  test('column detail renders markdown content @desktop', async ({ page }) => {
    await page.goto('/columns', { waitUntil: 'domcontentloaded' });
    await page.locator('a[href*="/columns/"]').first().click();
    await page.waitForLoadState('domcontentloaded');
    const hasContent = await page.locator('article, [class*="prose"], main').first().isVisible();
    expect(hasContent).toBe(true);
    expect(await page.locator('p').count()).toBeGreaterThan(0);
  });

  test('author images load @desktop', async ({ page }) => {
    await page.goto('/columns', { waitUntil: 'load' });
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < Math.min(count, 10); i++) {
      const img = images.nth(i);
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });

  test('no console errors on key pages @desktop', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    for (const path of ['/', '/columns', '/novels']) {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
    }

    const real = errors.filter(
      (e) =>
        !e.includes('favicon') &&
        !e.includes('third-party') &&
        !e.includes('Failed to load resource') &&
        !e.includes('Download the React DevTools') &&
        !e.includes('net::') &&
        !e.includes('404') &&
        !e.includes('authjs.dev') &&
        !e.includes('Failed to fetch')
    );
    expect(real, `Console errors: ${real.join('; ')}`).toHaveLength(0);
  });
});
