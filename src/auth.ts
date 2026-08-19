import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/constants";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as Role,
          hotelId: user.hotelId,
          taxiCompanyId: user.taxiCompanyId,
          driverId: user.driverId,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role as Role;
        token.hotelId = user.hotelId as string | null;
        token.taxiCompanyId = user.taxiCompanyId as string | null;
        token.driverId = user.driverId as string | null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as Role;
        session.user.hotelId = token.hotelId as string | null;
        session.user.taxiCompanyId = token.taxiCompanyId as string | null;
        session.user.driverId = token.driverId as string | null;
      }
      return session;
    },
  },
});
