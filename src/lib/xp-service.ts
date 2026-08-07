import { db } from "@/lib/db";
import { XP_CONFIG, XpSourceType } from "@/lib/xp-config";

export interface AwardXpOptions {
  userId: string;
  amount: number;
  source: XpSourceType;
  courseId?: string | null;
}

/**
 * Calculates calendar day difference between lastActiveDate and currentDate (in UTC).
 * 0  = same calendar day
 * 1  = exactly 1 day prior (yesterday)
 * >1 = 2 or more days prior
 * -1 = no lastActiveDate (first activity ever)
 */
export function getCalendarDayDifference(
  lastDate: Date | null | undefined,
  currentDate: Date = new Date()
): number {
  if (!lastDate) return -1;

  const lastUtc = Date.UTC(
    lastDate.getUTCFullYear(),
    lastDate.getUTCMonth(),
    lastDate.getUTCDate()
  );
  const currentUtc = Date.UTC(
    currentDate.getUTCFullYear(),
    currentDate.getUTCMonth(),
    currentDate.getUTCDate()
  );

  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((currentUtc - lastUtc) / msPerDay);
}

/**
 * Awards XP to a user, logs an append-only XpTransaction record,
 * and updates the user's daily streak state server-side.
 */
export async function awardXpAndStreak({
  userId,
  amount,
  source,
  courseId,
}: AwardXpOptions) {
  const now = new Date();

  // 1. Retrieve current streak and activity state for user
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      currentStreak: true,
      longestStreak: true,
      lastActiveDate: true,
    },
  });

  if (!user) {
    throw new Error(`User with ID ${userId} not found`);
  }

  // 2. Calculate new streak state based on lastActiveDate
  const dayDiff = getCalendarDayDifference(user.lastActiveDate, now);

  let newCurrentStreak = user.currentStreak;
  let streakAdvanced = false;

  if (dayDiff === 1) {
    // Active yesterday -> increment current streak by 1
    newCurrentStreak = user.currentStreak + 1;
    streakAdvanced = true;
  } else if (dayDiff === 0) {
    // Already active today -> keep current streak as is
    newCurrentStreak = user.currentStreak > 0 ? user.currentStreak : 1;
  } else {
    // More than 1 day ago or first active date -> reset current streak to 1
    newCurrentStreak = 1;
    streakAdvanced = true;
  }

  // Update longestStreak if currentStreak exceeds it
  const newLongestStreak = Math.max(user.longestStreak, newCurrentStreak);

  // 3. Create primary XP transaction record
  const xpTx = await db.xpTransaction.create({
    data: {
      userId,
      amount,
      source,
      courseId: courseId ?? null,
      createdAt: now,
    },
  });

  // 4. Check for daily streak milestone bonus only on an exact streak increment transition
  let milestoneTx = null;
  const streakIncremented = dayDiff === 1 && newCurrentStreak > user.currentStreak;
  if (streakIncremented) {
    const milestoneBonus = XP_CONFIG.STREAK_MILESTONES[newCurrentStreak];
    if (milestoneBonus) {
      milestoneTx = await db.xpTransaction.create({
        data: {
          userId,
          amount: milestoneBonus,
          source: "streak_bonus",
          courseId: courseId ?? null,
          createdAt: now,
        },
      });
    }
  }

  // 5. Update user streak fields and lastActiveDate
  const updatedUser = await db.user.update({
    where: { id: userId },
    data: {
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastActiveDate: now,
    },
  });

  return {
    xpAwarded: amount,
    xpTransaction: xpTx,
    milestoneTransaction: milestoneTx,
    user: updatedUser,
  };
}
