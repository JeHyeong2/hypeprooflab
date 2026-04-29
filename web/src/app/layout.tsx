import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Sans_Mono } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import SkipLink from "@/components/SkipLink";
import { I18nProvider } from "@/contexts/I18nContext";
import { CookieConsent } from "@/components/CookieConsent";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import AuthProvider from "@/components/auth/AuthProvider";
import { generateWebSiteJsonLd } from "@/lib/jsonld";
import Analytics from "@/components/Analytics";

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-noto-sans-kr',
});

const notoSansMono = Noto_Sans_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-noto-sans-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://hypeproof-ai.xyz'),
  title: {
    default: "HypeProof AI — AI 빌더·리서처 커뮤니티 리서치 랩",
    template: "%s | HypeProof AI"
  },
  description: "AI 빌더·리서처가 만드는 커뮤니티 리서치 랩. 에이전트 아키텍처, AI 코딩, 퀀트, AI 소설 심층 칼럼.",
  applicationName: "HypeProof AI",
  keywords: [
    // 커뮤니티 정체성
    "AI 커뮤니티", "AI 빌더 커뮤니티", "AI 실무자 모임",
    "AI 리서치 커뮤니티", "AI 크리에이터 그룹",
    "AI 콘텐츠 커뮤니티", "AI 칼럼 커뮤니티",
    "인공지능 연구 모임", "AI 스터디 그룹",
    // 니치 실무 키워드
    "AI 에이전트 아키텍처", "에이전틱 코딩", "클로드 코드 활용",
    "AI 코딩 자동화", "멀티에이전트 시스템 실무",
    "AI 퀀트 트레이딩", "AI 소설 SIMULACRA",
    "AI 에이전트 개발 커뮤니티", "AI 실무 인사이트",
    "GEO 최적화", "AI 검색엔진 최적화", "AI 트렌드 분석",
    // 영문 (최소한)
    "HypeProof", "AI research community", "AI agent",
  ],
  authors: [
    { name: "Jay Lee", url: "https://hypeproof-ai.xyz/team/jay" },
    { name: "HypeProof AI Team", url: "https://hypeproof-ai.xyz/team" }
  ],
  creator: "HypeProof AI",
  publisher: "HypeProof AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" }
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "HypeProof AI — AI 빌더·리서처 커뮤니티 리서치 랩",
    description: "AI 빌더·리서처가 만드는 커뮤니티 리서치 랩. 에이전트 아키텍처, AI 코딩, 퀀트, AI 소설 심층 칼럼.",
    url: "https://hypeproof-ai.xyz",
    siteName: "HypeProof AI",
    images: [
      {
        url: "https://hypeproof-ai.xyz/og-image.png",
        width: 1200,
        height: 630,
        alt: "HypeProof AI - AI 빌더와 리서처를 위한 커뮤니티 리서치 랩",
      },
      {
        url: "https://hypeproof-ai.xyz/og-image-square.png",
        width: 1200,
        height: 1200,
        alt: "HypeProof AI Logo",
      }
    ],
    locale: "ko_KR",
    alternateLocale: ["en_US"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@hypeproofai",
    creator: "@hypeproofai",
    title: "HypeProof AI — AI 빌더·리서처 커뮤니티 랩",
    description: "AI 빌더·리서처가 만드는 커뮤니티 리서치 랩. 에이전트, AI 코딩, 퀀트, AI 소설 심층 칼럼.",
    images: {
      url: "https://hypeproof-ai.xyz/og-image.png",
      alt: "HypeProof AI - Research Lab"
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google:
      process.env.GOOGLE_SITE_VERIFICATION ||
      'OmETygK01wzNq_Gb222kI591akmWG3m6fQ6aBA4QcOk',
    other: {
      'naver-site-verification':
        process.env.NAVER_SITE_VERIFICATION ||
        '5062a8c80f94dc1462bed16c701189a7a652fda2',
    },
  },
  category: "Technology",
  classification: "AI Research",
  referrer: "origin-when-cross-origin",
  generator: "Next.js",
  alternates: {
    canonical: "https://hypeproof-ai.xyz",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "HypeProof AI",
    "alternateName": "HypeProof",
    "description": "AI research team focused on cutting through hype with rigorous validation and real-world testing.",
    "url": "https://hypeproof-ai.xyz",
    "logo": "https://hypeproof-ai.xyz/logo.png",
    "image": "https://hypeproof-ai.xyz/og-image.png",
    "sameAs": [
      "https://twitter.com/hypeproofai",
      "https://github.com/hypeproofai"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "contact@hypeproof-ai.xyz",
      "contactType": "customer service",
      "availableLanguage": ["English", "Korean"]
    },
    "foundingDate": "2026",
    "foundingLocation": {
      "@type": "Place",
      "name": "Seoul, South Korea"
    },
    "slogan": "We Don't Chase Hype. We Prove It.",
    "keywords": "AI research, artificial intelligence, machine learning, technology validation, AI tools",
    "founder": [
      {
        "@type": "Person",
        "name": "Jay Lee",
        "jobTitle": "Founder & Lead Engineer",
        "description": "Staff Engineer with Silicon Valley experience"
      }
    ],
    "employee": [
      {
        "@type": "Person",
        "name": "Jay",
        "jobTitle": "Lead / Tech",
        "description": "Staff Engineer @ Silicon Valley"
      },
      {
        "@type": "Person", 
        "name": "Ryan",
        "jobTitle": "Research / Data",
        "description": "Physics PhD, Quant Dev"
      },
      {
        "@type": "Person",
        "name": "JY", 
        "jobTitle": "Research / AI",
        "description": "AI Engineer, M.S. Physics"
      },
      {
        "@type": "Person",
        "name": "TJ",
        "jobTitle": "Content / Media",
        "description": "Ex-Founder, Media Specialist"
      },
      {
        "@type": "Person",
        "name": "Kiwon",
        "jobTitle": "Marketing",
        "description": "GWU, Global Marketing"
      }
    ],
    "makesOffer": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "AI Research",
          "description": "Rigorous AI validation and real-world testing"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service", 
          "name": "AI Education",
          "description": "Learning paradigms for the age of artificial intelligence"
        }
      }
    ]
  };

  const websiteData = generateWebSiteJsonLd();

  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationData, websiteData])
          }}
        />
        <link rel="alternate" type="application/rss+xml" title="HypeProof AI (KO)" href="/feed.xml" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="HypeProof AI" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`antialiased ${notoSansKR.variable} ${notoSansMono.variable}`}>
        <Analytics />
        <SkipLink />
        <AuthProvider>
          <I18nProvider>
            <AnalyticsProvider>
              <ErrorBoundary>
                <main id="main">{children}</main>
                <CookieConsent />
              </ErrorBoundary>
            </AnalyticsProvider>
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
