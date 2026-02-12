import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import { getRoleForEmail, getMemberByEmail, type MemberRole } from './members';

function getAdapter() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secret) {
    return undefined;
  }
  return SupabaseAdapter({ url, secret });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: getAdapter(),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      // On first sign-in, assign role based on email
      if (user?.email) {
        const role = getRoleForEmail(user.email);
        token.role = role;
        const member = getMemberByEmail(user.email);
        if (member) {
          token.displayName = member.displayName;
        }
      }
      // Ensure role persists
      if (!token.role) {
        token.role = 'spectator';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      if (session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = token.role as MemberRole;
        if (token.displayName) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (session.user as any).displayName = token.displayName as string;
        }
      }
      return session;
    },
  },
});
