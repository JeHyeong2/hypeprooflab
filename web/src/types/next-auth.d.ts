import { type MemberRole } from '@/lib/members';
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: MemberRole;
      displayName?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: MemberRole;
    displayName?: string;
  }
}
