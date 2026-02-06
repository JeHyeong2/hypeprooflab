'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dots' | 'spinner' | 'pulse' | 'bars';
  color?: 'purple' | 'white' | 'zinc';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'spinner', 
  color = 'purple',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    purple: 'text-purple-500',
    white: 'text-white',
    zinc: 'text-zinc-400'
  };

  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3', 
    xl: 'w-4 h-4'
  };

  if (variant === 'dots') {
    return (
      <div className={`flex space-x-1 ${className}`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`${dotSizes[size]} ${colorClasses[color]} bg-current rounded-full`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <motion.div
        className={`${sizeClasses[size]} ${colorClasses[color]} bg-current rounded-full ${className}`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    );
  }

  if (variant === 'bars') {
    return (
      <div className={`flex space-x-1 ${className}`}>
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={`w-1 ${colorClasses[color]} bg-current rounded-full`}
            style={{ height: size === 'sm' ? '16px' : size === 'md' ? '24px' : size === 'lg' ? '32px' : '40px' }}
            animate={{
              scaleY: [1, 2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1
            }}
          />
        ))}
      </div>
    );
  }

  // Default spinner variant
  return (
    <motion.div
      className={`${sizeClasses[size]} ${className}`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      <svg
        className={`${sizeClasses[size]} ${colorClasses[color]}`}
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </motion.div>
  );
};

// Page Loading Component
export const PageLoader: React.FC = () => (
  <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center z-50">
    <div className="text-center space-y-6">
      <motion.div
        className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-white font-medium">Loading HypeProof AI...</p>
        <p className="text-zinc-500 text-sm mt-1">We don't chase hype. We prove it.</p>
      </motion.div>
    </div>
  </div>
);

// Section Loading Component  
export const SectionLoader: React.FC<{ title: string }> = ({ title }) => (
  <div className="py-32 px-6">
    <div className="max-w-6xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <LoadingSpinner size="lg" />
        <p className="text-zinc-400">Loading {title}...</p>
      </motion.div>
    </div>
  </div>
);