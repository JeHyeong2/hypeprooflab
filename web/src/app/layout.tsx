import type { Metadata } from "next";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import SkipLink from "@/components/SkipLink";

export const metadata: Metadata = {
  title: "HypeProof AI - We Don't Chase Hype. We Prove It.",
  description: "Deep research, honest conversations, and practical AI insights for builders and skeptics alike. Cutting through AI hype with rigorous validation and real-world testing.",
  keywords: ["AI research", "artificial intelligence", "AI podcast", "machine learning", "AI tools", "technology research", "AI insights"],
  authors: [{ name: "HypeProof AI Team" }],
  creator: "HypeProof AI",
  publisher: "HypeProof AI",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "HypeProof AI - We Don't Chase Hype. We Prove It.",
    description: "Deep research, honest conversations, and practical AI insights for builders and skeptics alike. Join our podcast and research lab exploring the real impact of AI.",
    url: "https://hypeproof-ai.xyz",
    siteName: "HypeProof AI",
    images: [
      {
        url: "https://hypeproof-ai.xyz/og-image.png",
        width: 1200,
        height: 630,
        alt: "HypeProof AI - Research Lab and Podcast for AI Builders and Skeptics",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HypeProof AI - We Don't Chase Hype. We Prove It.",
    description: "Deep research, honest conversations, and practical AI insights for builders and skeptics alike.",
    images: ["https://hypeproof-ai.xyz/og-image.png"],
    creator: "@hypeproofai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "HypeProof AI",
    "description": "AI research lab and podcast focused on cutting through hype with rigorous validation and real-world testing.",
    "url": "https://hypeproof-ai.xyz",
    "logo": "https://hypeproof-ai.xyz/logo.png",
    "sameAs": [
      "https://twitter.com/hypeproofai",
      "https://podcasts.apple.com/podcast/hypeproof-ai"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "jayleekr0125@gmail.com",
      "contactType": "customer service"
    },
    "foundingDate": "2026",
    "founder": [
      {
        "@type": "Person",
        "name": "Jay Lee"
      }
    ],
    "employee": [
      {
        "@type": "Person",
        "name": "Jay",
        "jobTitle": "Lead / Tech"
      },
      {
        "@type": "Person", 
        "name": "Ryan",
        "jobTitle": "Research / Data"
      },
      {
        "@type": "Person",
        "name": "JY", 
        "jobTitle": "Research / AI"
      },
      {
        "@type": "Person",
        "name": "TJ",
        "jobTitle": "Content / Media"
      },
      {
        "@type": "Person",
        "name": "Kiwon",
        "jobTitle": "Marketing"
      }
    ]
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      </head>
      <body className="antialiased">
        <SkipLink />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
