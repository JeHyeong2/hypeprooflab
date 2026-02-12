import { useState, useEffect, useMemo, useCallback } from 'react';

// Performance detection hook
export const usePerformanceOptimization = () => {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'fast' | 'slow' | 'unknown'>('unknown');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduceMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setShouldReduceMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    // Detect low-end device
    const detectLowEndDevice = () => {
      // Check memory
      const memory = (navigator as any).deviceMemory;
      const cores = navigator.hardwareConcurrency || 1;
      
      // Consider low-end if < 4GB RAM or < 4 cores
      return memory < 4 || cores < 4;
    };

    setIsLowEndDevice(detectLowEndDevice());

    // Check connection quality
    const connection = (navigator as any).connection;
    if (connection) {
      const updateConnectionQuality = () => {
        // Consider slow if 2G/3G or slow effective type
        const isSlowConnection = 
          connection.effectiveType === '2g' || 
          connection.effectiveType === '3g' || 
          connection.downlink < 1.5;
        
        setConnectionQuality(isSlowConnection ? 'slow' : 'fast');
      };

      updateConnectionQuality();
      connection.addEventListener('change', updateConnectionQuality);

      return () => {
        mediaQuery.removeEventListener('change', handleChange);
        connection.removeEventListener('change', updateConnectionQuality);
      };
    }

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Optimized animation config
  const animationConfig = useMemo(() => ({
    enableAnimations: !shouldReduceMotion && !isLowEndDevice,
    enableParallax: !shouldReduceMotion && !isLowEndDevice && connectionQuality === 'fast',
    enableComplexEffects: !shouldReduceMotion && !isLowEndDevice && connectionQuality === 'fast',
    reducedDuration: shouldReduceMotion || isLowEndDevice,
    enableFloatingOrbs: !isLowEndDevice && connectionQuality === 'fast',
    enableCursorFollower: !isLowEndDevice && (typeof window === 'undefined' ? true : !('ontouchstart' in window))
  }), [shouldReduceMotion, isLowEndDevice, connectionQuality]);

  return {
    shouldReduceMotion,
    isLowEndDevice,
    connectionQuality,
    animationConfig
  };
};

// Optimized intersection observer hook
export const useOptimizedIntersectionObserver = (options: IntersectionObserverInit = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [node, setNode] = useState<Element | null>(null);
  const { animationConfig } = usePerformanceOptimization();

  const observer = useMemo(() => {
    if (typeof window === 'undefined' || !animationConfig.enableAnimations) return null;
    
    return new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, {
      threshold: 0.1,
      rootMargin: '-50px',
      ...options
    });
  }, [options, animationConfig.enableAnimations]);

  useEffect(() => {
    if (!observer || !node) return;
    
    observer.observe(node);
    return () => observer.disconnect();
  }, [observer, node]);

  return [setNode, isIntersecting && animationConfig.enableAnimations] as const;
};

// Memory efficient animation variants
export const getOptimizedAnimationVariants = (isReduced: boolean) => ({
  fadeInUp: {
    initial: { opacity: 0, y: isReduced ? 10 : 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: isReduced ? 0.3 : 0.6, ease: "easeOut" }
  },
  
  slideInFromLeft: {
    initial: { x: isReduced ? -20 : -60, opacity: 0 },
    whileInView: { x: 0, opacity: 1 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: isReduced ? 0.4 : 0.7, ease: "easeOut" }
  },

  stagger: {
    animate: {
      transition: {
        staggerChildren: isReduced ? 0.05 : 0.1
      }
    }
  }
});