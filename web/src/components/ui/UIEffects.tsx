'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';

// Scroll Progress Indicator
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 transform-gpu z-50"
      style={{
        scaleX,
        transformOrigin: "0%"
      }}
    />
  );
}

// Enhanced Cursor Follower
// Performance-optimized Custom Cursor Follower
const CursorFollower = React.memo(() => {
  const { animationConfig } = usePerformanceOptimization();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const animationRef = useRef<number | undefined>(undefined);
  
  // Don't render if disabled by performance settings
  if (!animationConfig.enableCursorFollower) return null;
  
  const updateMousePosition = useCallback((e: MouseEvent) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    animationRef.current = requestAnimationFrame(() => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    });
  }, [isVisible]);
  
  useEffect(() => {
    // Check if device has a cursor
    const hasCoarseCursor = window.matchMedia('(pointer: coarse)').matches;
    if (hasCoarseCursor) return; // Don't show cursor on touch devices
    
    window.addEventListener('mousemove', updateMousePosition, { passive: true });
    
    // Use event delegation for better performance
    const handleMouseOverOut = (e: MouseEvent) => {
      const target = e.target as Element;
      if (target.closest('a, button, .cursor-pointer')) {
        setIsHovering(e.type === 'mouseover');
      }
    };
    
    document.addEventListener('mouseover', handleMouseOverOut, { passive: true });
    document.addEventListener('mouseout', handleMouseOverOut, { passive: true });

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      document.removeEventListener('mouseover', handleMouseOverOut);
      document.removeEventListener('mouseout', handleMouseOverOut);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [updateMousePosition]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 w-4 h-4 bg-purple-500/50 rounded-full pointer-events-none z-50 hidden md:block"
      style={{ willChange: 'transform' }}
      animate={{
        x: mousePosition.x - 8,
        y: mousePosition.y - 8,
        scale: isHovering ? 1.5 : 1,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        opacity: { duration: 0.2 }
      }}
    />
  );
});

CursorFollower.displayName = 'CursorFollower';

export { ScrollProgress, CursorFollower };