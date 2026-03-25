import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | HypeProof AI',
  description: 'HypeProof Lab internal dashboard',
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <main className="w-full h-screen">
      <iframe
        src="/dashboard-v3.html"
        className="w-full h-full border-0"
        title="HypeProof Lab Dashboard"
      />
    </main>
  );
}
