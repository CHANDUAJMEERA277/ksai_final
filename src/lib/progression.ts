import { db } from "@/lib/db";
import { calculateUserLevelAndXp } from "@/lib/xp-service";
import { XpSourceType } from "@/lib/xp-config";

/**
 * Logs a user activity in the database, awards XP, handles leveling up,
 * and creates corresponding notifications.
 * 
 * @param userId - The ID of the authenticated user
 * @param actionType - E.g. "CHAPTER_COMPLETE" | "QUIZ_SUBMIT" | "AI_CHAT" | "COURSE_ENROLL"
 * @param metadata - Optional payload with dynamic parameters (e.g. { passed: true, score: 85 })
 */
export async function logUserActivity(userId: string, actionType: string, metadata?: any) {
  try {
    // 1. Log the activity
    await db.activityLog.create({
      data: {
        userId,
        actionType,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    // 2. Award XP based on activity type
    let xpToAdd = 0;
    let notificationTitle = "";
    let notificationMessage = "";

    if (actionType === "CHAPTER_COMPLETE") {
      xpToAdd = 100;
      notificationTitle = "Chapter Completed! 📚";
      const chapterTitle = metadata?.chapterTitle || "a chapter";
      notificationMessage = `You completed "${chapterTitle}" and earned 100 XP!`;
    } else if (actionType === "QUIZ_SUBMIT") {
      if (metadata?.passed) {
        xpToAdd = 150;
        notificationTitle = "Quiz Passed! 🎯";
        notificationMessage = `Scored ${metadata.score}% on the quiz and earned 150 XP!`;
      } else {
        xpToAdd = 30; // participation XP
        notificationTitle = "Quiz Attempted 📝";
        notificationMessage = `Attempted the quiz (Scored ${metadata?.score || 0}%). Earned 30 participation XP. Keep trying!`;
      }
    } else if (actionType === "AI_CHAT") {
      xpToAdd = 10;
      // We don't always need to generate notifications for every chat message to avoid spamming the user.
    } else if (actionType === "COURSE_ENROLL") {
      xpToAdd = 200;
      notificationTitle = "Enrolled in Course 🎓";
      const courseTitle = metadata?.courseTitle || "a new course";
      notificationMessage = `Successfully enrolled in "${courseTitle}". Earned 200 XP!`;
    }

    // 3. Create notification if applicable
    if (notificationTitle && notificationMessage) {
      await db.notification.create({
        data: {
          userId,
          title: notificationTitle,
          message: notificationMessage,
          read: false,
        },
      });
    }

    // 4. Update User XP and Level
    if (xpToAdd > 0) {
      const user = await db.user.findUnique({
        where: { id: userId },
      });

      if (user) {
        let source: XpSourceType = "chapter_complete";
        if (actionType === "AI_CHAT") source = "ai_chat";
        else if (actionType === "QUIZ_SUBMIT") source = "quiz_pass";
        else if (actionType === "COURSE_ENROLL") source = "chapter_complete";

        await db.xpTransaction.create({
          data: {
            userId,
            amount: xpToAdd,
            source,
            createdAt: new Date(),
          },
        });

        const levelAndXp = await calculateUserLevelAndXp(userId);

        if (levelAndXp.level > user.level) {
          for (let lvl = user.level + 1; lvl <= levelAndXp.level; lvl++) {
            await db.notification.create({
              data: {
                userId,
                title: "Level Up! 🎉",
                message: `Congratulations! You've leveled up to Level ${lvl}!`,
                read: false,
              },
            });
          }
        }

        await db.user.update({
          where: { id: userId },
          data: {
            xp: levelAndXp.xp,
            level: levelAndXp.level,
          },
        });
      }
    }
  } catch (error) {
    console.error("Failed to log activity or award XP:", error);
  }
}
