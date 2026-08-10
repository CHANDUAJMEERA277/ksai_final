import { db } from "@/lib/db";

export type LeaderboardScope = "global" | "course" | "college";
export type LeaderboardWindow = "weekly" | "monthly" | "alltime";

export interface LeaderboardUserEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string | null;
  xp: number;
  streak: number;
  challengesSolved: number;
  completionPct: number;
  college?: string | null;
}

export interface LeaderboardResponse {
  success: boolean;
  scope: LeaderboardScope;
  window: LeaderboardWindow;
  courseId?: string | null;
  college?: string | null;
  isSnapshot: boolean;
  period: {
    start: Date | null;
    end: Date | null;
  };
  top10: LeaderboardUserEntry[];
  currentUser: LeaderboardUserEntry | null;
  totalParticipants: number;
}

/**
 * Calculates standard UTC week range (Monday 00:00:00.000Z to Sunday 23:59:59.999Z).
 */
export function getUtcWeekRange(date: Date = new Date()): { weekStart: Date; weekEnd: Date } {
  const d = new Date(date);
  const day = d.getUTCDay();
  // UTC Day: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const weekStart = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + diffToMonday, 0, 0, 0, 0)
  );
  const weekEnd = new Date(
    Date.UTC(weekStart.getUTCFullYear(), weekStart.getUTCMonth(), weekStart.getUTCDate() + 6, 23, 59, 59, 999)
  );

  return { weekStart, weekEnd };
}

/**
 * Calculates standard UTC month range (1st of month 00:00:00.000Z to last day of month 23:59:59.999Z).
 */
export function getUtcMonthRange(date: Date = new Date()): { monthStart: Date; monthEnd: Date } {
  const d = new Date(date);
  const monthStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0));
  const monthEnd = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 23, 59, 59, 999));
  return { monthStart, monthEnd };
}

/**
 * Freezes and persists top rankings for a completed week into WeeklyLeaderboardSnapshot.
 * 
 * DESIGN DECISION — LAZY ON-READ CHECK + CRON ENDPOINT:
 * We implement a lazy on-read check combined with an explicit lock endpoint.
 * When a request for a past week arrives (or when current week passes its weekEnd date),
 * if no locked WeeklyLeaderboardSnapshot exists for that week, the server computes the final
 * top rankings and writes them with `locked = true`. Future requests for that week read directly
 * from the frozen snapshot, ensuring immutable results without requiring background cron infrastructure.
 */
export async function lockWeekSnapshot(weekStart: Date, weekEnd: Date) {
  // Check if snapshot already exists and is locked
  const existingSnapshot = await db.weeklyLeaderboardSnapshot.findFirst({
    where: {
      weekStart: { equals: weekStart },
      locked: true,
    },
  });

  if (existingSnapshot) {
    return true; // Already locked
  }

  // Compute final rankings for ALL participants who earned XP in the week window
  const allRankings = await computeLeaderboardData({
    scope: "global",
    window: "weekly",
    dateStart: weekStart,
    dateEnd: weekEnd,
  });

  // Write all rankings into WeeklyLeaderboardSnapshot
  if (allRankings.entries.length > 0) {
    await db.weeklyLeaderboardSnapshot.createMany({
      data: allRankings.entries.map((entry) => ({
        weekStart,
        weekEnd,
        userId: entry.userId,
        rank: entry.rank,
        xp: entry.xp,
        locked: true,
        createdAt: new Date(),
      })),
    });
  }

  return true;
}

interface ComputeParams {
  scope: LeaderboardScope;
  window: LeaderboardWindow;
  courseId?: string | null;
  college?: string | null;
  dateStart?: Date | null;
  dateEnd?: Date | null;
  limit?: number;
}

/**
 * Computes live or windowed leaderboard rankings by summing XpTransaction records.
 */
