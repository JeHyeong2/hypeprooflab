import { test, expect } from '@playwright/test';

test.describe('API Endpoints', () => {
  test('impact API returns data for valid slug @api', async ({ request }) => {
    const res = await request.get('/api/impact?slug=ai-search-optimization-guide');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('score');
  });

  test('impact API returns error for invalid slug @api', async ({ request }) => {
    const res = await request.get('/api/impact?slug=nonexistent-slug-xyz');
    const body = await res.json();
    // Should return 404 or an error indicator
    expect(res.status() === 404 || body.error || body.score === undefined).toBeTruthy();
  });

  test('points API returns leaderboard @api', async ({ request }) => {
    const res = await request.get('/api/points/leaderboard');
    // Without auth, should return 401
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });
});
