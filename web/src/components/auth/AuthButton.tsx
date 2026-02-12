'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import type { MemberRole } from '@/lib/members';

function RoleBadge({ role }: { role?: MemberRole }) {
  if (!role) return null;
  const colors = role === 'admin'
    ? 'bg-red-500/20 text-red-400 border-red-500/30'
    : role === 'author'
    ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    : 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium uppercase ${colors}`}>
      {role}
    </span>
  );
}

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (status === 'loading') {
    return (
      <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" />
    );
  }

  if (!session?.user) {
    return (
      <button
        onClick={() => signIn()}
        className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-md border border-zinc-700 hover:border-zinc-500"
      >
        로그인
      </button>
    );
  }

  const role = (session.user as Record<string, unknown>).role as MemberRole | undefined;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2"
      >
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || ''}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
            {(session.user.name || '?')[0]}
          </div>
        )}
        <RoleBadge role={role} />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-10 w-56 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl py-2 z-50">
          <div className="px-4 py-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <p className="text-sm text-white font-medium truncate">{session.user.name}</p>
              <RoleBadge role={role} />
            </div>
            <p className="text-xs text-zinc-500 truncate">{session.user.email}</p>
          </div>
          {role === 'spectator' && (
            <div className="px-4 py-2 border-b border-zinc-800">
              <p className="text-xs text-zinc-500">
                Author 권한이 필요하신가요?{' '}
                <a href="mailto:jayleekr0125@gmail.com" className="text-purple-400 hover:underline">
                  관리자에게 문의
                </a>
              </p>
            </div>
          )}
          <button
            onClick={() => signOut()}
            className="w-full text-left px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
