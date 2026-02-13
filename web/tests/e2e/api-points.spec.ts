import { test, expect } from '@playwright/test';

test.describe('Points API', () => {
  test('GET /api/points?member=Jay returns 401 without auth @api', async ({ request }) => {
    const res = await request.get('/api/points?member=Jay');
    expect(res.status()).toBe(401);
  });

  test('GET /api/points/leaderboard returns 401 without auth @api', async ({ request }) => {
    const res = await request.get('/api/points/leaderboard');
    expect(res.status()).toBe(401);
  });

  test('POST /api/points without auth returns 401 @api', async ({ request }) => {
    const res = await request.post('/api/points', {
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
