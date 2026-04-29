'use client';

import { useState, useTransition } from 'react';
import { syncTimeline } from '../../actions/syncTimeline';

interface Props {
  lastSyncAt?: string;
}

export default function SyncButton({ lastSyncAt }: Props) {
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ kind: 'ok' | 'warn' | 'err'; text: string } | null>(null);

  const onClick = () => {
    setToast(null);
    startTransition(async () => {
      try {
        const r = await syncTimeline();
        if (r.needsAuth) {
          setToast({
            kind: 'warn',
            text:
              r.message ??
              'Google Calendar 인증이 필요합니다. Claude Code에서 "/cal sync" 라고 말해주세요.',
          });
        } else {
          setToast({
            kind: 'ok',
            text: `외부 변경 ${r.imported}건 import · 충돌 ${r.conflicts}건`,
          });
        }
      } catch (e) {
        setToast({ kind: 'err', text: `동기화 실패: ${(e as Error).message}` });
      }
    });
  };

  const lastSyncLabel = lastSyncAt ? formatRelative(lastSyncAt) : '미동기화';

  return (
    <div className="flex items-center gap-2">
      <span className="text-[0.68rem] text-[#8b949e]">
        {lastSyncLabel}
      </span>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className={`text-[0.72rem] px-2.5 py-1 rounded-md border transition-all ${
          pending
            ? 'bg-[#161b22] border-[#30363d] text-[#8b949e] cursor-wait'
            : 'bg-[#161b22] border-[#30363d] text-[#e6edf3] hover:border-[#58a6ff]'
        }`}
      >
        {pending ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin" />
            동기화 중
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden>🔄</span>동기화
          </span>
        )}
      </button>
      {toast && (
        <span
          className={`text-[0.68rem] px-2 py-0.5 rounded-md ${
            toast.kind === 'ok'
              ? 'bg-[rgba(39,174,96,0.18)] text-[#27ae60]'
              : toast.kind === 'warn'
              ? 'bg-[rgba(251,191,36,0.18)] text-[#fbbf24]'
              : 'bg-[rgba(231,76,60,0.18)] text-[#e74c3c]'
          }`}
        >
          {toast.text}
        </span>
      )}
    </div>
  );
}

function formatRelative(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '미동기화';
  const diff = (Date.now() - t) / 1000;
  if (diff < 60) return '방금 전 동기화';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전 동기화`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전 동기화`;
  return `${iso.slice(0, 10)} 동기화`;
}
