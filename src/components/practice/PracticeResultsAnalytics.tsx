"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, Sparkles, BookOpen, CheckCircle2, AlertTriangle, TrendingUp, Zap, HelpCircle, RefreshCw, Award, XCircle } from "lucide-react";
import { MetricCard, RecommendationCard, ReviewAccordionCard, SectionHeader } from "@/components/practice/PracticeUi";

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
}

interface ConfidenceAnalysis {
  correct_confident: number;
  correct_not_confident: number;
  wrong_confident: number;
  wrong_not_confident: number;
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
  aiRecommendations: Array<{ label: string; reason: string }>;
  difficultyBreakdown: Record<string, { correct: number; total: number }>;
  topicPerformance: Record<string, { correct: number; total: number }>;
  reviewRecords: ReviewRecord[];
  createdAt: string;
  meta: Record<string, unknown>;
  grade?: string;
  correctCount?: number;
  wrongCount?: number;
  skippedCount?: number;
  averageTimePerQuestion?: number;
  topicsCovered?: string[];
  xpEarned?: number;
  confidenceAnalysis?: ConfidenceAnalysis;
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "incorrect" | "skipped">("all");

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
  const totalMarks = sessionData.totalMarks ?? 0;
  const attemptedCount = sessionData.attemptedCount ?? (allReviewRecords.filter((r) => r.isAttempted).length);
  const totalQuestions = sessionData.totalQuestions ?? allReviewRecords.length;

  const confidence = sessionData.confidenceAnalysis || {
    correct_confident: 0,
    correct_not_confident: 0,
    wrong_confident: 0,
    wrong_not_confident: 0,
  };

