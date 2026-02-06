'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/analytics';

// Global type declarations for Google Analytics
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view on route change
    trackPageView(pathname);
  }, [pathname]);

  useEffect(() => {
    // Track external links
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.hostname !== window.location.hostname) {
        // Track external link click
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'click', {
            event_category: 'outbound',
            event_label: link.href,
            transport_type: 'beacon'
          });
        }
      }
    };

    // Track downloads
    const handleDownload = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href) {
        const url = new URL(link.href, window.location.origin);
        const pathname = url.pathname.toLowerCase();
        const downloadExtensions = ['.pdf', '.doc', '.docx', '.zip', '.png', '.jpg'];
        
        if (downloadExtensions.some(ext => pathname.endsWith(ext))) {
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'file_download', {
              event_category: 'downloads',
              event_label: pathname.split('/').pop(),
              transport_type: 'beacon'
            });
          }
        }
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('click', handleDownload);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('click', handleDownload);
    };
  }, []);

  return <>{children}</>;
};