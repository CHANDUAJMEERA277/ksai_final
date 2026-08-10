"use client";

import { ReactNode } from "react";
import { BookOpen, ArrowRight, ShieldCheck, Sparkles, CheckCircle2, AlertTriangle, TrendingUp, Code, CheckCircle, XCircle, HelpCircle, MinusCircle } from "lucide-react";

export interface PracticeHistoryItem {
  id: string;
  courseId?: string;
  createdAt: string;
  score: number | null;
  accuracy?: number | null;
  weakTopics?: string[];
  duration?: number;
  questionCount?: number;
  difficulty?: string;
  courseTitle?: string;
  meta?: Record<string, unknown>;
}

export interface ReviewRecord {
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
  options?: any[];
  starterCode?: string | null;
  testCases?: any[] | null;
  confidence?: boolean;
}

export function SectionHeader({
  title,
  description,
  badge,
}: {
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">Practice</p>
        {badge ? <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-700">{badge}</span> : null}
      </div>
      <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
      <p className="max-w-2xl text-sm text-slate-500">{description}</p>
    </div>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  accent,
}: {
  label: string;
  value: string;
  detail?: string;
  accent?: "primary" | "success" | "warning" | "danger";
}) {
  const accentClasses = {
    primary: "bg-blue-50 text-blue-700",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-red-50 text-red-700",
  };
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-200">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">{label}</p>
      <p className="mt-4 text-3xl font-semibold text-slate-900">{value}</p>
      {detail ? <p className="mt-2 text-sm text-slate-500">{detail}</p> : null}
      {accent ? <div className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${accentClasses[accent]}`}>{label}</div> : null}
    </div>
  );
}

export function StatusBadge({ status }: { status: "Excellent" | "Good" | "Average" | "Poor" }) {
  const map = {
    Excellent: "bg-emerald-50 text-emerald-700",
    Good: "bg-blue-50 text-blue-700",
    Average: "bg-amber-50 text-amber-700",
    Poor: "bg-red-50 text-red-700",
  };
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${map[status]}`}>{status}</span>;
}

export function RecommendationCard({
  icon,
  title,
  description,
  ctaLabel,
  onAction,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  ctaLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-200">
      <div className="flex items-center gap-3 text-slate-900">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">{icon}</div>
        <div className="space-y-1">
          <p className="text-base font-semibold">{title}</p>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      {ctaLabel ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
        >
          {ctaLabel}
          <ArrowRight size={16} />
        </button>
      ) : null}
    </div>
  );
}

export function HistoryCard({
  item,
  onView,
  onRetry,
  onExport,
  onDelete,
}: {
  item: PracticeHistoryItem;
  onView: () => void;
  onRetry: () => void;
  onExport: () => void;
  onDelete: () => void;
}) {
  const score = item.score != null ? `${item.score}%` : "0%";
  const accuracy = item.accuracy != null ? `${item.accuracy}%` : "0%";
  const duration = item.duration ? `${Math.floor(item.duration / 60)}m ${item.duration % 60}s` : "—";
  const status = item.score != null ? (item.score >= 90 ? "Excellent" : item.score >= 80 ? "Good" : item.score >= 65 ? "Average" : "Poor") : "Average";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md text-slate-900">
      <div className="flex items-start gap-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-50 text-slate-700">
          <BookOpen size={20} />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-base font-semibold text-slate-900">{item.courseTitle || "Practice Session"}</h3>
            <StatusBadge status={status as any} />
          </div>
          <p className="mt-2 text-sm text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-600">
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="font-semibold text-slate-900">Questions</p>
              <p>{item.questionCount ?? 0}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="font-semibold text-slate-900">Score</p>
              <p>{score}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="font-semibold text-slate-900">Accuracy</p>
              <p>{accuracy}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="font-semibold text-slate-900">Duration</p>
              <p>{duration}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button onClick={onView} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-100">View Report</button>
        <button onClick={onRetry} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-100">Retry</button>
        <button onClick={onExport} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-100">Export</button>
        <button onClick={onDelete} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-100">Delete</button>
      </div>
    </div>
  );
}

export function ReviewAccordionCard({
  record,
  expanded,
  onToggle,
  onPracticeSimilar,
}: {
  record: ReviewRecord;
  expanded: boolean;
  onToggle: () => void;
  onPracticeSimilar: () => void;
}) {
  const isCoding = record.type === "coding" || record.type === "code";
  const isAttempted = Boolean(record.isAttempted ?? (record.userAnswer !== null && record.userAnswer !== undefined && String(record.userAnswer).trim() !== ""));
  const userAns = isAttempted ? String(record.selectedAnswer ?? record.userAnswer) : "Skipped";
  const correctAns = record.correctAnswer !== null && record.correctAnswer !== undefined ? String(record.correctAnswer) : "N/A";

  const statusBadge = record.correct ? (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full"><CheckCircle size={12} /> Correct (+{record.marks ?? 1} Marks)</span>
  ) : !isAttempted ? (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full"><MinusCircle size={12} /> Skipped (0 Marks)</span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full"><XCircle size={12} /> Incorrect (0 Marks)</span>
  );

  return (
    <div className={`rounded-3xl border ${record.correct ? 'border-emerald-200 bg-white' : !isAttempted ? 'border-amber-200 bg-white' : 'border-red-200 bg-white'} p-5 shadow-sm transition hover:shadow-md`}>
      <button type="button" onClick={onToggle} className="flex w-full items-start justify-between gap-4 text-left">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {statusBadge}
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{record.type?.toUpperCase()}</span>
            <span className="text-xs font-medium text-slate-500">• {record.topic ?? "General"} • {record.difficulty ?? "medium"}</span>
          </div>
          <p className="font-semibold text-slate-900">{record.question}</p>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{expanded ? "Hide" : "Review"}</div>
      </button>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 text-sm text-slate-700">
          <div>
            <span className="font-semibold text-slate-900">Your Answer: </span>
            {isCoding ? (
              <pre className="mt-1 p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto">{userAns}</pre>
            ) : (
              <span className={`font-medium ${!isAttempted ? 'text-amber-700 italic' : record.correct ? 'text-emerald-700' : 'text-red-700'}`}>{userAns}</span>
            )}
          </div>

          <div>
            <span className="font-semibold text-slate-900">Correct Answer / Expected Output: </span>
            {isCoding ? (
              <pre className="mt-1 p-3 rounded-xl bg-slate-100 text-slate-800 font-mono text-xs overflow-x-auto">{correctAns}</pre>
            ) : (
              <span className="text-emerald-700 font-medium">{correctAns}</span>
            )}
          </div>

          {record.explanation && (
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-blue-900">
              <span className="font-semibold block mb-0.5">Explanation:</span>
              <p className="text-xs leading-relaxed">{record.explanation}</p>
            </div>
          )}

          {isCoding && record.testCases && record.testCases.length > 0 && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-semibold text-xs text-slate-900 block mb-1">Test Cases:</span>
              <ul className="text-xs font-mono space-y-1 text-slate-600">
                {record.testCases.map((tc: any, idx: number) => (
                  <li key={idx}>• {typeof tc === 'string' ? tc : JSON.stringify(tc)}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <button onClick={onPracticeSimilar} className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100">
              <Sparkles size={14} /> Practice Similar Question
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
