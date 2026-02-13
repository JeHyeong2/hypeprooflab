import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import { getRoleForEmail, getMemberByEmail, type MemberRole } from './members';

export const { handlers, auth, signIn, signOut } = NextAuth({
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
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token }) {
      // M4: Always re-check role from email (not just on first sign-in)
      if (token.email) {
        token.role = getRoleForEmail(token.email);
        const member = getMemberByEmail(token.email);
        if (member) {
          token.displayName = member.displayName;
        }
      }
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
        (session.user as any).role = token.role as MemberRole;
        if (token.displayName) {
          (session.user as any).displayName = token.displayName as string;
        }
      }
      return session;
    },
  },
});
