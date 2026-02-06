'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getDefaultCMSClient } from '@/lib/api';
import { 
  Content, 
  ContentCollection, 
  ContentFilters,
  Article,
  PodcastEpisode,
  ResearchPaper,
  Event,
  Author
} from '@/types/content';

export interface UseContentOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
  cacheTime?: number;
  retry?: boolean;
  retryDelay?: number;
}

export interface UseContentResult<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isFetching: boolean;
}

export interface UseContentCollectionResult<T extends Content> {
  data: ContentCollection<T> | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isFetching: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  isLoadingMore: boolean;
}

// Generic content hook
export function useContent<T extends Content>(
  type: string,
  id: string,
  options: UseContentOptions = {}
): UseContentResult<T> {
  const {
    enabled = true,
    refetchOnWindowFocus = false,
    staleTime = 5 * 60 * 1000, // 5 minutes
    retry = true,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const client = useMemo(() => getDefaultCMSClient(), []);

  const fetchContent = useCallback(async (force = false) => {
    if (!enabled) return;

    // Check if data is still fresh
    const now = Date.now();
    if (!force && data && (now - lastFetchTime) < staleTime) {
      return;
    }

    setIsFetching(true);
    setIsError(false);
    setError(null);

    let retryCount = 0;
    const maxRetries = retry ? 3 : 0;

    while (retryCount <= maxRetries) {
      try {
        const response = await client.getContentById<T>(type, id);
        
        if (response.success && response.data) {
          setData(response.data);
          setLastFetchTime(now);
          setIsLoading(false);
          setIsFetching(false);
          setIsError(false);
          setError(null);
          return;
        } else if (response.error) {
          throw new Error(response.error.message);
        }
      } catch (err) {
        const error = err as Error;
        
        if (retryCount === maxRetries) {
          setIsError(true);
          setError(error);
          setIsLoading(false);
          setIsFetching(false);
          return;
        }
        
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
      }
    }
  }, [enabled, type, id, data, lastFetchTime, staleTime, client, retry, retryDelay]);

  const refetch = useCallback(() => fetchContent(true), [fetchContent]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchContent();
    }
  }, [fetchContent]);

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        fetchContent();
      }
    };

    document.addEventListener('visibilitychange', handleFocus);
    return () => document.removeEventListener('visibilitychange', handleFocus);
  }, [refetchOnWindowFocus, fetchContent]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  };
}

// Content by slug hook
export function useContentBySlug<T extends Content>(
  type: string,
  slug: string,
  options: UseContentOptions = {}
): UseContentResult<T> {
  const {
    enabled = true,
    refetchOnWindowFocus = false,
    staleTime = 5 * 60 * 1000,
    retry = true,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const client = useMemo(() => getDefaultCMSClient(), []);

  const fetchContent = useCallback(async (force = false) => {
    if (!enabled) return;

    const now = Date.now();
    if (!force && data && (now - lastFetchTime) < staleTime) {
      return;
    }

    setIsFetching(true);
    setIsError(false);
    setError(null);

    try {
      const response = await client.getContentBySlug<T>(type, slug);
      
      if (response.success && response.data) {
        setData(response.data);
        setLastFetchTime(now);
      } else if (response.error) {
        throw new Error(response.error.message);
      }
    } catch (err) {
      setIsError(true);
      setError(err as Error);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [enabled, type, slug, data, lastFetchTime, staleTime, client]);

  const refetch = useCallback(() => fetchContent(true), [fetchContent]);

  useEffect(() => {
    if (enabled) {
      fetchContent();
    }
  }, [fetchContent]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  };
}

// Content collection hook with pagination
export function useContentCollection<T extends Content>(
  type: string,
  filters: Partial<ContentFilters> = {},
  options: UseContentOptions = {}
): UseContentCollectionResult<T> {
  const {
    enabled = true,
    refetchOnWindowFocus = false,
    staleTime = 5 * 60 * 1000,
    retry = true,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState<ContentCollection<T> | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const client = useMemo(() => getDefaultCMSClient(), []);

  const fetchContent = useCallback(async (force = false, append = false) => {
    if (!enabled) return;

    const now = Date.now();
    if (!force && data && !append && (now - lastFetchTime) < staleTime) {
      return;
    }

    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsFetching(true);
      setIsError(false);
      setError(null);
    }

    try {
      const currentPage = append ? (data?.page || 0) + 1 : 1;
      const response = await client.getContent<T>(type, {
        ...filters,
        // Add pagination parameters
      });
      
      if (response.success && response.data) {
        if (append && data) {
          setData({
            ...response.data,
            items: [...data.items, ...response.data.items]
          });
        } else {
          setData(response.data);
        }
        setLastFetchTime(now);
      } else if (response.error) {
        throw new Error(response.error.message);
      }
    } catch (err) {
      setIsError(true);
      setError(err as Error);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
      setIsLoadingMore(false);
    }
  }, [enabled, type, filters, data, lastFetchTime, staleTime, client]);

  const refetch = useCallback(() => fetchContent(true, false), [fetchContent]);
  const loadMore = useCallback(() => fetchContent(true, true), [fetchContent]);

  useEffect(() => {
    if (enabled) {
      fetchContent();
    }
  }, [fetchContent]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    hasMore: data?.hasMore || false,
    loadMore,
    isLoadingMore
  };
}

// Specific content type hooks
export function useLatestArticles(limit: number = 6) {
  return useContentCollection<Article>('article', {
    status: ['published'],
    sortBy: 'publishedAt',
    sortOrder: 'desc'
  });
}

export function useLatestPodcastEpisodes(limit: number = 5) {
  return useContentCollection<PodcastEpisode>('podcast', {
    status: ['published'],
    sortBy: 'publishedAt',
    sortOrder: 'desc'
  });
}

export function useUpcomingEvents() {
  const today = new Date().toISOString().split('T')[0];
  return useContentCollection<Event>('event', {
    dateFrom: today,
    sortBy: 'startDate',
    sortOrder: 'asc'
  });
}

export function useArticle(slug: string) {
  return useContentBySlug<Article>('article', slug);
}

export function usePodcastEpisode(slug: string) {
  return useContentBySlug<PodcastEpisode>('podcast', slug);
}

export function useResearchPaper(slug: string) {
  return useContentBySlug<ResearchPaper>('research', slug);
}

// Author hooks
export function useAuthor(slug: string): UseContentResult<Author> {
  const [data, setData] = useState<Author | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const client = useMemo(() => getDefaultCMSClient(), []);

  const fetchAuthor = useCallback(async () => {
    setIsFetching(true);
    setIsError(false);
    setError(null);

    try {
      const response = await client.getAuthorBySlug(slug);
      
      if (response.success && response.data) {
        setData(response.data);
      } else if (response.error) {
        throw new Error(response.error.message);
      }
    } catch (err) {
      setIsError(true);
      setError(err as Error);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [slug, client]);

  const refetch = useCallback(() => fetchAuthor(), [fetchAuthor]);

  useEffect(() => {
    fetchAuthor();
  }, [fetchAuthor]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  };
}

// Search hook
export function useContentSearch(query: string, filters: Partial<ContentFilters> = {}) {
  return useContentCollection<Content>('all', {
    ...filters,
    search: query
  }, {
    enabled: query.length >= 3 // Only search with 3+ characters
  });
}