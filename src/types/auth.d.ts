import type { User as PrismaUser, Session as PrismaSession } from "@/generated/client";

declare global {
  namespace BetterAuth {
    interface User {
      id: string;
      name: string;
      email: string;
      emailVerified: boolean;
      image?: string | null;
      passwordHash?: string | null;
      phone?: string | null;
      college?: string | null;
      department?: string | null;
      currentYear?: string | null;
      role: string;
      country?: string | null;
      provider: string;
      googleId?: string | null;
      activeSessionId?: string | null;
      createdAt: Date;
      updatedAt: Date;
    }

    interface Session {
      id: string;
      userId: string;
      token: string;
      expiresAt: Date;
      ipAddress?: string | null;
      userAgent?: string | null;
      createdAt: Date;
      updatedAt: Date;
    }
  }
}

export {};
