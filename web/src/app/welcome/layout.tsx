import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Welcome | HypeProof Lab',
  description: 'HypeProof Lab Creator onboarding flow.',
  robots: { index: false, follow: false },
};

export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
