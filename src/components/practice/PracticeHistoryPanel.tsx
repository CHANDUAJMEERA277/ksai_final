"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, BookOpen, ShieldCheck, Zap, ArrowRight, Trash2, RotateCcw, ExternalLink } from "lucide-react";
import { PracticeHistoryItem } from "@/components/practice/PracticeUi";

interface PracticeHistoryPanelProps {
  history: PracticeHistoryItem[];
  onDelete?: (id: string) => void;
}

export function PracticeHistoryPanel({
  history,
  onDelete,
}: PracticeHistoryPanelProps) {
  const router = useRouter();

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-blue-600">
            <CalendarDays size={20} />
            <h2 className="text-xl font-bold text-slate-900">Practice History & Assessments</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Complete records of your AI adaptive practice sessions, performance scores, and weak topic analytics.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 self-start sm:self-auto">
          {history.length} Session{history.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500 space-y-3">
            <BookOpen size={32} className="mx-auto text-slate-400" />
            <p className="text-base font-semibold text-slate-700">No practice sessions yet</p>
            <p className="text-sm text-slate-500">Generate a new practice quiz to start tracking your topic mastery.</p>
          </div>
        ) : (
          history.map((item) => {
            const scoreDisplay = item.score != null ? `${item.score}%` : "0%";
            const accuracyDisplay = item.accuracy != null ? `${item.accuracy}%` : "0%";
            const metaObj = item.meta as any;
            const earnedMarks = metaObj?.earnedMarks ?? metaObj?.awardedMarks ?? 0;
            const totalMarks = metaObj?.totalMarks ?? 0;
            const isProctored = Boolean(metaObj?.challengeMode);

            const date = new Date(item.createdAt);
            const formattedDate = isNaN(date.getTime())
              ? "Invalid date"
              : date.toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                });

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition hover:shadow-md hover:bg-white flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-base font-semibold text-slate-900">
                      {item.courseTitle || "AI Practice Session"}
                    </h3>
                    <span className="rounded-full bg-blue-50 text-blue-700 px-3 py-0.5 text-xs font-semibold uppercase tracking-wide">
                      {item.difficulty || "Mixed"}
                    </span>
                    {isProctored && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-xs font-semibold">
                        <ShieldCheck size={12} /> Proctored
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500">
                    Attempted on {formattedDate}
                  </p>

                  <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-700 pt-1">
                    <div>
                      Score: <span className="font-bold text-slate-900">{scoreDisplay}</span>
                    </div>
                    <div>
                      Marks: <span className="font-bold text-slate-900">{earnedMarks}/{totalMarks}</span>
                    </div>
                    <div>
                      Accuracy: <span className="font-bold text-slate-900">{accuracyDisplay}</span>
                    </div>
                    <div>
                      Questions: <span className="font-bold text-slate-900">{item.questionCount ?? 0}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => router.push(`/practice/results/${item.id}`)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm hover:bg-blue-700 transition"
                  >
                    <ExternalLink size={14} /> View Report
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push(`/practice?courseId=${encodeURIComponent(item.courseId || "")}&retryMode=wrong`)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold hover:bg-amber-100 transition"
                  >
                    <RotateCcw size={14} /> Retry Weak
                  </button>

                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Delete practice record"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}