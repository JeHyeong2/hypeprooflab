// Content Management System Type Definitions
// Designed for headless CMS (Strapi, Contentful, Sanity, or custom API)

export interface BaseContent {
  id: string;
  slug: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  status: 'draft' | 'published' | 'archived';
  seo?: SEOMetadata;
}

export interface SEOMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: MediaAsset;
  canonicalUrl?: string;
  noIndex?: boolean;
}

export interface MediaAsset {
  id: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  mimeType: string;
  size: number;
  caption?: string;
  credits?: string;
}

export interface Author {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  avatar?: MediaAsset;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  role: 'founder' | 'researcher' | 'contributor' | 'guest';
  expertise?: string[];
}

// Podcast Content Types
export interface PodcastEpisode extends BaseContent {
  type: 'podcast';
  episodeNumber: number;
  season?: number;
  duration: string; // Format: "42:15"
  audioUrl: string;
  transcript?: string;
  chapters?: PodcastChapter[];
  guests?: Author[];
  hosts: Author[];
  tags: string[];
  category: PodcastCategory;
  spotifyUrl?: string;
  appleUrl?: string;
  youtubeUrl?: string;
  downloadUrl?: string;
}

export interface PodcastChapter {
  title: string;
  timestamp: string; // Format: "12:34"
  description?: string;
}

export type PodcastCategory = 
  | 'research' 
  | 'interview' 
  | 'analysis' 
  | 'discussion' 
  | 'news';

// Article/Blog Content Types
export interface Article extends BaseContent {
  type: 'article';
  excerpt: string;
  content: RichContent;
  author: Author;
  coAuthors?: Author[];
  featuredImage?: MediaAsset;
  category: ArticleCategory;
  tags: string[];
  readingTime: number; // minutes
  isPartOfSeries?: boolean;
  seriesId?: string;
  seriesOrder?: number;
  relatedArticles?: string[]; // Article IDs
}

export type ArticleCategory = 
  | 'research' 
  | 'analysis' 
  | 'opinion' 
  | 'tutorial' 
  | 'news' 
  | 'review';

// Research Content Types
export interface ResearchPaper extends BaseContent {
  type: 'research';
  abstract: string;
  content: RichContent;
  authors: Author[];
  methodology?: string;
  datasets?: Dataset[];
  codeRepository?: string;
  arxivId?: string;
  doi?: string;
  citations?: Citation[];
  tags: string[];
  researchField: ResearchField;
}

export type ResearchField = 
  | 'machine-learning' 
  | 'natural-language-processing' 
  | 'computer-vision' 
  | 'robotics' 
  | 'ai-safety' 
  | 'ethics';

export interface Dataset {
  name: string;
  url: string;
  description?: string;
  license?: string;
}

export interface Citation {
  title: string;
  authors: string[];
  journal?: string;
  year: number;
  url?: string;
  doi?: string;
}

// Rich Content Types
export interface RichContent {
  format: 'markdown' | 'html' | 'structured';
  content: string | StructuredContent;
}

export interface StructuredContent {
  blocks: ContentBlock[];
}

export interface ContentBlock {
  id: string;
  type: 'paragraph' | 'heading' | 'image' | 'code' | 'quote' | 'list' | 'embed';
  data: any;
}

// Community Content Types
export interface CommunityPost extends BaseContent {
  type: 'community';
  author: Author;
  content: RichContent;
  category: CommunityCategory;
  tags: string[];
  upvotes: number;
  downvotes: number;
  replies?: CommunityReply[];
  isPinned?: boolean;
  isLocked?: boolean;
}

export type CommunityCategory = 
  | 'discussion' 
  | 'question' 
  | 'showcase' 
  | 'feedback' 
  | 'announcement';

export interface CommunityReply {
  id: string;
  author: Author;
  content: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  parentReplyId?: string;
}

// Event Content Types
export interface Event extends BaseContent {
  type: 'event';
  startDate: string;
  endDate?: string;
  timezone: string;
  location?: EventLocation;
  isOnline: boolean;
  registrationUrl?: string;
  maxAttendees?: number;
  currentAttendees: number;
  speakers?: Author[];
  agenda?: EventAgendaItem[];
  tags: string[];
  category: EventCategory;
}

export type EventCategory = 
  | 'webinar' 
  | 'workshop' 
  | 'conference' 
  | 'meetup' 
  | 'hackathon';

export interface EventLocation {
  name: string;
  address?: string;
  city: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface EventAgendaItem {
  time: string;
  title: string;
  description?: string;
  speaker?: Author;
  duration: number; // minutes
}

// Newsletter Content Types
export interface Newsletter extends BaseContent {
  type: 'newsletter';
  content: RichContent;
  sendDate: string;
  subject: string;
  previewText?: string;
  template: NewsletterTemplate;
  recipientCount: number;
  openRate?: number;
  clickRate?: number;
  featuredContent?: FeaturedContentItem[];
}

export type NewsletterTemplate = 'weekly' | 'monthly' | 'special' | 'announcement';

export interface FeaturedContentItem {
  contentId: string;
  contentType: 'article' | 'podcast' | 'research' | 'event';
  customTitle?: string;
  customDescription?: string;
}

// Collections and Filtering
export interface ContentCollection<T extends BaseContent> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ContentFilters {
  type?: string[];
  category?: string[];
  tags?: string[];
  author?: string[];
  status?: ('draft' | 'published' | 'archived')[];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: 'createdAt' | 'publishedAt' | 'updatedAt' | 'title' | 'startDate';
  sortOrder?: 'asc' | 'desc';
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Union type for all content
export type Content = 
  | PodcastEpisode 
  | Article 
  | ResearchPaper 
  | CommunityPost 
  | Event 
  | Newsletter;