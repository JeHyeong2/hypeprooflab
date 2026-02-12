import { test, expect } from '@playwright/test';

test.describe('SEO', () => {
  test.skip(({ }, testInfo) => testInfo.project.name !== 'desktop', 'desktop only');

  test('favicon loads', async ({ request }) => {
    const res = await request.get('/favicon.ico');
    expect(res.status()).toBe(200);
  });

  test('/feed.xml returns valid XML', async ({ request }) => {
    const res = await request.get('/feed.xml');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain('<?xml');
  });

  test('/sitemap.xml returns 200', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
  });

  test('column detail has JSON-LD', async ({ page }) => {
    await page.goto('/columns', { waitUntil: 'domcontentloaded' });
    await page.locator('a[href*="/columns/"]').first().click();
    await page.waitForLoadState('domcontentloaded');

    const jsonLd = page.locator('script[type="application/ld+json"]');
    expect(await jsonLd.count()).toBeGreaterThan(0);
  });

  test('column page has OG meta tags', async ({ page }) => {
    await page.goto('/columns', { waitUntil: 'domcontentloaded' });
    await page.locator('a[href*="/columns/"]').first().click();
    await page.waitForLoadState('domcontentloaded');

    const ogTitle = page.locator('meta[property="og:title"]');
    expect(await ogTitle.count()).toBeGreaterThan(0);
  });
});
