"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ShieldCheck, Sparkles, BookOpen, CheckCircle2, AlertTriangle,
  TrendingUp, Zap, HelpCircle, RefreshCw, Award, XCircle, CheckCircle, Clock,
  BarChart3, CheckSquare, ChevronRight
} from "lucide-react";
import { LeftSidebar } from "@/components/dashboard/LeftSidebar";

interface ReviewRecord {
  id: string;
  question: string;
  type: string;
  isAttempted?: boolean;
  isCorrect?: boolean;
  userAnswer: string | number | null;
  selectedAnswer?: string | number | null;
  correctAnswer: string | number | null;
  correct: boolean;
  explanation?: string | null;
  relatedChapterId?: string | null;
  topic?: string | null;
  difficulty?: string | null;
  marks?: number;
  starterCode?: string | null;
  testCases?: any[] | null;
  confidence?: boolean;
  options?: any[];
}

interface QuizSessionData {
  id: string;
  courseId: string;
  score?: number;
  scorePercent?: number;
  earnedMarks?: number;
  awardedMarks?: number;
  totalMarks?: number;
  attemptedCount?: number;
  totalQuestions?: number;
  accuracy: number;
  timeTakenSeconds: number;
  certificationProgress: number;
  certificationEligible: boolean;
  weakTopics: string[];
  reviewRecords: ReviewRecord[];
  createdAt: string;
  meta: Record<string, unknown>;
  grade?: string;
  correctCount?: number;
  wrongCount?: number;
  skippedCount?: number;
  xpEarned?: number;
}

