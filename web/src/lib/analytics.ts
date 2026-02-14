// Analytics and tracking utilities

// Global type declarations for Google Analytics
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// AI Referrer detection
export const AI_REFERRERS: Record<string, string> = {
  'chat.openai.com': 'chatgpt',
  'chatgpt.com': 'chatgpt',
  'perplexity.ai': 'perplexity',
  'gemini.google.com': 'gemini',
  'claude.ai': 'claude',
  'copilot.microsoft.com': 'copilot',
  'you.com': 'you',
  'phind.com': 'phind',
};

/**
 * Detect AI referral source from a referrer URL
 */
export function detectAIReferrer(referrer: string): string | null {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    const hostname = url.hostname.replace(/^www\./, '');
    for (const [domain, source] of Object.entries(AI_REFERRERS)) {
      if (hostname === domain || hostname.endsWith('.' + domain)) {
        return source;
      }
    }
  } catch {
    // invalid URL, try substring match
    for (const [domain, source] of Object.entries(AI_REFERRERS)) {
      if (referrer.includes(domain)) {
        return source;
      }
    }
  }
  return null;
}

/**
 * Parse UTM parameters from URL
 */
export function parseUTMParams(url?: string): Record<string, string> {
  if (typeof window === 'undefined' && !url) return {};
  try {
    const searchParams = new URLSearchParams(
      url ? new URL(url).search : window.location.search
    );
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    const params: Record<string, string> = {};
    for (const key of utmKeys) {
      const val = searchParams.get(key);
      if (val) params[key] = val;
    }
    return params;
  } catch {
    return {};
  }
}

/**
 * Track AI referral event (once per session)
 */
function trackAIReferralIfNeeded(): void {
  if (typeof window === 'undefined') return;
  const key = 'hp_ai_referral_tracked';
  if (sessionStorage.getItem(key)) return;

  const source = detectAIReferrer(document.referrer);
  if (source) {
    sessionStorage.setItem(key, source);
    if (window.gtag) {
      window.gtag('event', 'ai_referral', {
        ai_source: source,
        referrer: document.referrer,
      });
    }
  }
}

/**
 * Track content view (column, novel, etc.)
 */
export function trackContentView(slug: string, type: 'column' | 'novel' | string): void {
  if (typeof window === 'undefined') return;
  if (window.gtag) {
    window.gtag('event', 'content_view', {
      content_slug: slug,
      content_type: type,
    });
  }
}
export interface AnalyticsEvent {
  name: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
}

export interface UserProperties {
  userId?: string;
  sessionId: string;
  locale: string;
  timezone: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  userAgent: string;
  referrer: string;
  landingPage: string;
  timestamp: string;
}

export interface PageViewEvent {
  page: string;
  title: string;
  referrer: string;
  timestamp: string;
  userId?: string;
  sessionId: string;
  duration?: number;
}

export interface ConversionEvent {
  type: 'email_signup' | 'contact_click' | 'social_follow' | 'content_share';
  value?: number;
  properties?: Record<string, any>;
}

// Analytics service providers
export type AnalyticsProvider = 'google' | 'mixpanel' | 'amplitude' | 'posthog' | 'custom';

export class AnalyticsService {
  private providers: Map<AnalyticsProvider, any> = new Map();
  private isEnabled: boolean = true;
  private sessionId: string;
  private userId?: string;
  private debug: boolean = process.env.NODE_ENV === 'development';

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isEnabled = this.getTrackingConsent();
    this.initializeProviders();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getTrackingConsent(): boolean {
    if (typeof window === 'undefined') return false;
    
    const consent = localStorage.getItem('analytics_consent');
    return consent !== 'denied';
  }

