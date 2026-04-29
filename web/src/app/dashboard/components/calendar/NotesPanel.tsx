'use client';

import { useMemo, useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import type { DashboardMember } from '../../types';
import type { Note, NoteCategory } from '@/lib/sheets/notes';
import { createNoteAction, deleteNoteAction } from '../../actions/notes';
import MentionInput, { renderWithMentions } from './MentionInput';

const CATEGORIES: { id: NoteCategory; title: string; subtitle: string }[] = [
  { id: 'spec', title: '제품 명세서', subtitle: '무엇을 제공하는가' },
  { id: 'curriculum', title: '커리큘럼', subtitle: '누구에게 무엇을 훈련시키는가' },
  { id: 'shoot', title: '촬영 방향성', subtitle: '무엇이 증거인가' },
  { id: 'pitchpack', title: '세일즈 피치팩', subtitle: 'Jay / 정우가 바로 사용' },
  { id: 'general', title: '일반', subtitle: '자유 메모' },
];

interface Props {
  notes: Note[];
  members: DashboardMember[];
  sheetsReady: boolean;
}

export default function NotesPanel({ notes, members, sheetsReady }: Props) {
  const { data: session } = useSession();
  const [active, setActive] = useState<NoteCategory>('spec');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const candidates = useMemo(() => members.map(m => m.displayName), [members]);
  const memberSet = useMemo(() => new Set(candidates), [candidates]);

  const groupedCount = useMemo(() => {
    const map: Record<NoteCategory, number> = {
      spec: 0,
      curriculum: 0,
      shoot: 0,
      pitchpack: 0,
      general: 0,
    };
    for (const n of notes) map[n.category] = (map[n.category] ?? 0) + 1;
    return map;
  }, [notes]);

  const filtered = useMemo(
    () => notes.filter(n => n.category === active),
    [notes, active],
  );

  const meta = CATEGORIES.find(c => c.id === active)!;
  const sessionEmail = session?.user?.email ?? null;

  const onSubmit = () => {
    setError(null);
    const text = content.trim();
    if (!text) return;
    startTransition(async () => {
      const r = await createNoteAction({ category: active, content: text });
      if (r.ok) {
        setContent('');
      } else {
        setError(r.error ?? '등록 실패');
      }
    });
  };

  const onDelete = (id: string) => {
    if (!confirm('이 메모를 삭제할까요?')) return;
    startTransition(async () => {
      await deleteNoteAction(id);
    });
  };

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-3 flex flex-col gap-3 lg:flex-1 lg:min-h-0">
      <div className="flex items-center justify-between">
        <h3 className="text-[0.82rem] font-semibold">팀 메모</h3>
        {!sheetsReady && (
          <span className="text-[0.6rem] px-1.5 py-0.5 rounded bg-[rgba(251,191,36,0.18)] text-[#fbbf24]">
            Sheet 미연결
          </span>
        )}
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-1">
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={`text-[0.66rem] px-2 py-1 rounded-md border transition-colors ${
              active === c.id
                ? 'bg-[#1f6feb] border-[#1f6feb] text-white font-semibold'
                : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:text-[#e6edf3]'
            }`}
          >
            {c.title}
            {groupedCount[c.id] > 0 && (
              <span
                className={`ml-1 text-[0.58rem] ${
                  active === c.id ? 'text-white' : 'text-[#6e7681]'
                }`}
              >
                {groupedCount[c.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Selected category info */}
      <div className="rounded-lg bg-[#0d1117] border border-[#21262d] px-2.5 py-2">
        <div className="text-[0.74rem] font-semibold">{meta.title}</div>
        <div className="text-[0.64rem] text-[#8b949e] mt-0.5">{meta.subtitle}</div>
      </div>

      {/* Notes list */}
      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 lg:max-h-none lg:flex-1 lg:min-h-0">
        {filtered.length === 0 && (
          <div className="text-[0.7rem] text-[#6e7681] text-center py-4">
            아직 메모가 없습니다.
          </div>
        )}
        {filtered.map(n => {
          const mine = sessionEmail && n.authorEmail === sessionEmail;
          return (
            <div
              key={n.id}
              className="rounded-lg border border-[#21262d] bg-[#0d1117] px-2.5 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-[#58a6ff] shrink-0" />
                  <span className="text-[0.7rem] font-semibold truncate">
                    {n.authorName}
                  </span>
                  <span className="text-[0.6rem] text-[#6e7681] truncate">
                    · {formatTime(n.createdAt)}
                  </span>
                </div>
                {mine && (
                  <button
                    onClick={() => onDelete(n.id)}
                    className="text-[0.62rem] text-[#6e7681] hover:text-[#e74c3c]"
                    disabled={pending}
                  >
                    삭제
                  </button>
                )}
              </div>
              <div className="text-[0.74rem] text-[#e6edf3] mt-1 whitespace-pre-wrap break-words leading-relaxed">
                {renderWithMentions(n.content, memberSet)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add form */}
      {!sheetsReady ? (
        <div className="text-[0.66rem] text-[#8b949e] border border-dashed border-[#30363d] rounded-lg p-2.5 leading-relaxed">
          Google Sheets 연결을 마치면 여기서 메모를 작성할 수 있어요. README 또는 .env.example 참고.
        </div>
      ) : !session ? (
        <div className="text-[0.66rem] text-[#8b949e] border border-dashed border-[#30363d] rounded-lg p-2.5">
          로그인하면 메모 작성 가능.
        </div>
      ) : (
        <div className="border-t border-[#21262d] pt-2 space-y-1">
          <MentionInput
            value={content}
            onChange={setContent}
            candidates={candidates}
            placeholder={`${meta.title}에 메모 추가… (@로 멤버 태그)`}
            disabled={pending}
            rows={3}
          />
          {error && (
            <div className="text-[0.66rem] text-[#e74c3c]">{error}</div>
          )}
          <div className="flex justify-end">
            <button
              onClick={onSubmit}
              disabled={pending || content.trim().length === 0}
              className={`text-[0.72rem] px-3 py-1 rounded-md font-semibold transition-colors ${
                pending || content.trim().length === 0
                  ? 'bg-[#1f6feb]/40 text-white/60 cursor-not-allowed'
                  : 'bg-[#1f6feb] hover:bg-[#388bfd] text-white'
              }`}
            >
              {pending ? '저장 중…' : '메모 추가'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(iso: string): string {
  if (!iso) return '';
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso.slice(0, 16).replace('T', ' ');
  const diff = (Date.now() - t) / 1000;
  if (diff < 60) return '방금';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return new Date(t).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
}
