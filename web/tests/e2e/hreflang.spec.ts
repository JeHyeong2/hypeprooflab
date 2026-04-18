import { test, expect } from '@playwright/test';

const SITE_URL = 'https://hypeproof-ai.xyz';

test.describe('hreflang / canonical consistency', () => {
  test('home has canonical and alternate RSS link @desktop', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBeTruthy();
    expect(canonical).toContain('hypeproof-ai.xyz');
  });

  test('column detail exposes ko/en/x-default hreflang @desktop', async ({ page }) => {
    await page.goto('/columns', { waitUntil: 'domcontentloaded' });
    await page.locator('a[href*="/columns/"]').first().click();
    await page.waitForLoadState('domcontentloaded');

    const langs = await page.locator('link[rel="alternate"][hreflang]').evaluateAll(
      (nodes) => nodes.map((n) => (n as HTMLLinkElement).hreflang)
    );
    // Must at least have ko or en plus x-default
    expect(langs).toContain('x-default');
    expect(langs.some((l) => l === 'ko' || l === 'en')).toBe(true);
  });

  test('column detail canonical is free of ?lang= query @desktop', async ({ page }) => {
    await page.goto('/columns', { waitUntil: 'domcontentloaded' });
    await page.locator('a[href*="/columns/"]').first().click();
    await page.waitForLoadState('domcontentloaded');

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBeTruthy();
    expect(canonical).not.toContain('?lang=');
  });

  test('research detail exposes hreflang alternates @desktop', async ({ page }) => {
    const res = await page.goto('/research', { waitUntil: 'domcontentloaded' });
    if (!res || res.status() >= 400) test.skip();
    const link = page.locator('a[href*="/research/"]').first();
    if ((await link.count()) === 0) test.skip();
    await link.click();
    await page.waitForLoadState('domcontentloaded');

    const langs = await page.locator('link[rel="alternate"][hreflang]').evaluateAll(
      (nodes) => nodes.map((n) => (n as HTMLLinkElement).hreflang)
    );
    expect(langs.length).toBeGreaterThan(0);
  });

  test('sitemap.xml includes xhtml:link alternate entries @desktop', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const xml = await res.text();
    expect(xml).toContain('<urlset');
    expect(xml).toMatch(/rel="alternate"|xhtml:link/);
  });

  test('naver-site-verification meta tag present @desktop', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const content = await page
      .locator('meta[name="naver-site-verification"]')
      .getAttribute('content');
    expect(content).toBeTruthy();
    expect(content).not.toContain('PLACEHOLDER');
  });

  test('root layout has exactly one main#main @desktop', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(await page.locator('main#main').count()).toBe(1);
  });

  test('SearchAction schema is removed from WebSite JSON-LD @desktop', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const scripts = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const joined = scripts.join('\n');
    expect(joined).not.toContain('SearchAction');
    // Baseline: sanity that JSON-LD is still present
    expect(joined).toContain('Organization');
  });

  test.skip('sitemap hreflang targets are self-consistent', async ({ request }) => {
    // Placeholder for deeper cross-check; enable when path-based i18n is adopted
    const res = await request.get('/sitemap.xml');
    const xml = await res.text();
    expect(xml).toContain(SITE_URL);
  });
});
