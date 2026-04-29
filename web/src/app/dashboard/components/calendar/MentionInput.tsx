'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  value: string;
  onChange: (next: string) => void;
  candidates: string[]; // displayName 목록
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  rows?: number;
}

interface DropdownState {
  open: boolean;
  start: number; // @ 위치
  query: string;
  items: string[];
  index: number;
}

const initialDropdown: DropdownState = {
  open: false,
  start: -1,
  query: '',
  items: [],
  index: 0,
};

export default function MentionInput({
  value,
  onChange,
  candidates,
  placeholder,
  maxLength = 2000,
  disabled,
  rows = 3,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [dropdown, setDropdown] = useState<DropdownState>(initialDropdown);

  const recomputeDropdown = (text: string, caret: number) => {
    const before = text.slice(0, caret);
    const at = before.lastIndexOf('@');
    if (at < 0) {
      setDropdown(initialDropdown);
      return;
    }
    const segment = before.slice(at + 1);
    if (/\s/.test(segment) || segment.length > 30) {
      setDropdown(initialDropdown);
      return;
    }
    const lower = segment.toLowerCase();
    const items = candidates
      .filter(c => c.toLowerCase().includes(lower))
      .slice(0, 8);
    if (items.length === 0) {
      setDropdown(initialDropdown);
      return;
    }
    setDropdown({ open: true, start: at, query: segment, items, index: 0 });
  };

  const insertMention = (name: string) => {
    if (!textareaRef.current || dropdown.start < 0) return;
    const before = value.slice(0, dropdown.start);
    const after = value.slice(dropdown.start + 1 + dropdown.query.length);
    const next = `${before}@${name} ${after}`;
    onChange(next);
    setDropdown(initialDropdown);
    requestAnimationFrame(() => {
      const ta = textareaRef.current;
      if (!ta) return;
      const newCaret = before.length + 1 + name.length + 1;
      ta.focus();
      ta.setSelectionRange(newCaret, newCaret);
    });
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!dropdown.open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setDropdown(d => ({ ...d, index: (d.index + 1) % d.items.length }));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setDropdown(d => ({ ...d, index: (d.index - 1 + d.items.length) % d.items.length }));
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      insertMention(dropdown.items[dropdown.index]);
    } else if (e.key === 'Escape') {
      setDropdown(initialDropdown);
    }
  };

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const onSelect = () => recomputeDropdown(ta.value, ta.selectionStart);
    ta.addEventListener('keyup', onSelect);
    ta.addEventListener('click', onSelect);
    return () => {
      ta.removeEventListener('keyup', onSelect);
      ta.removeEventListener('click', onSelect);
    };
  }, [candidates]);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => {
          onChange(e.target.value);
          recomputeDropdown(e.target.value, e.target.selectionStart);
        }}
        onKeyDown={handleKey}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        rows={rows}
        className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-2.5 py-2 text-[0.78rem] text-[#e6edf3] placeholder-[#6e7681] resize-y focus:outline-none focus:border-[#58a6ff] disabled:opacity-50"
      />
      <div className="flex justify-between items-center mt-1">
        <span className="text-[0.62rem] text-[#6e7681]">
          @로 멤버 태그
        </span>
        <span className="text-[0.62rem] text-[#6e7681]">
          {value.length} / {maxLength}
        </span>
      </div>
      {dropdown.open && (
        <div className="absolute z-20 left-0 right-0 mt-0 bg-[#161b22] border border-[#30363d] rounded-md shadow-xl overflow-hidden">
          {dropdown.items.map((name, i) => (
            <button
              key={name}
              type="button"
              onMouseDown={e => {
                e.preventDefault();
                insertMention(name);
              }}
              className={`w-full text-left px-3 py-1.5 text-[0.74rem] ${
                i === dropdown.index
                  ? 'bg-[#1f6feb] text-white'
                  : 'text-[#e6edf3] hover:bg-[#21262d]'
              }`}
            >
              @{name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function renderWithMentions(text: string, mentioned: Set<string>): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const re = /@([A-Za-z가-힣][A-Za-z0-9가-힣_]*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      parts.push(<span key={key++}>{text.slice(last, m.index)}</span>);
    }
    const name = m[1];
    const isReal = mentioned.has(name);
    parts.push(
      <span
        key={key++}
        className={
          isReal
            ? 'inline-block px-1 py-0.5 rounded bg-[rgba(31,111,235,0.18)] text-[#58a6ff] font-medium'
            : 'text-[#8b949e]'
        }
      >
        @{name}
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(<span key={key++}>{text.slice(last)}</span>);
  return parts;
}
