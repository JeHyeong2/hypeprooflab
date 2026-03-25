import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | HypeProof AI',
  description: 'HypeProof Lab internal dashboard',
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect('/auth/signin');
  if (session.user.role === 'spectator') redirect('/');

  return (
    <iframe
      src="/dashboard-v3.html"
      className="w-full h-screen border-0"
      title="HypeProof Lab Dashboard"
    />
  );
}
