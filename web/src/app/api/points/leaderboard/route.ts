import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { NotionPointsService } from '@/lib/points';

const svc = new NotionPointsService();

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const leaderboard = await svc.getLeaderboard();
  return NextResponse.json({ leaderboard });
}
