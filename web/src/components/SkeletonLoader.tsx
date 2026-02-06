'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  variant = 'rectangular',
  width = '100%',
  height = '1rem',
  lines = 1
}) => {
  const shimmerVariants = {
    initial: { x: '-100%' },
    animate: { x: '100%' },
  };

  const getSkeletonClass = () => {
    const baseClass = 'relative overflow-hidden bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 animate-pulse';
    
    switch (variant) {
      case 'text':
        return `${baseClass} h-4 rounded`;
      case 'circular':
        return `${baseClass} rounded-full`;
      case 'rectangular':
        return `${baseClass} rounded-lg`;
      case 'card':
        return `${baseClass} rounded-xl`;
      default:
        return `${baseClass} rounded`;
    }
  };

  const renderSkeleton = (key: number = 0) => (
    <div
      key={key}
      className={`${getSkeletonClass()} ${className}`}
      style={{ width, height }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-600/50 to-transparent"
        variants={shimmerVariants}
        initial="initial"
        animate="animate"
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: key * 0.1
        }}
      />
    </div>
  );

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }, (_, i) => renderSkeleton(i))}
      </div>
    );
  }

  return renderSkeleton();
};

// Specialized skeleton components
export const CardSkeleton: React.FC = () => (
  <div className="glass p-8 rounded-2xl space-y-4">
    <SkeletonLoader variant="circular" width="4rem" height="4rem" />
    <SkeletonLoader variant="text" height="1.5rem" width="70%" />
    <SkeletonLoader variant="text" lines={3} height="1rem" />
  </div>
);

export const TeamMemberSkeleton: React.FC = () => (
  <div className="text-center space-y-4">
    <SkeletonLoader variant="circular" width="6rem" height="6rem" className="mx-auto" />
    <SkeletonLoader variant="text" height="1.25rem" width="60%" className="mx-auto" />
    <SkeletonLoader variant="text" height="0.875rem" width="80%" className="mx-auto" />
    <SkeletonLoader variant="text" height="0.75rem" width="90%" className="mx-auto" />
  </div>
);

export const ColumnCardSkeleton: React.FC = () => (
  <div className="glass p-6 rounded-2xl">
    <div className="flex flex-col md:flex-row gap-6">
      <SkeletonLoader variant="card" width="16rem" height="10rem" className="flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3">
          <SkeletonLoader variant="text" height="0.75rem" width="4rem" />
          <SkeletonLoader variant="text" height="0.75rem" width="5rem" />
        </div>
        <SkeletonLoader variant="text" height="1.5rem" width="85%" />
        <SkeletonLoader variant="text" lines={2} height="1rem" />
      </div>
    </div>
  </div>
);

export const HeroSkeleton: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center px-6">
    <div className="text-center max-w-4xl mx-auto space-y-8">
      <SkeletonLoader variant="text" height="1rem" width="8rem" className="mx-auto" />
      <SkeletonLoader variant="text" height="4rem" width="100%" className="mx-auto" />
      <SkeletonLoader variant="text" lines={2} height="1.5rem" width="80%" className="mx-auto" />
      <SkeletonLoader variant="rectangular" height="3rem" width="8rem" className="mx-auto rounded-full" />
    </div>
  </div>
);