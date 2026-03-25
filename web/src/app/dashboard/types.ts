export interface DashboardMember {
  id: string;
  username: string;
  displayName: string;
  realName: string;
  email: string;
  role: 'admin' | 'creator' | 'spectator';
  title: string;
  expertise: string[];
  interests: string[];
  weeklyHours: number;
  joinDate: string;
  articles: string[];
  columnType: string;
  status: string;
}

export interface MembersData {
  version: number;
  updatedAt: string;
  members: DashboardMember[];
}