  private initializeProviders(): void {
    if (typeof window === 'undefined' || !this.isEnabled) return;

    // Google Analytics 4
    if (process.env.NEXT_PUBLIC_GA4_ID) {
      this.initializeGA4(process.env.NEXT_PUBLIC_GA4_ID);
    }

    // Custom analytics endpoint
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      this.providers.set('custom', {
        endpoint: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT,
        apiKey: process.env.NEXT_PUBLIC_ANALYTICS_API_KEY
      });
    }
  }

  private initializeGA4(measurementId: string): void {
    // Load Google Analytics 4
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function(...args: any[]) {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      page_title: document.title,
      page_location: window.location.href
    });

    this.providers.set('google', { gtag: window.gtag, measurementId });
  }

  setUserId(userId: string): void {
    this.userId = userId;
    
    // Update all providers
    const ga = this.providers.get('google');
    if (ga) {
      window.gtag('config', ga.measurementId, { user_id: userId });
    }
  }

  setUserProperties(properties: Partial<UserProperties>): void {
    if (!this.isEnabled) return;

    const ga = this.providers.get('google');
    if (ga) {
      window.gtag('set', 'user_properties', properties);
    }

    this.sendToCustomProvider('user_properties', properties);
  }

  trackPageView(page: string, title?: string): void {
    if (!this.isEnabled) return;

    const event: PageViewEvent = {
      page,
      title: title || document.title,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId
    };

    // Google Analytics
    const ga = this.providers.get('google');
    if (ga) {
      window.gtag('event', 'page_view', {
        page_title: event.title,
        page_location: window.location.href,
        page_referrer: event.referrer
      });
    }

    // Track UTM parameters
    const utmParams = parseUTMParams();
    if (Object.keys(utmParams).length > 0 && ga) {
      window.gtag('set', { ...utmParams });
    }

    // Detect AI referral
    trackAIReferralIfNeeded();

    this.sendToCustomProvider('page_view', event);
    
    if (this.debug) {
      console.log('📊 Page View:', event);
    }
  }

  trackEvent(event: AnalyticsEvent): void {
    if (!this.isEnabled) return;

    const eventData = {
      ...event,
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: new Date().toISOString()
    };

    // Google Analytics
    const ga = this.providers.get('google');
    if (ga) {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.properties
      });
    }

    this.sendToCustomProvider('event', eventData);
    
    if (this.debug) {
      console.log('📊 Event:', eventData);
    }
  }

  trackConversion(conversion: ConversionEvent): void {
    if (!this.isEnabled) return;

    const eventData = {
      ...conversion,
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: new Date().toISOString()
    };

    // Google Analytics conversion
    const ga = this.providers.get('google');
    if (ga) {
      window.gtag('event', 'conversion', {
        send_to: ga.measurementId,
        event_category: 'conversion',
        event_label: conversion.type,
        value: conversion.value || 1
      });
    }

    this.sendToCustomProvider('conversion', eventData);
    
    if (this.debug) {
      console.log('📊 Conversion:', eventData);
    }
  }

  trackError(error: Error, context?: string): void {
    if (!this.isEnabled) return;

    const errorData = {
      message: error.message,
      stack: error.stack,
      context,
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Google Analytics exception
    const ga = this.providers.get('google');
    if (ga) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false
      });
    }

    this.sendToCustomProvider('error', errorData);
    
    if (this.debug) {
      console.log('📊 Error:', errorData);
    }
  }

  trackPerformance(metric: string, value: number, unit?: string): void {
    if (!this.isEnabled) return;

    const perfData = {
      metric,
      value,
      unit,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    // Google Analytics custom event
    const ga = this.providers.get('google');
    if (ga) {
      window.gtag('event', 'timing_complete', {
        name: metric,
        value: Math.round(value)
      });
    }

    this.sendToCustomProvider('performance', perfData);
    
    if (this.debug) {
      console.log('📊 Performance:', perfData);
    }
  }

  private async sendToCustomProvider(eventType: string, data: any): Promise<void> {
    const custom = this.providers.get('custom');
    if (!custom) return;

    try {
      await fetch(custom.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${custom.apiKey}`
        },
        body: JSON.stringify({
          type: eventType,
          data,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to send analytics data:', error);
    }
  }

  setTrackingConsent(consent: boolean): void {
    this.isEnabled = consent;
    localStorage.setItem('analytics_consent', consent ? 'granted' : 'denied');
    
    if (consent && this.providers.size === 0) {
      this.initializeProviders();
    }
  }

  getDeviceType(): 'desktop' | 'tablet' | 'mobile' {
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  getUserProperties(): UserProperties {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      locale: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      deviceType: this.getDeviceType(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      landingPage: window.location.href,
      timestamp: new Date().toISOString()
    };
  }
}

// Global analytics instance
export const analytics = new AnalyticsService();

// Convenience functions
export const trackEvent = (event: AnalyticsEvent) => analytics.trackEvent(event);
export const trackPageView = (page: string, title?: string) => analytics.trackPageView(page, title);
export const trackConversion = (conversion: ConversionEvent) => analytics.trackConversion(conversion);
export const trackError = (error: Error, context?: string) => analytics.trackError(error, context);
export const trackPerformance = (metric: string, value: number, unit?: string) => 
  analytics.trackPerformance(metric, value, unit);

// React hook for analytics
export const useAnalytics = () => {
  return {
    trackEvent,
    trackPageView,
    trackConversion,
    trackError,
    trackPerformance,
    setUserId: (userId: string) => analytics.setUserId(userId),
    setUserProperties: (props: Partial<UserProperties>) => analytics.setUserProperties(props)
  };
};

// Performance monitoring
export const performanceObserver = {
  init() {
    if (typeof window === 'undefined') return;

    // Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            trackPerformance('LCP', entry.startTime, 'ms');
          }
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      // First Input Delay
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'first-input') {
            trackPerformance('FID', (entry as any).processingStart - entry.startTime, 'ms');
          }
        }
      }).observe({ type: 'first-input', buffered: true });

      // Cumulative Layout Shift
      new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        if (clsValue > 0) {
          trackPerformance('CLS', clsValue);
        }
      }).observe({ type: 'layout-shift', buffered: true });
    }

    // Page load timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
        
        trackPerformance('page_load_time', loadTime, 'ms');
        trackPerformance('dom_ready_time', domReady, 'ms');
      }, 0);
    });
  }
};

// Scroll depth tracking
export const scrollDepthTracker = {
  thresholds: [25, 50, 75, 90, 100],
  tracked: new Set<number>(),
  
  init() {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;

      this.thresholds.forEach(threshold => {
        if (scrollPercent >= threshold && !this.tracked.has(threshold)) {
          this.tracked.add(threshold);
          trackEvent({
            name: 'scroll_depth',
            category: 'engagement',
            action: 'scroll',
            label: `${threshold}%`,
            value: threshold
          });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }
};

// Auto-initialize performance monitoring
if (typeof window !== 'undefined') {
  performanceObserver.init();
  scrollDepthTracker.init();
}