interface PracticeResultsAnalyticsProps {
  sessionData: QuizSessionData;
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export function PracticeResultsAnalytics({ sessionData }: PracticeResultsAnalyticsProps) {
  const router = useRouter();
  const [filterMode, setFilterMode] = useState<"all" | "incorrect" | "skipped">("all");
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  const allReviewRecords = sessionData.reviewRecords || [];
  const incorrectRecords = allReviewRecords.filter((r) => r.isAttempted && !r.correct);
  const skippedRecords = allReviewRecords.filter((r) => !r.isAttempted);

  const displayedRecords =
    filterMode === "incorrect"
      ? incorrectRecords
      : filterMode === "skipped"
      ? skippedRecords
      : allReviewRecords;

  const scorePercent = typeof sessionData.scorePercent === "number" ? sessionData.scorePercent : (typeof sessionData.score === "number" ? sessionData.score : 0);
  const earnedMarks = sessionData.earnedMarks ?? sessionData.awardedMarks ?? 0;
  const totalMarks = sessionData.totalMarks ?? (allReviewRecords.length * 3);
  const attemptedCount = sessionData.attemptedCount ?? (allReviewRecords.filter((r) => r.isAttempted).length);
  const totalQuestions = sessionData.totalQuestions ?? allReviewRecords.length;
  const correctCount = sessionData.correctCount ?? allReviewRecords.filter((r) => r.correct).length;
  const wrongCount = sessionData.wrongCount ?? allReviewRecords.filter((r) => r.isAttempted && !r.correct).length;
  const skippedCount = sessionData.skippedCount ?? allReviewRecords.filter((r) => !r.isAttempted).length;
  const xpEarned = sessionData.xpEarned ?? Math.round(earnedMarks * 10);
  const grade = sessionData.grade || (scorePercent >= 90 ? "A+" : scorePercent >= 75 ? "A" : scorePercent >= 60 ? "B" : "F");

  return (
    <div className="h-screen bg-[#F8FAFC] text-slate-800 flex overflow-hidden font-sans antialiased">
      {/* Integrated Unified Sidebar */}
      <LeftSidebar
        activeTab="AI Quiz Generator"
        fullHeight={true}
      />

      {/* Main Content Workspace - 100vh NON-SCROLLABLE FIT */}
      <main className="flex-1 h-full overflow-hidden p-4 sm:p-5 flex flex-col gap-3.5 w-full max-w-[1600px] mx-auto">
        {/* Top Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/quiz-generator")}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer flex items-center gap-1.5 text-xs font-black"
            >
              <ArrowLeft size={16} /> Back to Quiz Generator
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <div>
              <h1 className="text-sm sm:text-base font-black text-slate-900 leading-tight">MCQ Evaluation Report 📊</h1>
              <p className="text-[11px] text-slate-500 font-medium">Session ID: {sessionData.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-100 text-[#4F46E5] text-xs font-black">
              Earned: {earnedMarks}/{totalMarks} Marks
            </span>
            <span className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-black">
              Accuracy: {sessionData.accuracy}%
            </span>
            <span className="px-3 py-1 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 text-xs font-black">
              XP: +{xpEarned}
            </span>
          </div>
        </div>

        {/* 2-COLUMN VIEWPORT WORKSPACE (NO OUTER SCROLL) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3.5 min-h-0 overflow-hidden">
          {/* LEFT COLUMN: Performance Summary & Metrics Card (4 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3.5 min-h-0 overflow-y-auto custom-scrollbar pr-0.5">
            {/* HERO SCORE CARD */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center space-y-4">
              <div className="relative flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
                <div className="text-center">
                  <div className="text-2xl font-black">{scorePercent}%</div>
                  <div className="text-[10px] font-extrabold opacity-80 uppercase tracking-widest">Score</div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${scorePercent >= 75 ? 'bg-emerald-100 text-emerald-800' : scorePercent >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                    Grade {grade}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-black">
                    {scorePercent >= 75 ? "Passed Certificate Bar" : "Needs Review"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-2">
                  {earnedMarks} marks earned out of {totalMarks} total marks ({attemptedCount}/{totalQuestions} questions attempted).
                </p>
              </div>

              {/* STATS TILES GRID */}
              <div className="w-full grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xs font-black text-slate-500 uppercase">Correct</div>
                  <div className="text-lg font-black text-emerald-600 mt-0.5">{correctCount}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xs font-black text-slate-500 uppercase">Wrong</div>
                  <div className="text-lg font-black text-red-600 mt-0.5">{wrongCount}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xs font-black text-slate-500 uppercase">Skipped</div>
                  <div className="text-lg font-black text-amber-600 mt-0.5">{skippedCount}</div>
                </div>
              </div>
            </div>

            {/* TIME TAKEN & PROCTOR COMPLIANCE CARD */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Session Analytics</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <Clock size={18} className="text-[#4F46E5]" />
                  <div>
                    <div className="text-[10px] font-bold text-slate-500">Time Taken</div>
                    <div className="text-xs font-black text-slate-900">{formatTime(sessionData.timeTakenSeconds)}</div>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <ShieldCheck size={18} className="text-emerald-600" />
                  <div>
                    <div className="text-[10px] font-bold text-slate-500">Proctor Exam</div>
                    <div className="text-xs font-black text-emerald-700">Verified Active</div>
                  </div>
                </div>
              </div>
            </div>

            {/* WEAK TOPICS & SMART RETRY CARD */}
            {sessionData.weakTopics && sessionData.weakTopics.length > 0 && (
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertTriangle size={16} className="text-amber-600" />
                  <h3 className="text-xs font-black uppercase tracking-wider">Weak Concepts Identified</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {sessionData.weakTopics.map((topic, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
                      {topic}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => router.push(`/practice?courseId=${encodeURIComponent(sessionData.courseId)}&retryMode=wrong`)}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw size={14} /> Retry Weak Concept MCQs
                </button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Question Evaluation Review List (7 cols) - INNER SCROLL */}
          <div className="lg:col-span-7 flex flex-col bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs min-h-0 overflow-hidden">
            {/* Header & Filter Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 shrink-0">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <BookOpen size={16} className="text-[#4F46E5]" /> Question Evaluation Breakdown
              </h3>

              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-black">
                <button
                  onClick={() => setFilterMode("all")}
                  className={`px-3 py-1 rounded-lg transition ${filterMode === "all" ? "bg-[#4F46E5] text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}
                >
                  All ({allReviewRecords.length})
                </button>
                <button
                  onClick={() => setFilterMode("incorrect")}
                  className={`px-3 py-1 rounded-lg transition ${filterMode === "incorrect" ? "bg-red-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Incorrect ({incorrectRecords.length})
                </button>
                <button
                  onClick={() => setFilterMode("skipped")}
                  className={`px-3 py-1 rounded-lg transition ${filterMode === "skipped" ? "bg-amber-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Skipped ({skippedRecords.length})
                </button>
              </div>
            </div>

            {/* SCROLLABLE QUESTION REVIEW LIST */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3 py-3 min-h-0">
              {displayedRecords.length === 0 ? (
                <div className="p-8 text-center text-xs font-semibold text-slate-400">No questions match the selected filter.</div>
              ) : (
                displayedRecords.map((record, idx) => {
                  const isExpanded = selectedRecordId === record.id;
                  const userAns = record.isAttempted ? String(record.selectedAnswer ?? record.userAnswer) : "Skipped";
                  const correctAns = record.correctAnswer !== null && record.correctAnswer !== undefined ? String(record.correctAnswer) : "N/A";

                  return (
                    <div
                      key={record.id || idx}
                      className={`p-4 rounded-xl border transition duration-150 ${
                        record.correct
                          ? "bg-emerald-50/40 border-emerald-200"
                          : !record.isAttempted
                          ? "bg-amber-50/40 border-amber-200"
                          : "bg-red-50/40 border-red-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                            {record.correct ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold flex items-center gap-1">
                                <CheckCircle size={12} /> Correct (+{record.marks ?? 3} Marks)
                              </span>
                            ) : !record.isAttempted ? (
                              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-extrabold flex items-center gap-1">
                                <HelpCircle size={12} /> Skipped (0 Marks)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-extrabold flex items-center gap-1">
                                <XCircle size={12} /> Incorrect (0 Marks)
                              </span>
                            )}
                            <span className="text-slate-500">&bull; {record.topic || "General Concept"}</span>
                          </div>

                          <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug pt-1">
                            Q{idx + 1}. {record.question}
                          </h4>
                        </div>

                        <button
                          onClick={() => setSelectedRecordId(isExpanded ? null : record.id)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-black text-slate-700 hover:bg-slate-50 shrink-0 cursor-pointer"
                        >
                          {isExpanded ? "Hide" : "Review Details"}
                        </button>
                      </div>

                      {/* Expanded Answer Breakdown & Explanation */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                              <span className="font-extrabold text-slate-500 block text-[10px] uppercase">Your Answer:</span>
                              <span className={`font-black ${record.correct ? 'text-emerald-700' : !record.isAttempted ? 'text-amber-700 italic' : 'text-red-700'}`}>
                                {userAns}
                              </span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                              <span className="font-extrabold text-slate-500 block text-[10px] uppercase">Correct Answer:</span>
                              <span className="font-black text-emerald-700">
                                {correctAns}
                              </span>
                            </div>
                          </div>

                          {record.explanation && (
                            <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-indigo-900 leading-relaxed font-medium">
                              <span className="font-black block mb-0.5 text-indigo-950">AI Concept Explanation:</span>
                              {record.explanation}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
