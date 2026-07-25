import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";

const providers: any[] = [];

// Only add Google provider if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// Only add GitHub provider if credentials are available
if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    })
  );
}

// Always add Credentials provider
providers.push(
  Credentials({
    name: "Credentials",

    credentials: {
      email: {},
      password: {},
    },

    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const user = await db.user.findUnique({
        where: {
          email: String(credentials.email).toLowerCase(),
        },
      });

      if (!user) return null;

      if (!user.passwordHash) {
        throw new Error(
          "This account uses OAuth Sign-In."
        );
      }

      console.log("========== LOGIN DEBUG ==========");
console.log("Entered Email:", credentials.email);
console.log("DB Email:", user.email);
console.log("Entered Password:", credentials.password);
console.log("Password Hash:", user.passwordHash);

const valid = await bcrypt.compare(
  String(credentials.password),
  user.passwordHash
);

console.log("Password Match:", valid);
console.log("===============================");

if (!valid) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        country: user.country,
      };
    },
  })
);

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,

  session: {
    strategy: "jwt",
  },

 callbacks: {
  async jwt({ token, user, account }) {
    // Credentials login
    if (user) {
      token.id = (user as any).id;
      token.role = (user as any).role;
      token.country = (user as any).country;
    }

    // Google login
    if (
  (account?.provider === "google" ||
    account?.provider === "github") &&
  token.email
) {
      let dbUser = await db.user.findUnique({
        where: {
          email: token.email,
        },
      });

      // First Google login → create user
      if (!dbUser) {
        dbUser = await db.user.create({
          data: {
            name: token.name ?? "Google User",
            email: token.email,
            provider: account.provider.toUpperCase(),
          },
        });
      }

      token.id = dbUser.id;
      token.role = dbUser.role;
      token.country = dbUser.country;
    }

    return token;
  },

  async session({ session, token }) {
    if (session.user) {
      (session.user as any).id = token.id;
      (session.user as any).role = token.role;
      (session.user as any).country = token.country;
    }

    return session;
  },
},

  secret: process.env.AUTH_SECRET || "dev-secret-key-change-in-production",
});