  const handleRetryWeak = () => {
    router.push(`/practice?courseId=${encodeURIComponent(sessionData.courseId)}&retryMode=wrong`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => router.push("/practice")}
          className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm hover:shadow-md transition"
        >
          <ArrowLeft size={16} /> Back to Practice Hub
        </button>

        <SectionHeader
          title="Performance Review & Real-Time Analytics"
          description="Detailed evaluation report of your AI practice session based strictly on attempted questions, weak topics, and certificate readiness."
          badge="Evaluated"
        />

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Final Evaluated Score</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-900">Score: {scorePercent}%</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Earned Marks: <span className="font-bold text-slate-900">{earnedMarks}</span> / <span className="font-bold text-slate-900">{totalMarks}</span> Marks
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Attempted: {attemptedCount} of {totalQuestions} Questions ({sessionData.skippedCount ?? 0} Skipped)
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-center">
                    <p className="text-xs font-semibold text-amber-800 uppercase">XP Earned</p>
                    <p className="text-2xl font-bold text-amber-600 flex items-center justify-center gap-1"><Zap size={18} /> +{sessionData.xpEarned ?? 0}</p>
                  </div>

                  <div className={`rounded-2xl border px-4 py-3 text-center ${sessionData.certificationEligible ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                    <p className="text-xs font-semibold uppercase flex items-center justify-center gap-1">
                      <Award size={14} /> Certificate
                    </p>
                    <p className="text-sm font-bold mt-1">
                      {sessionData.certificationEligible ? "Qualified" : "Ineligible"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <MetricCard label="Attempted Score" value={`${scorePercent}%`} detail={`Grade ${sessionData.grade || "—"} • ${earnedMarks}/${totalMarks} marks`} accent="primary" />
                <MetricCard label="Accuracy" value={`${sessionData.accuracy}%`} detail={`Across ${attemptedCount} attempted questions`} />
                <MetricCard label="Time Taken" value={formatTime(sessionData.timeTakenSeconds)} detail={`Average ${sessionData.averageTimePerQuestion ?? 0}s / question`} />
                <MetricCard label="Attempt Snapshot" value={`${sessionData.correctCount ?? 0} Correct`} detail={`${sessionData.wrongCount ?? 0} Incorrect • ${sessionData.skippedCount ?? 0} Skipped`} accent="success" />
              </div>
            </div>

            {/* Metacognition Confidence Matrix */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-3 text-slate-900">
                <HelpCircle size={20} className="text-blue-600" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Metacognition</p>
                  <h3 className="text-lg font-semibold text-slate-900">Confidence vs. Accuracy Matrix</h3>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                  <p className="text-xs font-semibold text-emerald-800 uppercase">Mastery (Correct & Confident)</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-700">{confidence.correct_confident}</p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950">
                  <p className="text-xs font-semibold text-blue-800 uppercase">Lucky Guess (Correct & Unconfident)</p>
                  <p className="mt-2 text-2xl font-bold text-blue-700">{confidence.correct_not_confident}</p>
                </div>

                <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-orange-950">
                  <p className="text-xs font-semibold text-orange-800 uppercase">Overconfidence (Wrong & Confident)</p>
                  <p className="mt-2 text-2xl font-bold text-orange-700">{confidence.wrong_confident}</p>
                </div>

                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-950">
                  <p className="text-xs font-semibold text-red-800 uppercase">Weak Concept (Wrong & Unconfident)</p>
                  <p className="mt-2 text-2xl font-bold text-red-700">{confidence.wrong_not_confident}</p>
                </div>
              </div>
            </div>

            {/* Question Breakdown List */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-slate-900">
                  <Sparkles size={20} className="text-blue-600" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Explanations & Review</p>
                    <h3 className="text-lg font-semibold text-slate-900">Detailed Question Evaluation</h3>
                  </div>
                </div>

                <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold self-start sm:self-auto">
                  <button onClick={() => setFilterMode("all")} className={`px-3 py-1.5 rounded-lg transition ${filterMode === "all" ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>All ({allReviewRecords.length})</button>
                  <button onClick={() => setFilterMode("incorrect")} className={`px-3 py-1.5 rounded-lg transition ${filterMode === "incorrect" ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>Incorrect ({incorrectRecords.length})</button>
                  <button onClick={() => setFilterMode("skipped")} className={`px-3 py-1.5 rounded-lg transition ${filterMode === "skipped" ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>Skipped ({skippedRecords.length})</button>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {displayedRecords.length === 0 ? (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">No questions match the selected filter.</div>
                ) : (
                  displayedRecords.map((record) => (
                    <ReviewAccordionCard
                      key={record.id}
                      record={record}
                      expanded={expandedId === record.id}
                      onToggle={() => setExpandedId(expandedId === record.id ? null : record.id)}
                      onPracticeSimilar={handleRetryWeak}
                    />
                  ))
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            {/* Strict Certificate System Status */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-3 text-slate-900">
                <Award size={20} className="text-blue-600" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Certificate Status</p>
                  <h3 className="text-lg font-semibold text-slate-900">Qualification Rules</h3>
                </div>
              </div>

              <div className="mt-4 space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                  <span>Score ≥ 75% ({scorePercent}%)</span>
                  {scorePercent >= 75 ? <CheckCircle2 size={16} className="text-emerald-600" /> : <XCircle size={16} className="text-red-500" />}
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                  <span>Proctor Mode ON</span>
                  {Boolean(sessionData.meta?.challengeMode) ? <CheckCircle2 size={16} className="text-emerald-600" /> : <XCircle size={16} className="text-red-500" />}
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                  <span>All Questions Attempted ({attemptedCount}/{totalQuestions})</span>
                  {attemptedCount === totalQuestions ? <CheckCircle2 size={16} className="text-emerald-600" /> : <XCircle size={16} className="text-red-500" />}
                </div>
              </div>

              <div className={`mt-4 p-3 rounded-2xl text-xs font-semibold ${sessionData.certificationEligible ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-amber-50 text-amber-900 border border-amber-200'}`}>
                {sessionData.certificationEligible ? (
                  <p>Congratulations! You qualify for course certification.</p>
                ) : (
                  <p>Certificate requires Score ≥ 75%, Proctor Mode ON, and All Questions Attempted.</p>
                )}
              </div>
            </div>

            {/* Weak Topics strictly from Attempted INCORRECT questions */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-3 text-slate-900">
                <BookOpen size={18} className="text-blue-600" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Weak Topics</p>
                  <h3 className="text-lg font-semibold text-slate-900">Incorrect Answer Analysis</h3>
                </div>
              </div>
              <p className="mt-1 text-xs text-slate-500">Derived strictly from topics of attempted incorrect answers (excludes skipped).</p>

              <div className="mt-4 space-y-3">
                {sessionData.weakTopics.length === 0 ? (
                  <p className="text-xs text-slate-500">No weak topics identified! You answered all attempted questions correctly.</p>
                ) : (
                  sessionData.weakTopics.map((topic) => (
                    <div key={topic} className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-900 flex items-center justify-between">
                      <span>{topic}</span>
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">Review</span>
                    </div>
                  ))
                )}

                <button
                  type="button"
                  onClick={handleRetryWeak}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-3 text-xs font-semibold text-white shadow-sm hover:bg-amber-600 transition"
                >
                  <RefreshCw size={14} /> Retry Weak Topics (Smart Mode)
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-3 text-slate-900">
                <TrendingUp size={18} className="text-blue-600" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">AI Guidance</p>
                  <h3 className="text-lg font-semibold text-slate-900">Recommended Steps</h3>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {sessionData.aiRecommendations.map((rec) => (
                  <RecommendationCard
                    key={rec.label}
                    icon={<CheckCircle2 size={16} />}
                    title={rec.label}
                    description={rec.reason}
                    ctaLabel="Practice Again"
                    onAction={() => router.push("/practice")}
                  />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
