export interface TimelineMember {
  id: string;
  name: string;
  roleNow: string;
  roleFuture: string;
}

export interface TimelineTask {
  lane: string;
  start: string;
  end: string;
  label: string;
  desc: string;
  output: string;
}

export interface TimelineMilestone {
  date: string;
  label: string;
  color: 'yellow' | 'red';
}

export interface TimelineWeek {
  label: string;
  start: string;
  end: string;
  theme: string;
}

export interface TimelineDecision {
  date: string;
  title: string;
  items: string[];
}

export interface TimelineData {
  version: number;
  updatedAt: string;
  title: string;
  subtitle: string;
  dday: string;
  milestones: TimelineMilestone[];
  members: TimelineMember[];
  tasks: TimelineTask[];
  decisions: Record<string, TimelineDecision>;
  weeks: TimelineWeek[];
}