export async function computeLeaderboardData({
  scope,
  window,
  courseId,
  college,
  dateStart,
  dateEnd,
  limit = 10,
}: ComputeParams) {
  // 1. Build date filter for XpTransaction
  const dateFilter: any = {};
  if (dateStart) dateFilter.gte = dateStart;
  if (dateEnd) dateFilter.lte = dateEnd;

  // 2. Build scope filter
  const txWhere: any = {};
  if (Object.keys(dateFilter).length > 0) {
    txWhere.createdAt = dateFilter;
  }
  if (scope === "course" && courseId) {
    txWhere.courseId = courseId;
  }
  if (scope === "college" && college) {
    txWhere.user = { college: college };
  }

  // 3. Aggregate total XP per user
  const xpGrouped = await db.xpTransaction.groupBy({
    by: ["userId"],
    where: txWhere,
    _sum: {
      amount: true,
    },
    orderBy: {
      _sum: {
        amount: "desc",
      },
    },
  });

  // 4. Aggregate challenge completion count per user
  const challengeWhere = {
    ...txWhere,
    source: "challenge_solved",
  };
  const challengeGrouped = await db.xpTransaction.groupBy({
    by: ["userId"],
    where: challengeWhere,
    _count: {
      id: true,
    },
  });

  const challengeMap = new Map<string, number>();
  for (const c of challengeGrouped) {
    challengeMap.set(c.userId, c._count.id);
  }

  // 5. Total chapters count for calculating completionPct
  let totalChapters = 0;
  if (scope === "course" && courseId) {
    totalChapters = await db.chapter.count({ where: { courseId } });
  } else {
    totalChapters = await db.chapter.count();
  }

  // 6. Fetch user details for all ranked users
  const userIds = xpGrouped.map((x) => x.userId);
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      name: true,
      image: true,
      currentStreak: true,
      college: true,
    },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  // Fetch completed chapter counts per user
  const completedProgresses = await db.chapterProgress.groupBy({
    by: ["userId"],
    where: {
      userId: { in: userIds },
      isCompleted: true,
      ...(scope === "course" && courseId ? { chapter: { courseId } } : {}),
    },
    _count: {
      id: true,
    },
  });

  const completedMap = new Map<string, number>();
  for (const p of completedProgresses) {
    completedMap.set(p.userId, p._count.id);
  }

  // 7. Assemble full ranked entries list
  const entries: LeaderboardUserEntry[] = xpGrouped.map((xpItem, index) => {
    const userId = xpItem.userId;
    const userObj = userMap.get(userId);
    const xp = xpItem._sum.amount ?? 0;
    const challengesSolved = challengeMap.get(userId) ?? 0;
    const completedCount = completedMap.get(userId) ?? 0;
    const completionPct =
      totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;

    return {
      rank: index + 1,
      userId,
      name: userObj?.name ?? "Anonymous Student",
      avatar: userObj?.image ?? null,
      xp,
      streak: userObj?.currentStreak ?? 0,
      challengesSolved,
      completionPct,
      college: userObj?.college ?? null,
    };
  });

  return {
    entries,
    totalParticipants: entries.length,
  };
}

/**
 * Main function to retrieve leaderboard data according to scope, window, and user session.
 */
