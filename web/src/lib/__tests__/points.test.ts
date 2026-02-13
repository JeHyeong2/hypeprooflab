import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

import { NotionPointsService, POINTS_TABLE } from '../points';

function makePage(id: string, member: string, amount: number, type = 'Earn', category = 'Content', date = '2026-01-01') {
  return {
    id,
    properties: {
      Transaction: { title: [{ plain_text: `tx-${id}` }] },
      Member: { rich_text: [{ plain_text: member }] },
      Amount: { number: amount },
      Type: { select: { name: type } },
      Category: { select: { name: category } },
      Date: { date: { start: date } },
      Note: { rich_text: [{ plain_text: '' }] },
    },
  };
}

function mockFetchResponse(data: any, ok = true) {
  return { ok, status: ok ? 200 : 400, statusText: ok ? 'OK' : 'Bad Request', json: () => Promise.resolve(data) };
}

describe('POINTS_TABLE constants', () => {
  it('Content GEO 70 = 50P', () => expect(POINTS_TABLE.CONTENT_GEO_70).toBe(50));
  it('Content GEO 85 = 80P', () => expect(POINTS_TABLE.CONTENT_GEO_85).toBe(80));
  it('Content GEO 95 = 120P', () => expect(POINTS_TABLE.CONTENT_GEO_95).toBe(120));
  it('Peer Review = 20P', () => expect(POINTS_TABLE.PEER_REVIEW).toBe(20));
  it('AI Citation 30D = 30P', () => expect(POINTS_TABLE.AI_CITATION_30D).toBe(30));
  it('Referral = 100P', () => expect(POINTS_TABLE.REFERRAL).toBe(100));
  it('Community = 10P', () => expect(POINTS_TABLE.COMMUNITY).toBe(10));
});

describe('NotionPointsService', () => {
  let svc: NotionPointsService;

  beforeEach(() => {
    vi.clearAllMocks();
    svc = new NotionPointsService();
  });

  describe('addPoints', () => {
    it('calls Notion API to create a page with correct properties', async () => {
      const page = makePage('new-1', 'Jay', 50);
      mockFetch.mockResolvedValueOnce(mockFetchResponse(page));

      const result = await svc.addPoints({
        transaction: 'Test TX',
        member: 'Jay',
        amount: 50,
        type: 'Earn',
        category: 'Content',
        note: 'test note',
      });

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('api.notion.com/v1/pages');
      const body = JSON.parse(opts.body);
      expect(body.properties.Transaction.title[0].text.content).toBe('Test TX');
      expect(body.properties.Member.rich_text[0].text.content).toBe('Jay');
      expect(body.properties.Amount.number).toBe(50);
      expect(result.member).toBe('Jay');
      expect(result.amount).toBe(50);
    });
  });

  describe('getBalance', () => {
    it('sums all transactions for a member', async () => {
      mockFetch.mockResolvedValueOnce(mockFetchResponse({
        results: [makePage('1', 'Jay', 50), makePage('2', 'Jay', 80), makePage('3', 'Jay', -20)],
        has_more: false,
      }));

      const balance = await svc.getBalance('Jay');
      expect(balance).toBe(110);
    });

    it('returns 0 for member with no transactions', async () => {
      mockFetch.mockResolvedValueOnce(mockFetchResponse({ results: [], has_more: false }));
      const balance = await svc.getBalance('Nobody');
      expect(balance).toBe(0);
    });

    it('paginates through multiple pages', async () => {
      mockFetch
        .mockResolvedValueOnce(mockFetchResponse({
          results: [makePage('1', 'Jay', 100)],
          has_more: true,
          next_cursor: 'cursor-2',
        }))
        .mockResolvedValueOnce(mockFetchResponse({
          results: [makePage('2', 'Jay', 50)],
          has_more: false,
        }));

      const balance = await svc.getBalance('Jay');
      expect(balance).toBe(150);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('getLeaderboard', () => {
    it('returns members sorted by balance descending', async () => {
      mockFetch.mockResolvedValueOnce(mockFetchResponse({
        results: [
          makePage('1', 'Jay', 100),
          makePage('2', 'Mia', 200),
          makePage('3', 'Jay', 50),
          makePage('4', 'Hoon', 150),
        ],
        has_more: false,
      }));

      const lb = await svc.getLeaderboard();
      expect(lb).toEqual([
        { member: 'Mia', balance: 200 },
        { member: 'Jay', balance: 150 },
        { member: 'Hoon', balance: 150 },
      ]);
      expect(lb[0].balance).toBeGreaterThanOrEqual(lb[1].balance);
    });
  });
});
