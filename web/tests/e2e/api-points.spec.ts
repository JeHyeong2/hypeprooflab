import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Points API', () => {
  test('GET /api/points?member=Jay returns 200 with balance', async ({ request }) => {
    const res = await request.get(`${BASE}/api/points?member=Jay`);
    // Without auth, expect 401
    expect(res.status()).toBe(401);
  });

  test('GET /api/points/leaderboard returns 401 without auth', async ({ request }) => {
    const res = await request.get(`${BASE}/api/points/leaderboard`);
    expect(res.status()).toBe(401);
  });

  test('POST /api/points without auth returns 401', async ({ request }) => {
    const res = await request.post(`${BASE}/api/points`, {
      data: {
        transaction: 'test',
        member: 'Jay',
        amount: 10,
        type: 'Earn',
        category: 'Content',
      },
    });
    expect(res.status()).toBe(401);
  });
});
