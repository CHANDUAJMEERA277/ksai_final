import { db } from "@/lib/db";

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
        let currentXp = user.xp + xpToAdd;
        let currentLevel = user.level;

        while (true) {
          // Progression thresholds matching Level 12 @ 5000 XP denominator
          let targetXp = 1000;
          if (currentLevel >= 10) {
            targetXp = 5000;
          } else if (currentLevel >= 5) {
            targetXp = 2500;
          }

          if (currentXp >= targetXp) {
            currentXp -= targetXp;
            currentLevel += 1;

            // Generate level up notification
            await db.notification.create({
              data: {
                userId,
                title: "Level Up! 🎉",
                message: `Congratulations! You've leveled up to Level ${currentLevel}!`,
                read: false,
              },
            });
          } else {
            break;
          }
        }

        await db.user.update({
          where: { id: userId },
          data: {
            xp: currentXp,
            level: currentLevel,
          },
        });
      }
    }
  } catch (error) {
    console.error("Failed to log activity or award XP:", error);
  }
}