export async function getLeaderboardData({
  scope,
  window,
  courseId,
  college,
  requestingUserId,
  targetWeekDate,
}: {
  scope: LeaderboardScope;
  window: LeaderboardWindow;
  courseId?: string | null;
  college?: string | null;
  requestingUserId?: string | null;
  targetWeekDate?: Date | null;
}): Promise<LeaderboardResponse> {
  const now = new Date();
  let dateStart: Date | null = null;
  let dateEnd: Date | null = null;
  let isSnapshot = false;

  // Determine date ranges based on window
  if (window === "weekly") {
    const weekRange = getUtcWeekRange(targetWeekDate || now);
    dateStart = weekRange.weekStart;
    dateEnd = weekRange.weekEnd;

    // Check if requested week is past its end date
    if (now > dateEnd) {
      // Lazy check: Ensure frozen snapshot exists for this closed week
      await lockWeekSnapshot(dateStart, dateEnd);
      isSnapshot = true;
    }
  } else if (window === "monthly") {
    const monthRange = getUtcMonthRange(now);
    dateStart = monthRange.monthStart;
    dateEnd = monthRange.monthEnd;
  }

  // If reading from locked WeeklyLeaderboardSnapshot (for closed global weekly leaderboard)
  if (isSnapshot && scope === "global") {
    const snapshots = await db.weeklyLeaderboardSnapshot.findMany({
      where: {
        weekStart: { equals: dateStart! },
        locked: true,
      },
      orderBy: { rank: "asc" },
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            currentStreak: true,
            college: true,
          },
        },
      },
    });

    if (snapshots.length > 0) {
      const top10: LeaderboardUserEntry[] = snapshots.map((s) => ({
        rank: s.rank,
        userId: s.userId,
        name: s.user.name,
        avatar: s.user.image,
        xp: s.xp,
        streak: s.user.currentStreak,
        challengesSolved: 0, // Snapshot stores frozen rank & XP
        completionPct: 0,
        college: s.user.college,
      }));

      // Check current user in snapshot or live
      let currentUserEntry: LeaderboardUserEntry | null = null;
      if (requestingUserId) {
        const foundInTop10 = top10.find((item) => item.userId === requestingUserId);
        if (foundInTop10) {
          currentUserEntry = foundInTop10;
        } else {
          const userSnap = await db.weeklyLeaderboardSnapshot.findFirst({
            where: {
              weekStart: { equals: dateStart! },
              userId: requestingUserId,
              locked: true,
            },
            include: { user: true },
          });

          if (userSnap) {
            currentUserEntry = {
              rank: userSnap.rank,
              userId: userSnap.userId,
              name: userSnap.user.name,
              avatar: userSnap.user.image,
              xp: userSnap.xp,
              streak: userSnap.user.currentStreak,
              challengesSolved: 0,
              completionPct: 0,
              college: userSnap.user.college,
            };
          }
        }
      }

      const totalParticipants = await db.weeklyLeaderboardSnapshot.count({
        where: {
          weekStart: { equals: dateStart! },
          locked: true,
        },
      });

      return {
        success: true,
        scope,
        window,
        courseId,
        college,
        isSnapshot: true,
        period: { start: dateStart, end: dateEnd },
        top10,
        currentUser: currentUserEntry,
        totalParticipants,
      };
    }
  }

  // Live computation for current week, monthly, all-time, or specific course/college scopes
  const { entries, totalParticipants } = await computeLeaderboardData({
    scope,
    window,
    courseId,
    college,
    dateStart,
    dateEnd,
    limit: 10,
  });

  const top10 = entries.slice(0, 10);

  // Compute requesting user's entry if outside top 10
  let currentUserEntry: LeaderboardUserEntry | null = null;
  if (requestingUserId) {
    const inTop10 = top10.find((e) => e.userId === requestingUserId);
    if (inTop10) {
      currentUserEntry = inTop10;
    } else {
      const inEntries = entries.find((e) => e.userId === requestingUserId);
      if (inEntries) {
        currentUserEntry = inEntries;
      } else {
        // User has 0 XP in this window/scope
        const reqUser = await db.user.findUnique({
          where: { id: requestingUserId },
          select: {
            id: true,
            name: true,
            image: true,
            currentStreak: true,
            college: true,
          },
        });
        if (reqUser) {
          currentUserEntry = {
            rank: totalParticipants + 1,
            userId: reqUser.id,
            name: reqUser.name,
            avatar: reqUser.image,
            xp: 0,
            streak: reqUser.currentStreak,
            challengesSolved: 0,
            completionPct: 0,
            college: reqUser.college,
          };
        }
      }
    }
  }

  return {
    success: true,
    scope,
    window,
    courseId,
    college,
    isSnapshot: false,
    period: { start: dateStart, end: dateEnd },
    top10,
    currentUser: currentUserEntry,
    totalParticipants,
  };
}
