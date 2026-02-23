import { test, expect } from '@playwright/test';

test.describe('New Columns & Multiagent', () => {
  test('multiagent column renders with full content @desktop', async ({ page }) => {
    await page.goto('/columns/building-ai-content-platform', { waitUntil: 'domcontentloaded' });
    const article = page.locator('article, [class*="prose"], main').first();
    await expect(article).toBeVisible({ timeout: 10_000 });
    expect(await page.locator('p').count()).toBeGreaterThan(3);
    // Should have structured headings for multi-agent content
    expect(await page.locator('h1, h2, h3').count()).toBeGreaterThan(0);
  });

  test('openclaw tutorial column loads @desktop', async ({ page }) => {
    await page.goto('/columns/building-ai-assistant-with-openclaw', { waitUntil: 'domcontentloaded' });
    const article = page.locator('article, [class*="prose"], main').first();
    await expect(article).toBeVisible({ timeout: 10_000 });
    expect(await page.locator('p').count()).toBeGreaterThan(2);
  });

  test('geo qa research column loads @desktop', async ({ page }) => {
    await page.goto('/columns/ai-scores-your-writing-geo-qa', { waitUntil: 'domcontentloaded' });
    const article = page.locator('article, [class*="prose"], main').first();
    await expect(article).toBeVisible({ timeout: 10_000 });
    expect(await page.locator('p').count()).toBeGreaterThan(2);
  });

  test('column pages have correct metadata @desktop', async ({ page }) => {
    await page.goto('/columns/building-ai-assistant-with-openclaw', { waitUntil: 'domcontentloaded' });
    const ogTitle = page.locator('meta[property="og:title"]');
    expect(await ogTitle.count()).toBeGreaterThan(0);
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('columns list shows all 12 columns @desktop', async ({ page }) => {
    await page.goto('/columns', { waitUntil: 'domcontentloaded' });
    const columnLinks = page.locator('a[href*="/columns/"]');
    await expect(columnLinks.first()).toBeVisible({ timeout: 10_000 });
    const count = await columnLinks.count();
    expect(count).toBeGreaterThanOrEqual(12);
  });
});
