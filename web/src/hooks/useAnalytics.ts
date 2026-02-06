'use client';

import { useEffect, useRef, useCallback } from 'react';
import { analytics, trackEvent, trackPageView, trackConversion } from '@/lib/analytics';
import { useRouter } from 'next/navigation';

// Hook for tracking page views
export const usePageTracking = () => {
  const router = useRouter();
  
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      trackPageView(url);
    };

    // Track initial page load
    trackPageView(window.location.pathname);

    // In Next.js 13+, we need to manually track route changes
    // This is a simplified version - in production you might want to use a more robust solution
    const originalPush = router.push;
    router.push = (...args) => {
      const result = originalPush.apply(router, args);
      setTimeout(() => {
        handleRouteChange(window.location.pathname);
      }, 0);
      return result;
    };

    return () => {
      router.push = originalPush;
    };
  }, [router]);
};

// Hook for tracking element visibility
export const useVisibilityTracking = (
  elementName: string,
  threshold: number = 0.5,
  trackOnce: boolean = true
) => {
  const ref = useRef<HTMLElement | null>(null);
  const hasTracked = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!trackOnce || !hasTracked.current)) {
          trackEvent({
            name: 'element_visible',
            category: 'engagement',
            action: 'view',
            label: elementName
          });
          hasTracked.current = true;
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [elementName, threshold, trackOnce]);

  return ref;
};

// Hook for tracking click events
export const useClickTracking = () => {
  const trackClick = useCallback((
    elementName: string,
    category: string = 'interaction',
    properties?: Record<string, any>
  ) => {
    trackEvent({
      name: 'click',
      category,
      action: 'click',
      label: elementName,
      properties
    });
  }, []);

  return trackClick;
};

// Hook for tracking form interactions
export const useFormTracking = (formName: string) => {
  const trackFormStart = useCallback(() => {
    trackEvent({
      name: 'form_start',
      category: 'forms',
      action: 'start',
      label: formName
    });
  }, [formName]);

  const trackFormComplete = useCallback((data?: Record<string, any>) => {
    trackEvent({
      name: 'form_complete',
      category: 'forms',
      action: 'complete',
      label: formName,
      properties: data
    });
    
    trackConversion({
      type: 'email_signup',
      properties: { form: formName, ...data }
    });
  }, [formName]);

  const trackFormError = useCallback((error: string) => {
    trackEvent({
      name: 'form_error',
      category: 'forms',
      action: 'error',
      label: formName,
      properties: { error }
    });
  }, [formName]);

  const trackFieldFocus = useCallback((fieldName: string) => {
    trackEvent({
      name: 'form_field_focus',
      category: 'forms',
      action: 'focus',
      label: `${formName}_${fieldName}`
    });
  }, [formName]);

  return {
    trackFormStart,
    trackFormComplete,
    trackFormError,
    trackFieldFocus
  };
};

// Hook for tracking scroll depth
export const useScrollTracking = (elementName?: string) => {
  const ref = useRef<HTMLElement | null>(null);
  const thresholds = [25, 50, 75, 90, 100];
  const tracked = useRef(new Set<number>());

  useEffect(() => {
    const element = elementName ? ref.current : window;
    if (!element) return;

    const handleScroll = () => {
      let scrollPercent: number;
      
      if (elementName && ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const scrollTop = window.pageYOffset;
        const elementTop = scrollTop + rect.top;
        const elementHeight = rect.height;
        const viewportHeight = window.innerHeight;
        
        const visibleStart = Math.max(scrollTop, elementTop);
        const visibleEnd = Math.min(scrollTop + viewportHeight, elementTop + elementHeight);
        const visibleHeight = Math.max(0, visibleEnd - visibleStart);
        
        scrollPercent = (visibleHeight / elementHeight) * 100;
      } else {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        scrollPercent = (scrollTop / docHeight) * 100;
      }

      thresholds.forEach(threshold => {
        if (scrollPercent >= threshold && !tracked.current.has(threshold)) {
          tracked.current.add(threshold);
          trackEvent({
            name: 'scroll_depth',
            category: 'engagement',
            action: 'scroll',
            label: elementName || 'page',
            value: threshold,
            properties: { threshold: `${threshold}%` }
          });
        }
      });
    };

    const scrollTarget = elementName ? window : window;
    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      scrollTarget.removeEventListener('scroll', handleScroll);
    };
  }, [elementName]);

  return elementName ? ref : null;
};

