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

export default function JavaQuizPage() {
  const params = useParams();
  const router = useRouter();
  const sessionData = useSession();
  const session = (sessionData?.data as any) ?? null;

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
        const res = await fetch(`/api/courses/java/chapters/${currentOrderNum}/quiz`);
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

      const res = await fetch(`/api/courses/java/chapters/${currentOrderNum}/quiz/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: formattedAnswers }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setResult(data.result);
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
    <div className="min-h-screen bg-[#09090B] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-[#09090B]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/courses/java/chapter/${currentOrderNum}`)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all flex items-center gap-2 text-xs font-semibold"
          >
            <ArrowLeft size={16} />
            <span>Back to Lesson</span>
          </button>
        </div>

        <CourseSwitcher currentLanguage="java" currentChapter={currentOrderNum} />
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 space-y-8">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-mono font-bold text-amber-400">Java Assessment &bull; Chapter {currentOrderNum}</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Java Knowledge Verification</h1>
          <p className="text-xs sm:text-sm text-slate-400">Select the best answer for each question below to verify your comprehension.</p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 animate-pulse text-sm">Loading quiz questions...</div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-red-950/20 border border-red-500/30 text-red-300 text-sm text-center">{error}</div>
        ) : result ? (
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 text-center">
            <Award size={48} className="text-amber-400 mx-auto" />
            <h2 className="text-2xl font-black text-white">Quiz Score: {result.score}%</h2>
            <p className="text-sm text-slate-300">{result.passed ? "Congratulations! You passed this chapter assessment." : "Keep practicing! Review the lesson material and try again."}</p>

            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={() => setResult(null)}
                className="px-6 py-3 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 flex items-center gap-2"
              >
                <RotateCcw size={16} /> Retry Quiz
              </button>
              <button
                onClick={() => router.push(`/courses/java/chapter/${currentOrderNum + 1}`)}
                className="px-6 py-3 rounded-xl bg-amber-500 text-slate-950 text-xs font-black hover:bg-amber-400 flex items-center gap-2"
              >
                <span>Next Chapter</span> <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center text-xs font-mono shrink-0">
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
                            ? "bg-amber-500/20 text-amber-200 border border-amber-500/40 font-bold"
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

            <button
              onClick={handleSubmitQuiz}
              disabled={submitting || Object.keys(answers).length < questions.length}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50"
            >
              {submitting ? "Evaluating Answers..." : "Submit Quiz Assessment"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
