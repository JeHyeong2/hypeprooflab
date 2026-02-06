'use client';

import React, { Suspense, useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSpinner, SectionLoader } from './LoadingSpinner';
import { SkeletonLoader, CardSkeleton, TeamMemberSkeleton, ColumnCardSkeleton } from './SkeletonLoader';

interface LoadingBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  delay?: number;
  minLoadingTime?: number;
  sectionTitle?: string;
  variant?: 'spinner' | 'skeleton' | 'cards' | 'team' | 'columns';
}

export const LoadingBoundary: React.FC<LoadingBoundaryProps> = ({
  children,
  fallback,
  delay = 0,
  minLoadingTime = 500,
  sectionTitle = "Content",
  variant = 'spinner'
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => setShowContent(true), 100);
    }, Math.max(delay, minLoadingTime));

    return () => clearTimeout(timer);
  }, [delay, minLoadingTime]);

  const renderFallback = () => {
    if (fallback) return fallback;

    switch (variant) {
      case 'skeleton':
        return (
          <div className="py-32 px-6">
            <div className="max-w-6xl mx-auto space-y-8">
              <SkeletonLoader variant="text" height="3rem" width="20rem" className="mx-auto" />
              <SkeletonLoader variant="text" height="1.25rem" width="30rem" className="mx-auto" />
            </div>
          </div>
        );
      
      case 'cards':
        return (
          <div className="py-32 px-6">
            <div className="max-w-6xl mx-auto">
              <SkeletonLoader variant="text" height="3rem" width="20rem" className="mx-auto mb-16" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {[...Array(3)].map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'team':
        return (
          <div className="py-32 px-6">
            <div className="max-w-4xl mx-auto">
              <SkeletonLoader variant="text" height="3rem" width="15rem" className="mx-auto mb-16" />
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-12 xs:gap-8 md:gap-6">
                {[...Array(5)].map((_, i) => (
                  <TeamMemberSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'columns':
        return (
          <div className="py-32 px-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between mb-12">
                <SkeletonLoader variant="text" height="3rem" width="10rem" />
                <SkeletonLoader variant="text" height="1rem" width="5rem" />
              </div>
              {[...Array(3)].map((_, i) => (
                <ColumnCardSkeleton key={i} />
              ))}
            </div>
          </div>
        );
        
      default:
        return <SectionLoader title={sectionTitle} />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderFallback()}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 20 }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Lazy loading wrapper with intersection observer
export const LazySection: React.FC<{
  children: ReactNode;
  threshold?: number;
  rootMargin?: string;
  fallback?: ReactNode;
  className?: string;
}> = ({
  children,
  threshold = 0.1,
  rootMargin = "100px",
  fallback = <SectionLoader title="Content" />,
  className = ""
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState<Element | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, threshold, rootMargin]);

  return (
    <div ref={setRef} className={className}>
      <AnimatePresence mode="wait">
        {!isVisible ? (
          <motion.div
            key="loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {fallback}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};