// Hook for tracking time on page/element
export const useTimeTracking = (elementName: string, reportInterval: number = 30000) => {
  const ref = useRef<HTMLElement | null>(null);
  const startTime = useRef<number | null>(null);
  const lastReport = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Element is visible
          if (!startTime.current) {
            startTime.current = Date.now();
            lastReport.current = startTime.current;
            
            // Set up periodic reporting
            intervalRef.current = setInterval(() => {
              const now = Date.now();
              const timeSpent = now - (lastReport.current || now);
              
              trackEvent({
                name: 'time_on_element',
                category: 'engagement',
                action: 'time_spent',
                label: elementName,
                value: timeSpent,
                properties: { interval: reportInterval }
              });
              
              lastReport.current = now;
            }, reportInterval);
          }
        } else {
          // Element is not visible
          if (startTime.current && intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            
            const totalTime = Date.now() - startTime.current;
            trackEvent({
              name: 'time_on_element_total',
              category: 'engagement', 
              action: 'time_spent_total',
              label: elementName,
              value: totalTime
            });
            
            startTime.current = null;
            lastReport.current = null;
          }
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [elementName, reportInterval]);

  return ref;
};

// Hook for tracking external link clicks
export const useExternalLinkTracking = () => {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.hostname !== window.location.hostname) {
        trackEvent({
          name: 'external_link_click',
          category: 'outbound',
          action: 'click',
          label: link.href,
          properties: {
            text: link.textContent?.trim(),
            destination: link.hostname
          }
        });
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
};

// Hook for tracking download clicks
export const useDownloadTracking = () => {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href) {
        const url = new URL(link.href, window.location.origin);
        const pathname = url.pathname.toLowerCase();
        
        // Check if it's a download link
        const downloadExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.rar'];
        const isDownload = downloadExtensions.some(ext => pathname.endsWith(ext));
        
        if (isDownload || link.hasAttribute('download')) {
          trackEvent({
            name: 'file_download',
            category: 'downloads',
            action: 'download',
            label: link.href,
            properties: {
              filename: pathname.split('/').pop(),
              fileType: pathname.split('.').pop()
            }
          });
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
};

// Hook for tracking video/media interactions
export const useMediaTracking = (mediaName: string, mediaType: 'video' | 'audio' = 'video') => {
  const trackPlay = useCallback(() => {
    trackEvent({
      name: 'media_play',
      category: 'media',
      action: 'play',
      label: `${mediaType}_${mediaName}`
    });
  }, [mediaName, mediaType]);

  const trackPause = useCallback(() => {
    trackEvent({
      name: 'media_pause',
      category: 'media',
      action: 'pause',
      label: `${mediaType}_${mediaName}`
    });
  }, [mediaName, mediaType]);

  const trackComplete = useCallback(() => {
    trackEvent({
      name: 'media_complete',
      category: 'media',
      action: 'complete',
      label: `${mediaType}_${mediaName}`
    });
    
    trackConversion({
      type: 'content_share',
      properties: { media: mediaName, type: mediaType }
    });
  }, [mediaName, mediaType]);

  const trackProgress = useCallback((percent: number) => {
    const milestone = Math.floor(percent / 25) * 25; // 0, 25, 50, 75, 100
    
    trackEvent({
      name: 'media_progress',
      category: 'media',
      action: 'progress',
      label: `${mediaType}_${mediaName}`,
      value: milestone,
      properties: { percent }
    });
  }, [mediaName, mediaType]);

  return {
    trackPlay,
    trackPause,
    trackComplete,
    trackProgress
  };
};

// Hook for A/B test tracking
export const useABTestTracking = (testName: string, variant: string) => {
  useEffect(() => {
    trackEvent({
      name: 'ab_test_view',
      category: 'experiments',
      action: 'view',
      label: testName,
      properties: { variant }
    });
    
    // Set user property for segmentation
    analytics.setUserProperties({ [`ab_test_${testName}`]: variant });
  }, [testName, variant]);

  const trackConversion = useCallback((conversionType: string, value?: number) => {
    trackEvent({
      name: 'ab_test_conversion',
      category: 'experiments',
      action: 'convert',
      label: testName,
      value,
      properties: { 
        variant,
        conversionType
      }
    });
  }, [testName, variant]);

  return { trackConversion };
};