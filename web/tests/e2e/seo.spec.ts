import { test, expect } from '@playwright/test';

test.describe('SEO', () => {
  test('favicon loads @desktop', async ({ request }) => {
    const res = await request.get('/favicon.ico');
    expect(res.status()).toBe(200);
  });

  test('/feed.xml returns valid XML @desktop', async ({ request }) => {
    const res = await request.get('/feed.xml');
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain('<?xml');
  });

  test('/sitemap.xml returns 200 @desktop', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
  });

  test('column detail has JSON-LD @desktop', async ({ page }) => {
    await page.goto('/columns', { waitUntil: 'domcontentloaded' });
    await page.locator('a[href*="/columns/"]').first().click();
    await page.waitForLoadState('domcontentloaded');
    expect(await page.locator('script[type="application/ld+json"]').count()).toBeGreaterThan(0);
  });

  test('column page has OG meta tags @desktop', async ({ page }) => {
    await page.goto('/columns', { waitUntil: 'domcontentloaded' });
    await page.locator('a[href*="/columns/"]').first().click();
    await page.waitForLoadState('domcontentloaded');
    expect(await page.locator('meta[property="og:title"]').count()).toBeGreaterThan(0);
  });
});
