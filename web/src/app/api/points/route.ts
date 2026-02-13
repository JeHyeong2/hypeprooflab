import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { NotionPointsService } from '@/lib/points';

const svc = new NotionPointsService();

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const member = req.nextUrl.searchParams.get('member');
  if (!member) {
    return NextResponse.json({ error: 'member query param required' }, { status: 400 });
  }

  const [balance, history] = await Promise.all([
    svc.getBalance(member),
    svc.getHistory(member),
  ]);

  return NextResponse.json({ member, balance, history });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role = (session.user as any).role;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const body = await req.json();
  const { transaction, member, amount, type, category, note } = body;

  if (!transaction || !member || amount == null || !type || !category) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const result = await svc.addPoints({ transaction, member, amount, type, category, note });
  return NextResponse.json(result, { status: 201 });
}
