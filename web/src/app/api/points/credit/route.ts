import { NextRequest, NextResponse } from 'next/server';
import { NotionPointsService } from '@/lib/points';

const svc = new NotionPointsService();

const CREDIT_SECRET = process.env.CREDIT_API_SECRET ?? '';

const VALID_TYPES = ['Earn', 'Spend', 'Bonus'] as const;
const VALID_CATEGORIES = ['Content', 'Review', 'Community', 'Referral'] as const;

type PointType = (typeof VALID_TYPES)[number];
type PointCategory = (typeof VALID_CATEGORIES)[number];

export async function POST(req: NextRequest) {
  // Internal service auth via shared secret
  const secret = req.headers.get('x-credit-secret');
  if (!CREDIT_SECRET || secret !== CREDIT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { member, amount, type, category, note } = body as {
    member: unknown;
    amount: unknown;
    type: unknown;
    category: unknown;
    note: unknown;
  };

  if (!member || amount == null || !type || !category) {
    return NextResponse.json(
      { error: 'Missing required fields: member, amount, type, category' },
      { status: 400 }
    );
  }

  if (typeof member !== 'string' || member.trim() === '') {
    return NextResponse.json({ error: 'member must be a non-empty string' }, { status: 400 });
  }

  if (typeof amount !== 'number' || amount <= 0 || !Number.isFinite(amount)) {
    return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 });
  }

  if (!VALID_TYPES.includes(type as PointType)) {
    return NextResponse.json(
      { error: `type must be one of: ${VALID_TYPES.join(', ')}` },
      { status: 400 }
    );
  }

  if (!VALID_CATEGORIES.includes(category as PointCategory)) {
    return NextResponse.json(
      { error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` },
      { status: 400 }
    );
  }

  const transaction = `${category} ${type} — ${new Date().toISOString().split('T')[0]}`;
  const noteStr = typeof note === 'string' ? note : '';

  const result = await svc.addPoints({
    transaction,
    member: member.trim(),
    amount,
    type: type as PointType,
    category: category as PointCategory,
    note: noteStr,
  });

  const total = await svc.getBalance(member.trim());

  return NextResponse.json({ ...result, total }, { status: 201 });
}
