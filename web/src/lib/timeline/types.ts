export type FuzzyDate =
  | { kind: 'date'; iso: string; partOfDay?: 'AM' | 'PM' }
  | { kind: 'month'; year: number; month: number }
  | { kind: 'quarter'; year: number; quarter: 1 | 2 | 3 | 4 }
  | { kind: 'ongoing' };

export type Lane = 'direct' | 'channel' | 'reusable';

export type EventStatus =
  | 'planned'
  | 'in-progress'
  | 'done'
  | 'deferred'
  | 'wrap-up'
  | 'cancelled';

export type AssetStatus = 'idea' | 'draft' | 'ready';

export interface TimelineEvent {
  id: string;
  lane: Lane;
  title: string;
  subtitle?: string;
  date: FuzzyDate;
  status: EventStatus;
  cancelledAt?: string;
  cancelReason?: string;
  contacts?: string[];
  notes?: string[];
  owner?: string;
  links?: { label: string; url: string }[];
  tags?: string[];
  externalIds?: { gcal?: string; supabase?: string };
  needsClassification?: boolean;
}

export interface ReusableAsset {
  id: string;
  title: string;
  subtitle?: string;
  status: AssetStatus;
  ownedBy?: string;
}

export interface PriorityBanner {
  headline: string;
  body?: string;
  severity: 'info' | 'warning' | 'pivot';
}

export interface TimelineLanesMeta {
  direct: { label: string; color: string };
  channel: { label: string; color: string };
  reusable: { label: string; color: string };
}

export interface GcalConfig {
  calendarId?: string;
  lastSyncAt?: string;
}

export interface TimelineData {
  version: 1;
  updatedAt: string;
  title?: string;
  subtitle?: string;
  priorityBanner?: PriorityBanner;
  lanes: TimelineLanesMeta;
  events: TimelineEvent[];
  reusableAssets: ReusableAsset[];
  gcal?: GcalConfig;
}

export interface Holiday {
  date: string;
  name: string;
}

export interface HolidayData {
  year: number;
  source?: string;
  holidays: Holiday[];
}

export interface TimelineDiff {
  added: TimelineEvent[];
  updated: { before: TimelineEvent; after: TimelineEvent }[];
  cancelled: TimelineEvent[];
  removed: TimelineEvent[];
}

export interface SyncResult {
  imported: number;
  pushed: number;
  conflicts: number;
  needsAuth?: boolean;
  message?: string;
}
