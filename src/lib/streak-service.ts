import { db } from "@/lib/db";

/**
 * Calculates the exact consecutive daily learning streak for a user
 * based on their activity logs in the database.
 * 
 * Rules:
 * - Active days are days (UTC YYYY-MM-DD) where user has recorded activity.
 * - Streak counts consecutive active days starting from Today (or Yesterday if no activity today yet).
 * - If user had no activity today or yesterday, streak is 0.
 * - Also updates the `currentStreak` field on `db.user`.
 */
export async function calculateUserStreak(userId: string): Promise<number> {
  try {
    const activityLogs = await db.activityLog.findMany({
      where: { userId },
      select: { createdAt: true },
    });

    if (activityLogs.length === 0) return 0;

    const activeDateSet = new Set<string>();
    for (const log of activityLogs) {
      const dStr = new Date(log.createdAt).toISOString().split("T")[0];
      activeDateSet.add(dStr);
    }

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let streak = 0;
    let checkDate: Date;

    if (activeDateSet.has(todayStr)) {
      checkDate = new Date(today);
    } else if (activeDateSet.has(yesterdayStr)) {
      checkDate = new Date(yesterday);
    } else {
      // Streak reset to 0 if missed both today and yesterday
      await db.user.update({
        where: { id: userId },
        data: { currentStreak: 0 },
      }).catch(console.error);
      return 0;
    }

    while (true) {
      const checkStr = checkDate.toISOString().split("T")[0];
      if (activeDateSet.has(checkStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Persist updated streak to User table asynchronously
    db.user.update({
      where: { id: userId },
      data: { currentStreak: streak },
    }).catch(console.error);

    return streak;
  } catch (err) {
    console.error("Error calculating user streak:", err);
    return 0;
  }
}
