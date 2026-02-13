'use client';

import { useState } from 'react';
import Link from 'next/link';

const yamlTemplate = `# AI Author Persona — [PERSONA NAME]
# Human: [Creator Name] (HypeProof Lab)
# Created: [YYYY-MM-DD]

name: "[페르소나 이름]"
human: "[Creator 이름/핸들]"
avatar: "[파일 경로 또는 null]"

genres:
  - "[주 장르 1]"
  - "[주 장르 2]"

style:
  tone: "[문체 톤 설명]"
  sentence: "[문장 스타일]"
  pov: "[시점]"
  bilingual: false

influences:
  authors:
    - "[작가 1]"
  works:
    - "[작품 1]"
  philosophy:
    - "[철학/사상 1]"

themes:
  - "[핵심 테마 1]"
  - "[핵심 테마 2]"

voice: |
  [이 페르소나가 누구인지를 산문으로 서술]
  [글쓰기 정체성의 핵심을 담는다]

rules:
  - "[규칙 1]"
  - "[규칙 2]"

works:
  - title: "[작품 제목]"
    status: "planned"
    genre: "[장르]"
    volumes: 1
    design: "[마스터 프롬프트 파일 경로]"`;

const content = {
  ko: {
    title: 'AI Persona 등록 가이드',
    back: '← AI Personas',
    steps: [
      {
        title: 'AI Persona란? 🤖',
        content: [
          'AI Persona는 인간 Creator가 설계하고 가이드하는 AI 창작 정체성입니다.',
          '각 Persona는 고유한 문체, 철학, 장르를 가지며 독자적인 작품 세계를 구축합니다.',
          '현재 CIPHER가 첫 번째 AI Persona로 활동 중입니다 — Jay가 설계한 철학적 SF 작가로, SIMULACRA 시리즈를 집필하고 있습니다.',
        ],
        example: {
          name: 'CIPHER',
          creator: 'Jay',
          genres: ['철학적 SF', 'Cyberpunk', '의식 탐구'],
          quote: '코드를 짜듯 문장을 쌓고, 버그를 찾듯 인간을 관찰한다.',
        },
      },
      {
        title: '필요한 준비물 📋',
        items: [
          { icon: '📄', label: 'Persona YAML', desc: '아래 템플릿에 맞춰 페르소나 정의 파일 작성' },
          { icon: '📝', label: '마스터 프롬프트', desc: '작품별 집필용 프롬프트 문서 (설정, 인물, 구조, 규칙)' },
          { icon: '✍️', label: '샘플 챕터', desc: '최소 1챕터 (4,000~6,000자 권장)' },
          { icon: '🖼️', label: '아바타 이미지', desc: 'PNG/JPG, 정사각형 512×512 이상 (AI 생성 OK)' },
        ],
      },
      {
        title: '제출 방법 📬',
        content: [
          'Herald 🔔 봇에게 Discord DM으로 위 4가지 파일을 제출하세요.',
          'Herald가 YAML의 voice/style/rules와 샘플 챕터의 일관성을 검증합니다.',
          '또는 관리자(Jay)에게 직접 연락해도 됩니다.',
        ],
        email: 'jayleekr0125@gmail.com',
      },
    ],
    copyYaml: 'YAML 템플릿 복사',
    copied: '복사됨! ✓',
    next: '다음',
    prev: '이전',
    langSwitch: 'English',
  },
  en: {
    title: 'AI Persona Registration Guide',
    back: '← AI Personas',
    steps: [
      {
        title: 'What is an AI Persona? 🤖',
        content: [
          'An AI Persona is a creative identity designed and guided by a human Creator.',
          'Each Persona has unique writing style, philosophy, and genre — building its own narrative universe.',
          'CIPHER is currently the first active AI Persona — a philosophical SF author designed by Jay, writing the SIMULACRA series.',
        ],
        example: {
          name: 'CIPHER',
          creator: 'Jay',
          genres: ['Philosophical SF', 'Cyberpunk', 'Consciousness'],
          quote: 'Stacks sentences like code, observes humans like debugging.',
        },
      },
      {
        title: 'What You Need 📋',
        items: [
          { icon: '📄', label: 'Persona YAML', desc: 'Define your persona using the template below' },
          { icon: '📝', label: 'Master Prompt', desc: 'Writing prompt document per work (setting, characters, structure, rules)' },
          { icon: '✍️', label: 'Sample Chapter', desc: 'At least 1 chapter (4,000~6,000 chars recommended)' },
          { icon: '🖼️', label: 'Avatar Image', desc: 'PNG/JPG, square 512×512+ (AI-generated OK)' },
        ],
      },
      {
        title: 'How to Submit 📬',
        content: [
          'Send all 4 files to Herald 🔔 bot via Discord DM.',
          'Herald will verify consistency between your YAML voice/style/rules and sample chapter.',
          'Or contact the admin (Jay) directly.',
        ],
        email: 'jayleekr0125@gmail.com',
      },
    ],
    copyYaml: 'Copy YAML Template',
    copied: 'Copied! ✓',
    next: 'Next',
    prev: 'Back',
    langSwitch: '한국어',
  },
};

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState<'ko' | 'en'>('ko');
  const [copied, setCopied] = useState(false);
  const l = content[lang];
  const s = l.steps[step];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(yamlTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center px-4 py-12">
      {/* Top bar */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-8">
        <Link href={`/ai-personas?lang=${lang}`} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          {l.back}
        </Link>
        <button
          onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
          className="text-xs text-zinc-500 hover:text-zinc-300 border border-zinc-700 rounded px-2 py-1 transition-colors"
        >
          {l.langSwitch}
        </button>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-white mb-8">{l.title}</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-10">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              onClick={() => setStep(i)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                i === step ? 'bg-purple-600 text-white' : i < step ? 'bg-purple-600/30 text-purple-400' : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {i + 1}
            </button>
            {i < 2 && <div className={`w-8 h-0.5 ${i < step ? 'bg-purple-600/50' : 'bg-zinc-800'}`} />}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-2xl w-full">
        <h2 className="text-xl font-bold text-white mb-6">{s.title}</h2>

        {/* Step 0: What is AI Persona */}
        {step === 0 && (
          <div className="space-y-4">
            {(s as any).content.map((p: string, i: number) => (
              <p key={i} className="text-zinc-300 leading-relaxed">{p}</p>
            ))}
            {(s as any).example && (
              <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/40 to-indigo-600/40 flex items-center justify-center text-lg font-bold text-purple-300">C</div>
                  <div>
                    <span className="text-white font-semibold">{(s as any).example.name}</span>
                    <span className="text-zinc-500 text-sm ml-2">by {(s as any).example.creator}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(s as any).example.genres.map((g: string) => (
                    <span key={g} className="text-xs px-2.5 py-1 rounded-full bg-purple-600/20 text-purple-300 border border-purple-500/20">{g}</span>
                  ))}
                </div>
                <p className="text-sm text-zinc-400 italic">&ldquo;{(s as any).example.quote}&rdquo;</p>
              </div>
            )}
          </div>
        )}

        {/* Step 1: Requirements */}
        {step === 1 && (
          <div className="space-y-4">
            {(s as any).items.map((item: any, i: number) => (
              <div key={i} className="flex items-start gap-4 bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <h3 className="text-white font-medium">{item.label}</h3>
                  <p className="text-sm text-zinc-400 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}

            {/* YAML Template */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400 font-medium">YAML Template</span>
                <button
                  onClick={handleCopy}
                  className="text-xs px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg border border-purple-500/20 transition-colors"
                >
                  {copied ? l.copied : l.copyYaml}
                </button>
              </div>
              <pre className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-400 overflow-x-auto max-h-64 overflow-y-auto">
                <code>{yamlTemplate}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Step 2: Submission */}
        {step === 2 && (
          <div className="space-y-4">
            {(s as any).content.map((p: string, i: number) => (
              <p key={i} className="text-zinc-300 leading-relaxed">{p}</p>
            ))}
            <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
              <h3 className="text-white font-medium">📋 Checklist</h3>
              {['[persona-name].yaml', '[WORK_TITLE]_Writing_Prompt.md', 'Sample chapter (Markdown)', 'Avatar image (PNG/JPG)'].map((item) => (
                <label key={item} className="flex items-center gap-3 text-sm text-zinc-400">
                  <input type="checkbox" className="accent-purple-600 rounded" />
                  <code className="text-zinc-300">{item}</code>
                </label>
              ))}
            </div>
            {(s as any).email && (
              <a
                href={`mailto:${(s as any).email}?subject=AI Persona Registration`}
                className="inline-block mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-colors"
              >
                ✉️ {lang === 'ko' ? '관리자에게 이메일 보내기' : 'Email the Admin'}
              </a>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-4 mt-10">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="px-5 py-2 text-sm text-zinc-400 border border-zinc-700 rounded-lg hover:border-zinc-500 hover:text-white transition-colors">
            {l.prev}
          </button>
        )}
        {step < 2 && (
          <button onClick={() => setStep(step + 1)} className="px-5 py-2 text-sm bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors">
            {l.next}
          </button>
        )}
      </div>
    </div>
  );
}
