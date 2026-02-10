import type { Metadata } from "next";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import SkipLink from "@/components/SkipLink";
import { I18nProvider } from "@/contexts/I18nContext";
import { CookieConsent } from "@/components/CookieConsent";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";

export const metadata: Metadata = {
  title: {
    default: "HypeProof AI - We Don't Chase Hype. We Prove It.",
    template: "%s | HypeProof AI"
  },
  description: "AI의 진짜 가치를 함께 탐구합니다. 심층 리서치, 칼럼, 그리고 AI 커뮤니티. Deep research, columns, and practical AI insights.",
  applicationName: "HypeProof AI",
  keywords: [
    "AI research", "artificial intelligence", "machine learning", 
    "AI tools", "technology research", "AI insights", "AI validation", 
    "AI agent", "multi-agent system", "에이전트 아키텍처", "AI 리서치",
    "인공지능", "AI 커뮤니티", "HypeProof", "AI 분석"
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
    title: "HypeProof AI - We Don't Chase Hype. We Prove It.",
    description: "Deep research, columns, and practical AI insights for builders and skeptics alike. Exploring the real impact of AI.",
    url: "https://hypeproof-ai.xyz",
    siteName: "HypeProof AI",
    images: [
      {
        url: "https://hypeproof-ai.xyz/og-image.png",
        width: 1200,
        height: 630,
        alt: "HypeProof AI - Research Lab for AI Builders and Skeptics",
      },
      {
        url: "https://hypeproof-ai.xyz/og-image-square.png", 
        width: 1200,
        height: 1200,
        alt: "HypeProof AI Logo",
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@hypeproofai",
    creator: "@hypeproofai",
    title: "HypeProof AI - We Don't Chase Hype. We Prove It.",
    description: "Deep research, honest conversations, and practical AI insights for builders and skeptics alike.",
    images: {
      url: "https://hypeproof-ai.xyz/og-image.png",
      alt: "HypeProof AI - Research Lab"
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
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
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
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
      "email": "jayleekr0125@gmail.com",
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

  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "HypeProof AI",
    "url": "https://hypeproof-ai.xyz",
    "description": "Deep research, honest conversations, and practical AI insights for builders and skeptics alike.",
    "inLanguage": "en-US",
    "copyrightYear": "2026",
    "copyrightHolder": {
      "@type": "Organization",
      "name": "HypeProof AI"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://hypeproof-ai.xyz/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationData, websiteData])
          }}
        />
        <link rel="canonical" href="https://hypeproof-ai.xyz" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="HypeProof AI" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="antialiased">
        <SkipLink />
        <I18nProvider>
          <AnalyticsProvider>
            <ErrorBoundary>
              {children}
              <CookieConsent />
            </ErrorBoundary>
          </AnalyticsProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
