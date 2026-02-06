// API Client for HypeProof CMS
// Supports multiple backends: Strapi, Contentful, Sanity, or custom API

import { 
  Content, 
  ContentCollection, 
  ContentFilters, 
  APIResponse,
  Article,
  PodcastEpisode,
  ResearchPaper,
  Event,
  Newsletter,
  Author
} from '@/types/content';

export class APIError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export interface APIConfig {
  baseURL: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
  cacheStrategy?: 'none' | 'memory' | 'localStorage' | 'sessionStorage';
  cacheDuration?: number; // milliseconds
}

export class CMSClient {
  private config: APIConfig;
  private cache = new Map<string, { data: any; expiry: number }>();

  constructor(config: APIConfig) {
    this.config = {
      timeout: 5000,
      retries: 3,
      cacheStrategy: 'memory',
      cacheDuration: 5 * 60 * 1000, // 5 minutes
      ...config
    };
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {},
    useCache: boolean = true
  ): Promise<APIResponse<T>> {
    const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
    
    // Check cache first
    if (useCache && this.config.cacheStrategy !== 'none') {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached) return cached;
    }

    const url = `${this.config.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const requestOptions: RequestInit = {
      ...options,
      headers,
      signal: AbortSignal.timeout(this.config.timeout!),
    };

    let lastError: Error = new Error('Unknown error');

    for (let attempt = 0; attempt <= this.config.retries!; attempt++) {
      try {
        const response = await fetch(url, requestOptions);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new APIError(
            response.status,
            errorData.code || 'HTTP_ERROR',
            errorData.message || response.statusText,
            errorData
          );
        }

        const data = await response.json();
        const result: APIResponse<T> = {
          success: true,
          data
        };

        // Cache successful responses
        if (useCache && this.config.cacheStrategy !== 'none') {
          this.setInCache(cacheKey, result);
        }

        return result;
        
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on client errors (4xx)
        if (error instanceof APIError && error.status < 500) {
          break;
        }

        // Exponential backoff
        if (attempt < this.config.retries!) {
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        }
      }
    }

    return {
      success: false,
      error: {
        code: lastError instanceof APIError ? lastError.code : 'NETWORK_ERROR',
        message: lastError.message,
        details: lastError instanceof APIError ? lastError.details : undefined
      }
    };
  }

  private getFromCache<T>(key: string): APIResponse<T> | null {
    if (this.config.cacheStrategy === 'none') return null;

    let cached;
    if (this.config.cacheStrategy === 'memory') {
      cached = this.cache.get(key);
    } else if (this.config.cacheStrategy === 'localStorage' && typeof window !== 'undefined') {
      const item = localStorage.getItem(`cms_cache_${key}`);
      cached = item ? JSON.parse(item) : null;
    } else if (this.config.cacheStrategy === 'sessionStorage' && typeof window !== 'undefined') {
      const item = sessionStorage.getItem(`cms_cache_${key}`);
      cached = item ? JSON.parse(item) : null;
    }

    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    return null;
  }

  private setInCache<T>(key: string, data: APIResponse<T>): void {
    if (this.config.cacheStrategy === 'none') return;

    const item = {
      data,
      expiry: Date.now() + this.config.cacheDuration!
    };

    if (this.config.cacheStrategy === 'memory') {
      this.cache.set(key, item);
    } else if (this.config.cacheStrategy === 'localStorage' && typeof window !== 'undefined') {
      localStorage.setItem(`cms_cache_${key}`, JSON.stringify(item));
    } else if (this.config.cacheStrategy === 'sessionStorage' && typeof window !== 'undefined') {
      sessionStorage.setItem(`cms_cache_${key}`, JSON.stringify(item));
    }
  }

  // Content retrieval methods
  async getContent<T extends Content>(
    type: string,
    filters: Partial<ContentFilters> = {},
    options: { useCache?: boolean } = {}
  ): Promise<APIResponse<ContentCollection<T>>> {
    const params = new URLSearchParams();
    
    if (filters.category?.length) {
      params.append('category', filters.category.join(','));
    }
    if (filters.tags?.length) {
      params.append('tags', filters.tags.join(','));
    }
    if (filters.author?.length) {
      params.append('author', filters.author.join(','));
    }
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.sortBy) {
      params.append('sortBy', filters.sortBy);
    }
    if (filters.sortOrder) {
      params.append('sortOrder', filters.sortOrder);
    }
    if (filters.dateFrom) {
      params.append('dateFrom', filters.dateFrom);
    }
    if (filters.dateTo) {
      params.append('dateTo', filters.dateTo);
    }

    const queryString = params.toString();
    const endpoint = `/api/content/${type}${queryString ? `?${queryString}` : ''}`;
    
    return this.request<ContentCollection<T>>(endpoint, {}, options.useCache !== false);
  }

  async getContentById<T extends Content>(
    type: string,
    id: string,
    options: { useCache?: boolean } = {}
  ): Promise<APIResponse<T>> {
    return this.request<T>(`/api/content/${type}/${id}`, {}, options.useCache !== false);
  }

  async getContentBySlug<T extends Content>(
    type: string,
    slug: string,
    options: { useCache?: boolean } = {}
  ): Promise<APIResponse<T>> {
    return this.request<T>(`/api/content/${type}/slug/${slug}`, {}, options.useCache !== false);
  }

  // Specific content type methods
  async getLatestPodcastEpisodes(limit: number = 5): Promise<APIResponse<ContentCollection<PodcastEpisode>>> {
    return this.getContent<PodcastEpisode>('podcast', {
      status: ['published'],
      sortBy: 'publishedAt',
      sortOrder: 'desc'
    });
  }

  async getLatestArticles(limit: number = 6): Promise<APIResponse<ContentCollection<Article>>> {
    return this.getContent<Article>('article', {
      status: ['published'],
      sortBy: 'publishedAt',
      sortOrder: 'desc'
    });
  }

  async getFeaturedContent(): Promise<APIResponse<Content[]>> {
    return this.request<Content[]>('/api/content/featured');
  }

  async getUpcomingEvents(): Promise<APIResponse<ContentCollection<Event>>> {
    const today = new Date().toISOString().split('T')[0];
    return this.getContent<Event>('event', {
      dateFrom: today,
      sortBy: 'startDate',
      sortOrder: 'asc'
    });
  }

  async getAuthors(): Promise<APIResponse<Author[]>> {
    return this.request<Author[]>('/api/authors');
  }

  async getAuthorById(id: string): Promise<APIResponse<Author>> {
    return this.request<Author>(`/api/authors/${id}`);
  }

  async getAuthorBySlug(slug: string): Promise<APIResponse<Author>> {
    return this.request<Author>(`/api/authors/slug/${slug}`);
  }

  async searchContent(query: string, filters: Partial<ContentFilters> = {}): Promise<APIResponse<ContentCollection<Content>>> {
    return this.getContent<Content>('all', {
      ...filters,
      search: query
    });
  }

  // Newsletter subscription
  async subscribeNewsletter(email: string, preferences: any = {}): Promise<APIResponse<{ success: boolean }>> {
    return this.request('/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email, preferences })
    }, false);
  }

  // Analytics and tracking
  async trackContentView(contentId: string, contentType: string): Promise<void> {
    try {
      await this.request('/api/analytics/view', {
        method: 'POST',
        body: JSON.stringify({ contentId, contentType })
      }, false);
    } catch (error) {
      // Silent fail for analytics
      console.warn('Failed to track content view:', error);
    }
  }

  // Cache management
  clearCache(): void {
    if (this.config.cacheStrategy === 'memory') {
      this.cache.clear();
    } else if (this.config.cacheStrategy === 'localStorage' && typeof window !== 'undefined') {
      Object.keys(localStorage)
        .filter(key => key.startsWith('cms_cache_'))
        .forEach(key => localStorage.removeItem(key));
    } else if (this.config.cacheStrategy === 'sessionStorage' && typeof window !== 'undefined') {
      Object.keys(sessionStorage)
        .filter(key => key.startsWith('cms_cache_'))
        .forEach(key => sessionStorage.removeItem(key));
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.request('/api/health', {}, false);
      return response.success;
    } catch {
      return false;
    }
  }
}

// Default client instance
let defaultClient: CMSClient | null = null;

export function createCMSClient(config: APIConfig): CMSClient {
  return new CMSClient(config);
}

export function getDefaultCMSClient(): CMSClient {
  if (!defaultClient) {
    const config: APIConfig = {
      baseURL: process.env.NEXT_PUBLIC_CMS_API_URL || 'https://api.hypeproof.ai',
      apiKey: process.env.NEXT_PUBLIC_CMS_API_KEY,
    };
    defaultClient = new CMSClient(config);
  }
  return defaultClient;
}

// Utility functions for Next.js
export async function getStaticContent<T extends Content>(
  type: string,
  filters: Partial<ContentFilters> = {}
): Promise<ContentCollection<T>> {
  const client = getDefaultCMSClient();
  const response = await client.getContent<T>(type, filters, { useCache: false });
  
  if (!response.success) {
    console.error('Failed to fetch static content:', response.error);
    return {
      items: [],
      total: 0,
      page: 1,
      limit: 10,
      hasMore: false
    };
  }

  return response.data!;
}

export async function getStaticContentById<T extends Content>(
  type: string,
  id: string
): Promise<T | null> {
  const client = getDefaultCMSClient();
  const response = await client.getContentById<T>(type, id, { useCache: false });
  
  if (!response.success) {
    console.error('Failed to fetch content by ID:', response.error);
    return null;
  }

  return response.data!;
}

export async function getStaticContentBySlug<T extends Content>(
  type: string,
  slug: string
): Promise<T | null> {
  const client = getDefaultCMSClient();
  const response = await client.getContentBySlug<T>(type, slug, { useCache: false });
  
  if (!response.success) {
    console.error('Failed to fetch content by slug:', response.error);
    return null;
  }

  return response.data!;
}