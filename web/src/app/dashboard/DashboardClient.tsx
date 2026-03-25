'use client';

import { useSession, signIn } from 'next-auth/react';

export default function DashboardClient() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0d1117] text-white">
        <div className="text-center">
          <div className="text-2xl mb-2">HypeProof Lab</div>
          <div className="text-zinc-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0d1117] text-white">
        <div className="text-center">
          <div className="text-2xl mb-2">HypeProof Lab Dashboard</div>
          <div className="text-zinc-500 mb-6">코어 멤버만 접근 가능합니다</div>
          <button
            onClick={() => signIn()}
            className="px-6 py-2 bg-[#1f6feb] text-white rounded-lg hover:bg-[#388bfd] transition"
          >
            로그인
          </button>
        </div>
      </div>
    );
  }

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
