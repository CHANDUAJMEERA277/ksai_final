import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  user: {
    additionalFields: {
      phone: { type: "string", required: false },
      college: { type: "string", required: false },
      department: { type: "string", required: false },
      currentYear: { type: "string", required: false },
      role: { type: "string", required: false, defaultValue: "Student" },
      country: { type: "string", required: false, defaultValue: "United States" },
      provider: { type: "string", required: false, defaultValue: "CREDENTIALS" },
      googleId: { type: "string", required: false },
      passwordHash: { type: "string", required: false },
    },
  },
  session: {
    expiresIn: 7 * 24 * 60 * 60, // 7 days
    cookieCache: {
      enabled: true,
      maxAge: 7 * 24 * 60 * 60,
    },
  },
});
