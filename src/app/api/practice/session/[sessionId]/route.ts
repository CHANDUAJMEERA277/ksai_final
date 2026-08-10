import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  calculatePracticeScore,
  calculateAccuracy,
  extractWeakTopicsFromIncorrectOnly,
  checkCertificateEligibility,
} from "@/lib/practice-utils";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session id" }, { status: 400 });
  }

  const practice = await db.practice.findUnique({ where: { id: sessionId } });
  if (!practice) {
    return NextResponse.json({ error: "Practice session not found" }, { status: 404 });
  }
  if (practice.userEmail !== session.user.email) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let meta: any = {};
  try {
    meta = practice.meta ? JSON.parse(practice.meta) : {};
  } catch (error) {
    meta = { raw: practice.meta };
  }

  const quiz = Array.isArray(meta.quiz) ? meta.quiz : [];
  const perQuestion = Array.isArray(meta.perQuestionReview)
    ? meta.perQuestionReview
    : Array.isArray(meta.perQuestion)
    ? meta.perQuestion
    : [];

  const difficultyBreakdown: Record<string, { correct: number; total: number }> = {};
  const topicPerformance: Record<string, { correct: number; total: number }> = {};
  const reviewRecords: Array<{
    id: string;
    question: string;
    type: string;
    isAttempted: boolean;
    isCorrect: boolean;
    userAnswer: any;
    selectedAnswer: any;
    correctAnswer: any;
    correct: boolean;
    explanation?: string | null;
    topic?: string | null;
    difficulty?: string | null;
    marks?: number;
    options?: any[];
    starterCode?: string | null;
    testCases?: any[] | null;
    confidence?: boolean;
  }> = [];

  const answerMap: Record<string, any> = {};
  perQuestion.forEach((item: any) => {
    if (item && item.id) {
      answerMap[item.id] = item;
    }
  });

  let earnedMarks = typeof meta.earnedMarks === "number" ? meta.earnedMarks : typeof meta.awardedMarks === "number" ? meta.awardedMarks : 0;
  let totalMarks = typeof meta.totalMarks === "number" ? meta.totalMarks : 0;
  let attemptedCount = 0;
  let correctCount = 0;

  for (const question of quiz) {
    const record = answerMap[question.id] || {};
    const isAttempted = Boolean(record.isAttempted ?? (record.given !== null && record.given !== undefined && String(record.given).trim() !== ""));
    const correct = Boolean(record.isCorrect ?? record.correct);
    const userAnswer = record.selectedAnswer ?? record.given ?? null;
    const correctAnswer = question.correctAnswer ?? question.answer ?? null;
    const difficulty = question.difficulty || "medium";
    const topic = question.topic || "General";
    const qType = question.type || "mcq";

    if (isAttempted) attemptedCount++;
    if (correct) correctCount++;

    difficultyBreakdown[difficulty] = difficultyBreakdown[difficulty] || { correct: 0, total: 0 };
    topicPerformance[topic] = topicPerformance[topic] || { correct: 0, total: 0 };

    difficultyBreakdown[difficulty].total += 1;
    topicPerformance[topic].total += 1;
    if (correct) {
      difficultyBreakdown[difficulty].correct += 1;
      topicPerformance[topic].correct += 1;
    }

    reviewRecords.push({
      id: question.id,
      question: question.question || "Untitled question",
      type: qType,
      isAttempted,
      isCorrect: correct,
      correct,
      userAnswer,
      selectedAnswer: userAnswer,
      correctAnswer,
      explanation: question.explanation ?? record.explanation ?? null,
      topic,
      difficulty,
      marks: question.marks ?? record.marks ?? 1,
      options: Array.isArray(question.options) ? question.options : [],
      starterCode: question.starterCode ?? record.starterCode ?? null,
      testCases: question.testCases ?? record.testCases ?? null,
      confidence: record.confidence ?? false,
    });
  }

  const score = calculatePracticeScore({
    earnedMarks,
    totalMarks,
    attemptedCount,
  });

  const accuracy = calculateAccuracy({
    correctCount,
    attemptedCount,
  });

  const weakTopics = extractWeakTopicsFromIncorrectOnly(reviewRecords);
  const isProctored = Boolean(meta.challengeMode ?? false);
  const certificationEligible = checkCertificateEligibility({
    scorePercent: score,
    attemptedCount,
    totalQuestions: quiz.length,
    isProctored,
  });

  const timeTakenSeconds = meta.timeTakenSeconds ?? meta.timeTaken ?? 0;
  const grade = meta.grade || (score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F");
  const wrongCount = Math.max(0, attemptedCount - correctCount);
  const skippedCount = Math.max(0, quiz.length - attemptedCount);
  const averageTimePerQuestion = meta.avgTimePerQuestion ?? (quiz.length ? Math.round(timeTakenSeconds / Math.max(1, quiz.length)) : 0);
  const topicsCovered = Array.isArray(meta.topicsCovered) && meta.topicsCovered.length > 0 ? meta.topicsCovered : Object.keys(topicPerformance);
  const xpEarned = meta.xpEarned ?? 0;

  const confidenceAnalysis = meta.confidenceAnalysis ?? {
    correct_confident: 0,
    correct_not_confident: 0,
    wrong_confident: 0,
    wrong_not_confident: 0,
  };

  const aiRecommendations = [];
  if (weakTopics.length > 0) {
    aiRecommendations.push({
      label: "Focus on weak concepts",
      reason: `You struggled with ${weakTopics.slice(0, 3).join(", ")}. Use Retry Weak Topics mode to reinforce mastery.`,
    });
  }
  if (!certificationEligible) {
    aiRecommendations.push({
      label: "Push for certification eligibility",
      reason: `Certification requires Score ≥ 75%, Proctor Mode enabled, and all questions attempted.`,
    });
  } else {
    aiRecommendations.push({
      label: "Certification Qualified!",
      reason: "Congratulations! Your practice session meets all certification requirements (Score ≥ 75%, Proctored, All Questions Attempted).",
    });
  }

  return NextResponse.json({
    id: practice.id,
    courseId: practice.courseId,
    score,
    scorePercent: score,
    earnedMarks,
    awardedMarks: earnedMarks,
    totalMarks,
    attemptedCount,
    correctCount,
    wrongCount,
    skippedCount,
    accuracy,
    timeTakenSeconds,
    certificationProgress: score,
    certificationEligible,
    weakTopics,
    aiRecommendations,
    difficultyBreakdown: meta.difficultyBreakdown || difficultyBreakdown,
    topicPerformance,
    reviewRecords,
    createdAt: practice.createdAt,
    meta,
    grade,
    averageTimePerQuestion,
    topicsCovered,
    totalQuestions: quiz.length,
    xpEarned,
    confidenceAnalysis,
  });
}
