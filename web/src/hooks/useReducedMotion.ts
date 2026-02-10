'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to detect user's motion preferences and device capabilities
 * Returns true if animations should be reduced for:
 * - Users who prefer reduced motion (accessibility)
 * - Mobile devices (performance)
 */
export function useReducedMotion(): boolean {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    // Check for prefers-reduced-motion media query
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Check if device is mobile - memoized to avoid recreation
    const checkIsMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth < 768;
    };

    // Initial check
    const updateMotionPreference = () => {
      const isMobile = checkIsMobile();
      const shouldReduce = mediaQuery.matches || isMobile;
      setShouldReduceMotion(shouldReduce);
    };

    updateMotionPreference();

    // Listen for changes in motion preferences
    const handleChange = () => {
      updateMotionPreference();
    };

    mediaQuery.addEventListener('change', handleChange);
    window.addEventListener('resize', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('resize', handleChange);
    };
  }, []);

  return shouldReduceMotion;
}

/**
 * Hook to get optimized animation variants based on motion preferences
 * Returns simplified animations for reduced motion scenarios
 */
export function useAnimationConfig() {
  const shouldReduce = useReducedMotion();

  return {
    shouldReduce,
    // Fade variants
    fadeIn: shouldReduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } }
      : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 } },

    // Slide variants
    slideIn: shouldReduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } }
      : { initial: { x: -60, opacity: 0 }, animate: { x: 0, opacity: 1 }, transition: { duration: 0.7 } },

    // Scale variants
    scaleIn: shouldReduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } }
      : { initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { duration: 0.6 } },

    // Hover effects
    hover: shouldReduce ? {} : { scale: 1.05, transition: { duration: 0.2 } },

    // Tap effects
    tap: shouldReduce ? {} : { scale: 0.95 },

    // Stagger children
    stagger: shouldReduce
      ? { transition: { staggerChildren: 0.05 } }
      : { transition: { staggerChildren: 0.1 } },
  };
}
