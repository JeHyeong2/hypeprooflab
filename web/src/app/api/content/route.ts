// API Route for CMS content proxy
// This acts as a middleware between the frontend and the actual CMS

import { NextRequest, NextResponse } from 'next/server';
import { ContentFilters, ContentCollection, Content } from '@/types/content';

// Mock data for development - replace with actual CMS integration
const mockContent = {
  article: [
    {
      id: '1',
      slug: 'claude-opus-4-6-alignment',
      title: 'Claude Opus 4.6: When Safety Meets Soul',
      type: 'article' as const,
      excerpt: 'Anthropic\'s latest release isn\'t just an upgrade—it\'s a philosophical statement about where AI alignment is heading.',
      content: {
        format: 'markdown' as const,
        content: '# Claude Opus 4.6: When Safety Meets Soul\n\nAnthropic has just released Claude Opus 4.6...'
      },
      author: {
        id: '1',
        name: 'Jay Lee',
        slug: 'jay-lee',
        role: 'founder' as const,
        expertise: ['AI Safety', 'Machine Learning']
      },
      category: 'research' as const,
      tags: ['Claude', 'AI Safety', 'Alignment'],
      readingTime: 8,
      createdAt: '2026-02-06T00:00:00Z',
      updatedAt: '2026-02-06T00:00:00Z',
      publishedAt: '2026-02-06T00:00:00Z',
      status: 'published' as const
    },
    {
      id: '2',
      slug: 'openai-agents-sdk',
      title: 'The Rise of Agent Frameworks',
      type: 'article' as const,
      excerpt: 'From OpenAI Swarm to Claude Code SDK, the agent wars are heating up. Here\'s what it means for developers.',
      content: {
        format: 'markdown' as const,
        content: '# The Rise of Agent Frameworks\n\nThe AI agent ecosystem is exploding...'
      },
      author: {
        id: '1',
        name: 'Jay Lee',
        slug: 'jay-lee',
        role: 'founder' as const,
        expertise: ['AI Development', 'Software Engineering']
      },
      category: 'analysis' as const,
      tags: ['OpenAI', 'Agents', 'SDK'],
      readingTime: 6,
      createdAt: '2026-02-05T00:00:00Z',
      updatedAt: '2026-02-05T00:00:00Z',
      publishedAt: '2026-02-05T00:00:00Z',
      status: 'published' as const
    }
  ],
  podcast: [
    {
      id: '1',
      slug: 'ai-safety-debate-ep12',
      title: 'The AI Safety Debate: Are We Solving the Right Problem?',
      type: 'podcast' as const,
      description: 'A deep dive into Anthropic\'s Constitutional AI and what it means for the future of alignment.',
      episodeNumber: 12,
      season: 1,
      duration: '42:15',
      audioUrl: 'https://example.com/episode-12.mp3',
      hosts: [{
        id: '1',
        name: 'Jay Lee',
        slug: 'jay-lee',
        role: 'founder' as const
      }],
      category: 'research' as const,
      tags: ['AI Safety', 'Constitutional AI', 'Alignment'],
      createdAt: '2026-02-06T00:00:00Z',
      updatedAt: '2026-02-06T00:00:00Z',
      publishedAt: '2026-02-06T00:00:00Z',
      status: 'published' as const
    }
  ]
};

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const contentType = url.searchParams.get('type') || 'all';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const category = url.searchParams.get('category')?.split(',') || [];
    const tags = url.searchParams.get('tags')?.split(',') || [];
    const search = url.searchParams.get('search') || '';
    const sortBy = url.searchParams.get('sortBy') || 'publishedAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    
    // In production, this would query your actual CMS
    let allContent: Content[] = [];
    
    if (contentType === 'all') {
      allContent = [...mockContent.article, ...mockContent.podcast];
    } else if (contentType in mockContent) {
      allContent = mockContent[contentType as keyof typeof mockContent] as Content[];
    }

    // Apply filters
    let filteredContent = allContent.filter(item => {
      if (category.length > 0 && 'category' in item && !category.includes(item.category as string)) {
        return false;
      }
      if (tags.length > 0 && 'tags' in item && !tags.some(tag => (item as any).tags.includes(tag))) {
        return false;
      }
      if (search && !item.title.toLowerCase().includes(search.toLowerCase()) &&
          !item.description?.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      return true;
    });

    // Apply sorting
    filteredContent.sort((a, b) => {
      const aValue = a[sortBy as keyof Content] as string;
      const bValue = b[sortBy as keyof Content] as string;
      
      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    // Apply pagination
    const total = filteredContent.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedContent = filteredContent.slice(startIndex, endIndex);

    const result: ContentCollection<Content> = {
      items: paginatedContent,
      total,
      page,
      limit,
      hasMore: endIndex < total
    };

    // Set appropriate cache headers
    const response = NextResponse.json({
      success: true,
      data: result
    });

    response.headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
    return response;

  } catch (error) {
    console.error('CMS API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch content'
      }
    }, { status: 500 });
  }
}

// For creating content (admin only)
export async function POST(request: NextRequest) {
  try {
    // In production, add proper authentication and authorization
    const apiKey = request.headers.get('Authorization');
    if (!apiKey || !apiKey.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'API key required'
        }
      }, { status: 401 });
    }

    const contentData = await request.json();
    
    // Validate content data
    if (!contentData.title || !contentData.type) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title and type are required'
        }
      }, { status: 400 });
    }

    // In production, save to your CMS
    const newContent = {
      id: Date.now().toString(),
      slug: contentData.title.toLowerCase().replace(/\s+/g, '-'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft' as const,
      ...contentData
    };

    return NextResponse.json({
      success: true,
      data: newContent
    }, { status: 201 });

  } catch (error) {
    console.error('Content creation error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create content'
      }
    }, { status: 500 });
  }
}