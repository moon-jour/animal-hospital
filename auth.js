import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { ADMIN_SESSION_SECONDS, isAdminEmail } from "./lib/server/config.js";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: ADMIN_SESSION_SECONDS,
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  callbacks: {
    async signIn({ account, profile, user }) {
      const email = profile?.email || user?.email;
      const emailVerified = profile?.email_verified;

      return account?.provider === "google" && emailVerified !== false && isAdminEmail(email);
    },
    async jwt({ profile, token, user }) {
      const email = profile?.email || user?.email || token.email;

      token.email = email?.toLowerCase();
      token.isAdmin = isAdminEmail(token.email);

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email;
        session.user.isAdmin = Boolean(token.isAdmin);
      }

      return session;
    },
    async redirect({ baseUrl, url }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      const parsedUrl = new URL(url);

      if (parsedUrl.origin === baseUrl) {
        return url;
      }

      return `${baseUrl}/admin/reviews`;
    },
  },
});
