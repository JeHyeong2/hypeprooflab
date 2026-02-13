import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DB_ID = process.env.NOTION_POINTS_DB_ID!;

export interface PointTransaction {
  id: string;
  transaction: string;
  member: string;
  amount: number;
  type: 'Earn' | 'Spend' | 'Bonus';
  category: 'Content' | 'Review' | 'Community' | 'Referral';
  date: string;
  note: string;
}

// Points earning criteria
export const POINTS_TABLE = {
  CONTENT_GEO_70: 50,
  CONTENT_GEO_85: 80,
  CONTENT_GEO_95: 120,
  PEER_REVIEW: 20,
  AI_CITATION_30D: 30,
  REFERRAL: 100,
  COMMUNITY: 10,
} as const;

function extractText(prop: any): string {
  if (prop?.rich_text) return prop.rich_text.map((t: any) => t.plain_text).join('');
  if (prop?.title) return prop.title.map((t: any) => t.plain_text).join('');
  return '';
}

function parseRow(page: any): PointTransaction {
  const p = page.properties;
  return {
    id: page.id,
    transaction: extractText(p.Transaction),
    member: extractText(p.Member),
    amount: p.Amount?.number ?? 0,
    type: p.Type?.select?.name ?? 'Earn',
    category: p.Category?.select?.name ?? 'Content',
    date: p.Date?.date?.start ?? '',
    note: extractText(p.Note),
  };
}

export class NotionPointsService {
  async addPoints(data: {
    transaction: string;
    member: string;
    amount: number;
    type: 'Earn' | 'Spend' | 'Bonus';
    category: 'Content' | 'Review' | 'Community' | 'Referral';
    note?: string;
  }) {
    const response = await notion.pages.create({
      parent: { database_id: DB_ID },
      properties: {
        Transaction: { title: [{ text: { content: data.transaction } }] },
        Member: { rich_text: [{ text: { content: data.member } }] },
        Amount: { number: data.amount },
        Type: { select: { name: data.type } },
        Category: { select: { name: data.category } },
        Date: { date: { start: new Date().toISOString().split('T')[0] } },
        ...(data.note ? { Note: { rich_text: [{ text: { content: data.note } }] } } : {}),
      },
    });
    return parseRow(response);
  }

  async getBalance(member: string): Promise<number> {
    const rows = await this.getAllForMember(member);
    return rows.reduce((sum, r) => sum + r.amount, 0);
  }

  async getHistory(member: string, limit = 20): Promise<PointTransaction[]> {
    const rows = await this.getAllForMember(member);
    return rows.slice(0, limit);
  }

  private async getAllForMember(member: string): Promise<PointTransaction[]> {
    const results: PointTransaction[] = [];
    let cursor: string | undefined;
    do {
      const res: any = await notion.databases.query({
        database_id: DB_ID,
        filter: { property: 'Member', rich_text: { equals: member } },
        sorts: [{ property: 'Date', direction: 'descending' }],
        start_cursor: cursor,
      });
      results.push(...res.results.map(parseRow));
      cursor = res.has_more ? res.next_cursor : undefined;
    } while (cursor);
    return results;
  }

  async getLeaderboard(): Promise<{ member: string; balance: number }[]> {
    const all: PointTransaction[] = [];
    let cursor: string | undefined;
    do {
      const res: any = await notion.databases.query({
        database_id: DB_ID,
        sorts: [{ property: 'Date', direction: 'descending' }],
        start_cursor: cursor,
      });
      all.push(...res.results.map(parseRow));
      cursor = res.has_more ? res.next_cursor : undefined;
    } while (cursor);

    const map = new Map<string, number>();
    for (const row of all) {
      map.set(row.member, (map.get(row.member) ?? 0) + row.amount);
    }
    return Array.from(map.entries())
      .map(([member, balance]) => ({ member, balance }))
      .sort((a, b) => b.balance - a.balance);
  }
}
