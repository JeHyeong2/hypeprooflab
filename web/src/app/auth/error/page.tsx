'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const ERROR_MESSAGES: Record<string, { title: string; desc: string }> = {
  Configuration: {
    title: '서버 설정 오류',
    desc: '인증 서비스에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
  },
  AccessDenied: {
    title: '접근이 거부되었습니다',
    desc: '이 계정으로는 로그인할 수 없습니다.',
  },
  Verification: {
    title: '인증 링크 만료',
    desc: '인증 링크가 만료되었거나 이미 사용되었습니다. 다시 로그인해주세요.',
  },
  Default: {
    title: '로그인 중 오류가 발생했습니다',
    desc: '잠시 후 다시 시도해주세요. 문제가 계속되면 관리자에게 문의해주세요.',
  },
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const errorType = searchParams.get('error') || 'Default';
  const { title, desc } = ERROR_MESSAGES[errorType] || ERROR_MESSAGES.Default;

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">{title}</h1>
        <p className="text-zinc-400 mb-8">{desc}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/api/auth/signin"
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            다시 로그인
          </Link>
          <Link
            href="/"
            className="px-6 py-2.5 border border-zinc-700 hover:border-zinc-500 text-zinc-300 rounded-lg text-sm font-medium transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" />
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
