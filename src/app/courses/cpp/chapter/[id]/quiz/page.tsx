"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CourseSwitcher } from "@/components/courses/CourseSwitcher";
import {
  Award,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  RotateCcw,
} from "lucide-react";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
}

export default function CppQuizPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const chapterParam = (params?.id as string) || "1";
  const currentOrderNum = parseInt(chapterParam.replace(/[^0-9]/g, ""), 10) || 1;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/courses/cpp/chapters/${currentOrderNum}/quiz`);
        const data = await res.json();
        if (res.ok && data.success) {
          setQuestions(data.questions || []);
        } else {
          setError(data.error || "Failed to load quiz questions.");
        }
      } catch (err) {
        console.error(err);
        setError("Network error loading quiz.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [currentOrderNum]);

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([qId, selectedIdx]) => ({
        questionId: parseInt(qId, 10),
        selectedOption: selectedIdx,
      }));

      const res = await fetch(`/api/courses/cpp/chapters/${currentOrderNum}/quiz/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: formattedAnswers }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setResult(data.result || data);
      } else {
        setError(data.error || "Failed to process quiz submission.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error submitting quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-[#09090B]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/courses/cpp/chapter/${currentOrderNum}`)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all flex items-center gap-2 text-xs font-semibold"
          >
            <ArrowLeft size={16} />
            <span>Back to Lesson</span>
          </button>
        </div>

        <CourseSwitcher currentLanguage="cpp" currentChapter={currentOrderNum} />
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 space-y-8">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-mono font-bold text-indigo-400">C++ Assessment &bull; Chapter {currentOrderNum}</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">C++ Knowledge Verification</h1>
          <p className="text-xs sm:text-sm text-slate-400">Select the best answer for each question below to verify your comprehension.</p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 animate-pulse text-sm">Loading quiz questions...</div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-red-950/20 border border-red-500/30 text-red-300 text-sm text-center">{error}</div>
        ) : result ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 text-center shadow-2xl">
            <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center border ${
              result.passed ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}>
              <Award size={40} />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white">Assessment Score: {result.score}%</h2>
              <p className="text-sm font-semibold text-slate-300">
                {result.correctCount !== undefined && result.totalCount !== undefined
                  ? `${result.correctCount} of ${result.totalCount} questions correct`
                  : result.passed ? "Chapter Exam Passed!" : "Chapter Exam Failed"}
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {result.passed
                  ? "Congratulations! You have passed this chapter assessment with 70%+ score and unlocked the next chapter."
                  : "Score below 70%. Please review the lesson material and retry the exam to unlock the next chapter."}
              </p>
            </div>

            {/* Question Breakdown List */}
            {result.breakdown && Array.isArray(result.breakdown) && (
              <div className="text-left space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">Detailed Question Breakdown</h3>
                <div className="space-y-3">
                  {result.breakdown.map((item: any, bIdx: number) => (
                    <div key={bIdx} className={`p-4 rounded-xl border text-xs space-y-2 ${
                      item.correct ? "bg-emerald-950/20 border-emerald-500/30 text-slate-200" : "bg-red-950/20 border-red-500/30 text-slate-200"
                    }`}>
                      <div className="flex items-start justify-between gap-2 font-bold">
                        <span>{bIdx + 1}. {item.question}</span>
                        {item.correct ? (
                          <span className="flex items-center gap-1 text-emerald-400 shrink-0 font-mono text-[11px]"><CheckCircle2 size={14} /> Correct</span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-400 shrink-0 font-mono text-[11px]"><XCircle size={14} /> Incorrect</span>
                        )}
                      </div>

                      <div className="pl-3 space-y-1 text-slate-400">
                        <div>Your Answer: <strong className={item.correct ? "text-emerald-300" : "text-red-300"}>{item.options[item.userAnswer] || "None"}</strong></div>
                        {!item.correct && (
                          <div>Correct Answer: <strong className="text-emerald-400">{item.options[item.correctAnswer]}</strong></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-4 pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  setResult(null);
                  setAnswers({});
                }}
                className="px-6 py-3 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition-all flex items-center gap-2"
              >
                <RotateCcw size={16} /> Retry Assessment
              </button>

              {result.passed && currentOrderNum < 15 && (
                <button
                  onClick={() => router.push(`/courses/cpp/chapter/${currentOrderNum + 1}`)}
                  className="px-6 py-3 rounded-xl bg-indigo-600 text-white text-xs font-black hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                  <span>Proceed to Chapter {currentOrderNum + 1}</span> <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-xs font-mono shrink-0">
                    {idx + 1}
                  </span>
                  <span>{q.question}</span>
                </h3>

                <div className="grid grid-cols-1 gap-2.5 pl-9">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = answers[q.id] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectOption(q.id, oIdx)}
                        className={`w-full text-left p-3.5 rounded-xl text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-indigo-500/20 text-indigo-200 border border-indigo-500/40 font-bold"
                            : "bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-slate-800/60"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="space-y-4 pt-4 border-t border-slate-800/80">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold px-1">
                <span className="text-slate-400">
                  Assessment Progress: <strong className="text-indigo-400 font-mono">{Object.keys(answers).length} / {questions.length}</strong> Answered
                </span>
                {Object.keys(answers).length < questions.length ? (
                  <span className="text-amber-400 font-medium">
                    * Please answer all {questions.length} questions to enable submission ({questions.length - Object.keys(answers).length} remaining)
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 size={13} /> Ready to submit!
                  </span>
                )}
              </div>

              <button
                onClick={handleSubmitQuiz}
                disabled={submitting || Object.keys(answers).length < questions.length}
                className={`w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-xl ${
                  Object.keys(answers).length < questions.length || submitting
                    ? "bg-slate-800/80 text-slate-500 border border-slate-700/50 cursor-not-allowed opacity-60"
                    : "bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:brightness-110 text-white shadow-indigo-500/25 active:scale-[0.99] cursor-pointer"
                }`}
              >
                {submitting
                  ? "Evaluating Answers..."
                  : Object.keys(answers).length < questions.length
                  ? `Answer All Questions (${Object.keys(answers).length}/${questions.length})`
                  : "Submit Quiz Assessment Now"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
