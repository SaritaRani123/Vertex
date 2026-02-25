import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/utils/prisma";
import type { UserRole } from "@/types";

declare module "next-auth" {
  interface User {
    role?: UserRole;
  }
  interface Session {
    user: User & { role?: UserRole };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
  }
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const adminSecret = process.env.ADMIN_SECRET;
        if (adminSecret && credentials.password === adminSecret) {
          return {
            id: credentials.email,
            email: credentials.email,
            name: credentials.email,
            role: "Admin" as UserRole,
          };
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user?.password) return null;
        const ok = await compare(credentials.password, user.password);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.name ?? user.email ?? undefined,
          role: (user.role as UserRole) ?? "User",
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }: { token: { role?: UserRole }; user?: { role?: UserRole } }) {
      if (user) token.role = user.role;
      return token;
    },
    session({ session, token }: { session: { user?: { role?: UserRole } }; token: { role?: UserRole } }) {
      if (session.user) session.user.role = token.role;
      return session;
    },
  },
  session: { strategy: "jwt" as const },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
