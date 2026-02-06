'use client';

import { lazy } from 'react';

// Lazy load heavy components
export const LazyFeaturesSection = lazy(() => 
  import('./sections/FeaturesSection').then(module => ({
    default: module.FeaturesSection
  }))
);

export const LazyLatestContentPreview = lazy(() =>
  import('./sections/ContentSection').then(module => ({
    default: module.LatestContentPreview
  }))
);

export const LazyNewsletterSignup = lazy(() =>
  import('./sections/ContentSection').then(module => ({
    default: module.NewsletterSignup
  }))
);

// Higher-order component for lazy loading with better UX
import React, { Suspense } from 'react';
import { motion } from 'framer-motion';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const DefaultFallback = () => (
  <motion.div
    className="flex items-center justify-center py-24"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
  </motion.div>
);

export const LazyWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  fallback = <DefaultFallback /> 
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

// Memoized components for better performance
export const MemoizedSocialProofBar = React.memo(() => {
  const { SocialProofBar } = require('./sections/HeroSection');
  return <SocialProofBar />;
});

MemoizedSocialProofBar.displayName = 'MemoizedSocialProofBar';