'use client';

import { useState } from 'react';
import Link from 'next/link';

const content = {
  ko: {
    step1: {
      title: 'HypeProof Lab에 오신 것을 환영합니다 👋',
      desc: 'HypeProof Lab은 AI가 신뢰하고 인용하는 콘텐츠를 만드는 AI Creator Guild입니다.',
      sub: 'AEO(AI Engine Optimization)라는 새로운 영역에서 함께 성장하세요.',
    },
    step2: {
      title: 'Creator가 되면 이런 것들을 할 수 있어요 ✨',
      items: [
        { icon: '✍️', text: 'AI 엔진에 최적화된 콘텐츠 작성 & 퍼블리싱' },
        { icon: '📊', text: 'GEO Quality Score로 콘텐츠 품질 분석' },
        { icon: '🏆', text: '기여 활동마다 포인트 적립 — 글 작성, 리뷰, 번역 등' },
        { icon: '🤝', text: '다른 Creator들과의 협업 & 네트워킹' },
      ],
    },
    stepAI: {
      title: 'AI Persona로 창작하기 🤖',
      desc: '인간 Creator가 설계하고 가이드하는 AI 창작 정체성을 만들어보세요.',
      sub: 'CIPHER — 첫 번째 AI Persona. 철학적 SF 작가로서 SIMULACRA 시리즈를 집필 중.',
      button: 'AI Personas 보기',
      items: [
        { icon: '🤖', text: '고유한 문체와 철학을 가진 AI 페르소나 설계' },
        { icon: '📝', text: 'YAML 기반 페르소나 정의 + 마스터 프롬프트 시스템' },
        { icon: '📚', text: 'AI와 인간 Creator의 협업으로 새로운 서사 탄생' },
      ],
    },
    step3: {
      title: 'Creator 신청하기 🚀',
      desc: 'Creator 활동을 시작하려면 기존 Creator의 레퍼럴 또는 관리자 승인이 필요합니다.',
      button: 'Creator 신청 문의',
      contact: '관리자에게 이메일로 문의하기',
      back: '홈으로 돌아가기',
    },
    next: '다음',
    prev: '이전',
    langSwitch: 'English',
  },
  en: {
    step1: {
      title: 'Welcome to HypeProof Lab 👋',
      desc: 'HypeProof Lab is an AI Creator Guild — we create content that AI engines trust and cite.',
      sub: 'Grow with us in the new frontier of AEO (AI Engine Optimization).',
    },
    step2: {
      title: 'What you can do as a Creator ✨',
      items: [
        { icon: '✍️', text: 'Write & publish content optimized for AI engines' },
        { icon: '📊', text: 'Analyze content quality with GEO Quality Score' },
        { icon: '🏆', text: 'Earn points for contributions — writing, reviewing, translating' },
        { icon: '🤝', text: 'Collaborate & network with other Creators' },
      ],
    },
    stepAI: {
      title: 'Create with AI Personas 🤖',
      desc: 'Design an AI creative identity guided by a human Creator.',
      sub: 'CIPHER — the first AI Persona. A philosophical SF author writing the SIMULACRA series.',
      button: 'View AI Personas',
      items: [
        { icon: '🤖', text: 'Design AI personas with unique voice and philosophy' },
        { icon: '📝', text: 'YAML-based persona definition + master prompt system' },
        { icon: '📚', text: 'New narratives born from AI-human Creator collaboration' },
      ],
    },
    step3: {
      title: 'Apply to become a Creator 🚀',
      desc: 'To start as a Creator, you need a referral from an existing Creator or admin approval.',
      button: 'Contact to Apply',
      contact: 'Email the admin',
      back: 'Back to Home',
    },
    next: 'Next',
    prev: 'Back',
    langSwitch: '한국어',
  },
};

export default function WelcomePage() {
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState<'ko' | 'en'>('ko');
  const t = content[lang];

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-12">
      {/* Language toggle */}
      <button
        onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
        className="absolute top-4 right-4 text-xs text-zinc-500 hover:text-zinc-300 border border-zinc-700 rounded px-2 py-1 transition-colors"
      >
        {t.langSwitch}
      </button>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                i === step
                  ? 'bg-purple-600 text-white'
                  : i < step
                  ? 'bg-purple-600/30 text-purple-400'
                  : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {i + 1}
            </div>
            {i < 3 && (
              <div className={`w-6 h-0.5 ${i < step ? 'bg-purple-600/50' : 'bg-zinc-800'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-lg w-full">
        {step === 0 && (
          <div className="text-center space-y-4 animate-in fade-in">
            <h1 className="text-2xl md:text-3xl font-bold text-white">{t.step1.title}</h1>
            <p className="text-zinc-300 text-lg">{t.step1.desc}</p>
            <p className="text-zinc-500">{t.step1.sub}</p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-bold text-white text-center">{t.step2.title}</h2>
            <div className="space-y-3">
              {t.step2.items.map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-zinc-300">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-bold text-white text-center">{t.stepAI.title}</h2>
            <p className="text-zinc-300 text-center">{t.stepAI.desc}</p>
            <div className="space-y-3">
              {t.stepAI.items.map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-zinc-300">{item.text}</span>
                </div>
              ))}
            </div>
            {/* CIPHER card */}
            <div className="bg-zinc-900 border border-purple-500/30 rounded-xl p-5 mt-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/40 to-indigo-600/40 flex items-center justify-center text-lg font-bold text-purple-300">C</div>
                <div>
                  <span className="text-white font-semibold">CIPHER</span>
                  <span className="text-zinc-500 text-sm ml-2">by Jay</span>
                </div>
              </div>
              <p className="text-sm text-zinc-400 italic">{t.stepAI.sub}</p>
            </div>
            <div className="text-center mt-4">
              <Link href="/ai-personas" className="inline-block px-5 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg border border-purple-500/20 transition-colors text-sm">
                {t.stepAI.button} →
              </Link>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-bold text-white">{t.step3.title}</h2>
            <p className="text-zinc-400">{t.step3.desc}</p>
            <a
              href="mailto:jayleekr0125@gmail.com?subject=HypeProof Lab Creator 신청"
              className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              {t.step3.button}
            </a>
            <div>
              <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                {t.step3.back}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-4 mt-10">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="px-5 py-2 text-sm text-zinc-400 border border-zinc-700 rounded-lg hover:border-zinc-500 hover:text-white transition-colors"
          >
            {t.prev}
          </button>
        )}
        {step < 3 && (
          <button
            onClick={() => setStep(step + 1)}
            className="px-5 py-2 text-sm bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
          >
            {t.next}
          </button>
        )}
      </div>
    </div>
  );
}
