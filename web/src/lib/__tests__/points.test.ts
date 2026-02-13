import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockCreate, mockQuery } = vi.hoisted(() => {
  return { mockCreate: vi.fn(), mockQuery: vi.fn() };
});

vi.mock('@notionhq/client', () => {
  return {
    Client: class {
      pages = { create: mockCreate };
      databases = { query: mockQuery };
    },
  };
});

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
    it('calls notion.pages.create with correct properties', async () => {
      const page = makePage('new-1', 'Jay', 50);
      mockCreate.mockResolvedValue(page);

      const result = await svc.addPoints({
        transaction: 'Test TX',
        member: 'Jay',
        amount: 50,
        type: 'Earn',
        category: 'Content',
        note: 'test note',
      });

      expect(mockCreate).toHaveBeenCalledOnce();
      const call = mockCreate.mock.calls[0][0];
      expect(call.properties.Transaction.title[0].text.content).toBe('Test TX');
      expect(call.properties.Member.rich_text[0].text.content).toBe('Jay');
      expect(call.properties.Amount.number).toBe(50);
      expect(call.properties.Type.select.name).toBe('Earn');
      expect(call.properties.Category.select.name).toBe('Content');
      expect(call.properties.Note.rich_text[0].text.content).toBe('test note');
      expect(result.member).toBe('Jay');
      expect(result.amount).toBe(50);
    });
  });

  describe('getBalance', () => {
    it('sums all transactions for a member', async () => {
      mockQuery.mockResolvedValueOnce({
        results: [makePage('1', 'Jay', 50), makePage('2', 'Jay', 80), makePage('3', 'Jay', -20)],
        has_more: false,
      });

      const balance = await svc.getBalance('Jay');
      expect(balance).toBe(110);
    });

    it('returns 0 for member with no transactions', async () => {
      mockQuery.mockResolvedValueOnce({ results: [], has_more: false });
      const balance = await svc.getBalance('Nobody');
      expect(balance).toBe(0);
    });

    it('paginates through multiple pages', async () => {
      mockQuery
        .mockResolvedValueOnce({
          results: [makePage('1', 'Jay', 100)],
          has_more: true,
          next_cursor: 'cursor-2',
        })
        .mockResolvedValueOnce({
          results: [makePage('2', 'Jay', 50)],
          has_more: false,
        });

      const balance = await svc.getBalance('Jay');
      expect(balance).toBe(150);
      expect(mockQuery).toHaveBeenCalledTimes(2);
    });
  });

  describe('getLeaderboard', () => {
    it('returns members sorted by balance descending', async () => {
      mockQuery.mockResolvedValueOnce({
        results: [
          makePage('1', 'Jay', 100),
          makePage('2', 'Mia', 200),
          makePage('3', 'Jay', 50),
          makePage('4', 'Hoon', 150),
        ],
        has_more: false,
      });

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
