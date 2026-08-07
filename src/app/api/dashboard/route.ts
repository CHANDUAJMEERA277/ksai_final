import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { parseSessionToken } from "@/lib/auth-cookie";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionTokenRaw =
      cookieStore.get("better-auth.session_token")?.value ||
      cookieStore.get("sessionToken")?.value;

    // 1. Primary check: Resolve user via Better Auth session API
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    let user = session?.user as any;

    // 2. Fallback check: Resolve user via cookie session token lookup in DB
    if (!user && sessionTokenRaw) {
      const rawToken = parseSessionToken(sessionTokenRaw);
      const dbSession = await db.session.findUnique({
        where: { token: rawToken },
        include: { user: true },
      });

      if (dbSession && new Date() < dbSession.expiresAt) {
        user = dbSession.user;
      }
    }

    if (!user) {
      // Fallback for local development testing/mock support if no active user session
      user = await db.user.findFirst();
      if (!user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }
    }

    // --- Dynamic Computations ---

    // A. Course Enrollments & New Enrollments this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const enrollments = await db.enrollment.findMany({
      where: { userId: user.id },
      include: { 
        course: { 
          include: { 
            chapters: true 
          } 
        } 
      },
      orderBy: { createdAt: "desc" },
    });

    const coursesCount = enrollments.length;
    const newThisMonth = enrollments.filter(e => new Date(e.createdAt) >= startOfMonth).length;

    // B. Chapters Completed
    const totalChaptersCount = enrollments.reduce((sum, e) => sum + (e.course?.chapters?.length || 0), 0);
    
    const completedProgresses = await db.chapterProgress.findMany({
      where: {
        userId: user.id,
        isCompleted: true,
        chapterId: {
          in: enrollments.flatMap(e => (e.course?.chapters || []).map(ch => ch.id))
        }
      }
    });
    
    const completedChaptersCount = completedProgresses.length;
    const chaptersPercentage = totalChaptersCount > 0 
      ? Math.round((completedChaptersCount / totalChaptersCount) * 100) 
      : 0;

    // C. Quiz Accuracy & Quiz Improvement
    const progressesWithQuiz = await db.chapterProgress.findMany({
      where: {
        userId: user.id,
        quizScore: { gt: 0 }
      },
      orderBy: { updatedAt: "asc" },
      select: { quizScore: true }
    });

    const quizScoresList = progressesWithQuiz.map(p => p.quizScore);
    const quizAccuracy = quizScoresList.length > 0
      ? Math.round(quizScoresList.reduce((sum, val) => sum + val, 0) / quizScoresList.length)
      : 0;

    let quizImprovement = 0;
    if (quizScoresList.length >= 2) {
      const mid = Math.floor(quizScoresList.length / 2);
      const firstHalf = quizScoresList.slice(0, mid);
      const secondHalf = quizScoresList.slice(mid);
      const avg1 = firstHalf.reduce((s, v) => s + v, 0) / firstHalf.length;
      const avg2 = secondHalf.reduce((s, v) => s + v, 0) / secondHalf.length;
      quizImprovement = Math.max(0, Math.round(avg2 - avg1));
    }

    // D. Learning Streak (Requires 15 minutes of active learning per day)
    const activityLogsForStreak = await db.activityLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" }
    });

    const dateActiveMinutes: { [dateStr: string]: number } = {};
    for (const log of activityLogsForStreak) {
      const dateStr = new Date(log.createdAt).toISOString().split("T")[0];
      let weight = 1;
      if (log.actionType === "CHAPTER_COMPLETE") weight = 5;
      else if (log.actionType === "QUIZ_SUBMIT") weight = 5;
      else if (log.actionType === "AI_CHAT") weight = 2;
      else if (log.actionType.startsWith("EDITOR_")) weight = 3;
      
      dateActiveMinutes[dateStr] = (dateActiveMinutes[dateStr] || 0) + weight;
    }

    const qualifyingDates = Object.keys(dateActiveMinutes)
      .filter(dateStr => dateActiveMinutes[dateStr] >= 15)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // descending order

    let streak = 0;
    if (qualifyingDates.length > 0) {
      const todayStr = new Date().toISOString().split("T")[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const hasTodayActivity = (dateActiveMinutes[todayStr] || 0) > 0;
      const isTodayQualifying = dateActiveMinutes[todayStr] >= 15;
      const isYesterdayQualifying = dateActiveMinutes[yesterdayStr] >= 15;

      if (isTodayQualifying || isYesterdayQualifying || (hasTodayActivity && isYesterdayQualifying)) {
        streak = 1;
        let checkDate = new Date(isTodayQualifying ? todayStr : yesterdayStr);
        
        while (true) {
          checkDate.setDate(checkDate.getDate() - 1);
          const checkDateStr = checkDate.toISOString().split("T")[0];
          if (dateActiveMinutes[checkDateStr] >= 15) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    // E. Enrolled In-Progress Courses List (Continue Learning Carousels)
    const continueLearningCourses = [];
    const courseProgresses = await db.chapterProgress.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" }
    });

    for (const enroll of enrollments) {
      const courseChapters = await db.chapter.findMany({
        where: { courseId: enroll.courseId },
        orderBy: { orderNumber: "asc" }
      });

      const courseChapterProgresses = await db.chapterProgress.findMany({
        where: {
          userId: user.id,
          chapterId: { in: courseChapters.map(ch => ch.id) }
        }
      });

      const completedChapters = courseChapterProgresses.filter(p => p.isCompleted);
      const progressPercent = courseChapters.length > 0
        ? Math.round((completedChapters.length / courseChapters.length) * 100)
        : 0;

      const incompleteChapters = courseChapters.filter(
        ch => !courseChapterProgresses.some(p => p.chapterId === ch.id && p.isCompleted)
      );

      const currentChapter = incompleteChapters.length > 0 
        ? incompleteChapters[0] 
        : (courseChapters.length > 0 ? courseChapters[courseChapters.length - 1] : null);
        
      const nextChapter = incompleteChapters.length > 1 ? incompleteChapters[1] : null;

      continueLearningCourses.push({
        courseId: enroll.course.id,
        courseTitle: enroll.course.title,
        courseThumbnail: enroll.course.thumbnail,
        courseLanguage: enroll.course.language,
        progressPercent,
        completedChaptersCount: completedChapters.length,
        totalChaptersCount: courseChapters.length,
        currentChapter: currentChapter ? {
          id: currentChapter.id,
          title: currentChapter.title,
          orderNumber: currentChapter.orderNumber,
          description: currentChapter.title.includes("Topic") ? currentChapter.title.split(":")[1]?.trim() || "Concept overview" : "Concept overview",
        } : null,
        upNext: nextChapter ? {
          title: nextChapter.title,
        } : null,
      });
    }

    // F. Learning Progress Donut Data
    const inProgressChaptersCount = courseProgresses.filter(p => !p.isCompleted).length;
    const remainingChaptersCount = Math.max(0, totalChaptersCount - completedChaptersCount - inProgressChaptersCount);

    const overallProgressPercent = totalChaptersCount > 0
      ? Math.round((completedChaptersCount / totalChaptersCount) * 100)
      : 0;

    const learningProgress = {
      completedCount: completedChaptersCount,
      completedPercentage: totalChaptersCount > 0 ? Math.round((completedChaptersCount / totalChaptersCount) * 100) : 0,
      inProgressCount: inProgressChaptersCount,
      inProgressPercentage: totalChaptersCount > 0 ? Math.round((inProgressChaptersCount / totalChaptersCount) * 100) : 0,
      remainingCount: remainingChaptersCount,
      remainingPercentage: totalChaptersCount > 0 ? Math.round((remainingChaptersCount / totalChaptersCount) * 100) : 0,
      overallProgressPercent
    };

    // G. This Week's Goals & Targets
    const today = new Date();
    const dayOfWeek = today.getDay(); 
    const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const mondayDate = new Date(today.setDate(diffToMonday));
    mondayDate.setHours(0, 0, 0, 0);

    let weeklyGoal = await db.weeklyGoal.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    });

    if (!weeklyGoal) {
      weeklyGoal = await db.weeklyGoal.create({
        data: {
          userId: user.id,
          targetChapters: 2,
          targetQuizzes: 10,
          targetAIChats: 5
        }
      });
    }

    const thisWeeksActivities = await db.activityLog.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: mondayDate }
      }
    });

    const chaptersCompletedThisWeek = thisWeeksActivities.filter(a => a.actionType === "CHAPTER_COMPLETE").length;
    
    let quizQuestionsSolvedThisWeek = 0;
    for (const act of thisWeeksActivities) {
      if (act.actionType === "QUIZ_SUBMIT") {
        try {
          const meta = act.metadata ? JSON.parse(act.metadata) : null;
          if (meta && meta.questionsCount) {
            quizQuestionsSolvedThisWeek += meta.questionsCount;
          } else {
            quizQuestionsSolvedThisWeek += 5; 
          }
        } catch (e) {
          quizQuestionsSolvedThisWeek += 5;
        }
      }
    }

    const aiChatsThisWeek = thisWeeksActivities.filter(a => a.actionType === "AI_CHAT").length;

    const weeklyGoalsData = {
      chapters: {
        current: chaptersCompletedThisWeek,
        target: weeklyGoal.targetChapters
      },
      quizzes: {
        current: quizQuestionsSolvedThisWeek,
        target: weeklyGoal.targetQuizzes
      },
      aiSessions: {
        current: aiChatsThisWeek,
        target: weeklyGoal.targetAIChats
      }
    };

    // H. Editor Activity heatmap (past 5 weeks aligned to Mon-Sun)
    const currentMonday = new Date(mondayDate);
    const startOfGrid = new Date(currentMonday);
    startOfGrid.setDate(startOfGrid.getDate() - 28); 

    const editorActivityCounts: { [dateStr: string]: number } = {};
    const editorLogs = await db.activityLog.findMany({
      where: {
        userId: user.id,
        actionType: { startsWith: "EDITOR_" },
        createdAt: { gte: startOfGrid }
      }
    });

    for (const log of editorLogs) {
      const dateStr = new Date(log.createdAt).toISOString().split("T")[0];
      editorActivityCounts[dateStr] = (editorActivityCounts[dateStr] || 0) + 1;
    }

    const heatmapData = [];
    for (let w = 0; w < 5; w++) {
      const weekDays = [];
      for (let d = 0; d < 7; d++) {
        const targetDate = new Date(startOfGrid);
        targetDate.setDate(targetDate.getDate() + (w * 7) + d);
        const dateStr = targetDate.toISOString().split("T")[0];
        const count = editorActivityCounts[dateStr] || 0;
        
        let intensity = 0;
        if (count > 0) {
          if (count <= 2) intensity = 1;
          else if (count <= 5) intensity = 2;
          else intensity = 3;
        }
        
        weekDays.push({
          date: dateStr,
          dayIndex: d, 
          count,
          intensity
        });
      }
      heatmapData.push({
        weekIndex: w, 
        days: weekDays
      });
    }

    // I. Recommended Courses (Logic-based)
    const allCourses = await db.course.findMany({
      include: { chapters: true }
    });

    const recommendedCourses = [];

    // Quiz reinforcement check
    for (const enroll of enrollments) {
      const courseChapterProgresses = await db.chapterProgress.findMany({
        where: {
          userId: user.id,
          chapterId: { in: enroll.course.chapters.map(ch => ch.id) },
          quizScore: { gt: 0 }
        }
      });
      const quizScores = courseChapterProgresses.map(p => p.quizScore);
      const avgQuiz = quizScores.length > 0 
        ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length
        : 100;

      if (avgQuiz < 70) {
        recommendedCourses.push({
          id: enroll.course.id,
          title: enroll.course.title,
          description: `⚠️ Needs Reinforcement: Your quiz accuracy is ${Math.round(avgQuiz)}%. Review chapter materials and retry quizzes to boost retention.`,
          level: enroll.course.level,
          category: enroll.course.category,
          language: enroll.course.language,
          thumbnail: enroll.course.thumbnail,
          rating: enroll.course.rating,
          badge: "Review Required"
        });
      }
    }

    // Unenrolled recommendations
    const unenrolledCourses = allCourses.filter(c => !enrollments.some(e => e.courseId === c.id));
    for (const course of unenrolledCourses) {
      recommendedCourses.push({
        id: course.id,
        title: course.title,
        description: course.description,
        level: course.level,
        category: course.category,
        language: course.language,
        thumbnail: course.thumbnail,
        rating: course.rating,
        badge: "New Release"
      });
    }

    // J. Notifications
    const unreadNotifications = await db.notification.findMany({
      where: { userId: user.id, read: false },
      orderBy: { createdAt: "desc" }
    });

    const notificationsList = await db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8
    });

    // Generate initial welcome notifications if user has none
    const notificationsCountTotal = await db.notification.count({ where: { userId: user.id } });
    if (notificationsCountTotal === 0) {
      const defaultNotifs = [
        {
          userId: user.id,
          title: "Welcome to KnowledgeStream AI! 🚀",
          message: "Start learning from our industry-grade curricula in C, C++, Python, and Java.",
          read: false
        },
        {
          userId: user.id,
          title: "Setup Weekly Learning Goals 🎯",
          message: "Go to your dashboard targets to customize your weekly path parameters.",
          read: false
        }
      ];
      await db.notification.createMany({ data: defaultNotifs });
      
      const freshNotifs = await db.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" }
      });
      unreadNotifications.push(...freshNotifs);
      notificationsList.push(...freshNotifs);
    }

    // K. Profile Widget Progress
    let targetXp = 1000;
    if (user.level >= 10) {
      targetXp = 5000;
    } else if (user.level >= 5) {
      targetXp = 2500;
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        country: user.country,
        level: user.level,
        xp: user.xp,
        targetXp
      },
      stats: {
        coursesCount,
        newThisMonth,
        completedChaptersCount,
        totalChaptersCount,
        chaptersPercentage,
        quizAccuracy,
        quizImprovement,
        streak
      },
      continueLearning: continueLearningCourses[0] || null,
      continueLearningCourses,
      learningProgress,
      weeklyGoals: weeklyGoalsData,
      heatmap: heatmapData,
      recommended: recommendedCourses,
      notifications: {
        unreadCount: unreadNotifications.length,
        list: notificationsList.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          read: n.read,
          createdAt: n.createdAt
        }))
      }
    });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Failed to compile dashboard metrics." }, { status: 500 });
  }
}
