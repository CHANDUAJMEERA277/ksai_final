"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  Award,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  BookOpen,
  Sparkles,
  Check,
  X,
  Lock,
  Unlock,
} from "lucide-react";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  explanation?: string;
  section?: string;
}

interface ShuffledQuizQuestion {
  id: number;
  question: string;
  options: string[];
  optionMapping: number[];
  explanation?: string;
  section?: string;
}

interface QuizBreakdownItem {
  questionId: number;
  question: string;
  options: string[];
  userAnswer: number;
  correctAnswer: number;
  explanation: string;
  section: string;
  correct: boolean;
}

interface QuizResult {
  submitted: boolean;
  score: number;
  passed: boolean;
  correctCount: number;
  totalCount: number;
  breakdown: QuizBreakdownItem[];
  timeTakenString: string;
}

interface SectionStat {
  sectionTitle: string;
  sectionNum: number;
  totalQuestions: number;
  correctQuestions: number;
  status: "Strong" | "Good" | "Needs Practice" | "Weak";
  accuracy: number;
  reteachCount: number;
}

const CHAPTER_0_SECTIONS = [
  "1. What is Programming?",
  "2. What is Python?",
  "3. Where Python is Used",
  "4. How Python Executes Code",
  "5. Interpreted vs Compiled Languages",
  "6. Installing Python & Setting Up VS Code",
  "7. Writing Your Very First Python Program",
];

function getQuestionSection(qId: number, questionText: string): string {
  const lower = questionText.toLowerCase();
  if (lower.includes("programming") || lower.includes("ingredient") || lower.includes("step-by-step")) {
    return "1. What is Programming?";
  }
  if (lower.includes("guido") || lower.includes("monty") || lower.includes("high-level") || lower.includes("what is python")) {
    return "2. What is Python?";
  }
  if (lower.includes("where python") || lower.includes("use") || lower.includes("kernel") || lower.includes("industry")) {
    return "3. Where Python is Used";
  }
  if (lower.includes("bytecode") || lower.includes("pvm") || lower.includes("virtual machine") || lower.includes("executes")) {
    return "4. How Python Executes Code";
  }
  if (lower.includes("interpreted") || lower.includes("compiled") || lower.includes("translation") || lower.includes("timing")) {
    return "5. Interpreted vs Compiled Languages";
  }
  if (lower.includes("install") || lower.includes("path") || lower.includes("vs code") || lower.includes("extension")) {
    return "6. Installing Python & Setting Up VS Code";
  }
  if (lower.includes("print") || lower.includes("hello, world") || lower.includes("nameerror") || lower.includes("syntaxerror")) {
    return "7. Writing Your Very First Python Program";
  }
  const idx = ((qId - 1) % CHAPTER_0_SECTIONS.length);
  return CHAPTER_0_SECTIONS[idx];
}

function shuffleArray<T>(array: T[]): { shuffled: T[]; mapping: number[] } {
  const arrWithIndex = array.map((item, index) => ({ item, index }));
  for (let i = arrWithIndex.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arrWithIndex[i], arrWithIndex[j]] = [arrWithIndex[j], arrWithIndex[i]];
  }
  return {
    shuffled: arrWithIndex.map((x) => x.item),
    mapping: arrWithIndex.map((x) => x.index),
  };
}

function shuffleQuiz(questions: QuizQuestion[]): ShuffledQuizQuestion[] {
  const questionsWithOptionsShuffled = questions.map((q) => {
    const { shuffled, mapping } = shuffleArray(q.options);
    return {
      id: q.id,
      question: q.question,
      options: shuffled,
      optionMapping: mapping,
      explanation: q.explanation,
      section: q.section || getQuestionSection(q.id, q.question),
    };
  });

  const shuffledQuestions = [...questionsWithOptionsShuffled];
  for (let i = shuffledQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
  }

  return shuffledQuestions;
}

export default function PythonQuizPage() {
  const router = useRouter();
  const params = useParams();
  const chapterIdStr = params?.id ? String(params.id) : "0";
  const chapterOrder = parseInt(chapterIdStr, 10);

  const sessionData = useSession();
  const session = (sessionData?.data as any) ?? null;
  const isPending = sessionData?.isPending ?? false;

  // State Variables
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [shuffledQuestions, setShuffledQuestions] = useState<ShuffledQuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [lessonReteachCounts, setLessonReteachCounts] = useState<Record<string, number>>({});
  const [quizEligibility, setQuizEligibility] = useState<{
    isEligible: boolean;
    reason?: string;
    passed: boolean;
    bestScore: number;
    minPassingScore: number;
  } | null>(null);
  
  // Timing
  const [startTime, setStartTime] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch logged in user
  useEffect(() => {
    if (!isPending && session?.user) {
      setUser({
        name: session.user.name ?? "Student",
        email: session.user.email ?? "",
        role: (session.user as any).role ?? "Student",
      });
    }
  }, [session, isPending]);

  // Load lesson progress for reteach stats
  useEffect(() => {
    const loadProgressData = async () => {
      try {
        const userEmail = session?.user?.email;
        if (!userEmail) return;
        const res = await fetch(`/api/courses/python/chapters/${chapterOrder}/lesson-progress?userEmail=${encodeURIComponent(userEmail)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.progress) {
            const counts: Record<string, number> = {};
            Object.keys(data.progress).forEach((key) => {
              counts[key] = data.progress[key].attempts > 1 ? data.progress[key].attempts - 1 : 0;
            });
            setLessonReteachCounts(counts);
          }
        }
      } catch (e) {
        console.error("Progress fetch error:", e);
      }
    };
    loadProgressData();
  }, [chapterOrder, session]);

  // Load quiz details
  useEffect(() => {
    const loadQuizData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/courses/python/chapters/${chapterOrder}/quiz`);
        const data = await res.json();

        if (res.ok && data.success) {
          if (data.quizEligibility) {
            setQuizEligibility(data.quizEligibility);
          }

          if (!data.questions || data.questions.length === 0) {
            setError("No quiz assessment is available for this chapter.");
          } else {
            setQuizQuestions(data.questions);
            setShuffledQuestions(shuffleQuiz(data.questions));
            setStartTime(Date.now());
          }
        } else {
          setError(data.error || "Failed to load quiz questions.");
        }
      } catch (err) {
        console.error(err);
        setError("Network error connecting to quiz server.");
      } finally {
        setLoading(false);
      }
    };

    loadQuizData();
  }, [chapterOrder]);

  const handleSelectOption = (optionIndex: number) => {
    if (quizResult) return;
    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    if (!currentQuestion) return;
    const originalOptionIndex = currentQuestion.optionMapping[optionIndex];
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: originalOptionIndex,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.round(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ${seconds} second${seconds > 1 ? "s" : ""}`;
    }
    return `${seconds} second${seconds > 1 ? "s" : ""}`;
  };

  const handleQuizSubmit = async () => {
    if (shuffledQuestions.length === 0) return;

    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < shuffledQuestions.length) {
      alert(`⚠️ Please answer all questions before submitting. (${answeredCount} of ${shuffledQuestions.length} answered)`);
      return;
    }

    setSubmittingQuiz(true);
    const durationMs = Date.now() - startTime;
    const timeTakenStr = formatDuration(durationMs);

    try {
      const res = await fetch(`/api/courses/python/chapters/${chapterOrder}/quiz/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: selectedAnswers }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Submission failed.");
        setSubmittingQuiz(false);
        return;
      }

      // Add enriched section mapping to breakdown
      const enrichedBreakdown: QuizBreakdownItem[] = (data.breakdown || []).map((item: any) => ({
        ...item,
        section: item.section || getQuestionSection(item.questionId, item.question),
      }));

      setQuizResult({
        submitted: true,
        score: data.score,
        passed: data.passed,
        correctCount: data.correctCount,
        totalCount: data.totalCount,
        breakdown: enrichedBreakdown,
        timeTakenString: timeTakenStr,
      });
    } catch (err) {
      console.error(err);
      alert("Network error submitting quiz.");
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleRetakeQuiz = () => {
    setSelectedAnswers({});
    setQuizResult(null);
    setCurrentQuestionIndex(0);
    setShuffledQuestions(shuffleQuiz(quizQuestions));
    setStartTime(Date.now());
  };

  // Compute detailed section performance from actual quiz results + live teacher reteach data
  const computeSectionStats = (): SectionStat[] => {
    if (!quizResult) return [];

    return CHAPTER_0_SECTIONS.map((secTitle, idx) => {
      const secNum = idx + 1;
      const relatedQuestions = quizResult.breakdown.filter((b) => {
        const itemSec = b.section || getQuestionSection(b.questionId, b.question);
        return itemSec === secTitle || itemSec.includes(secTitle.substring(3));
      });

      const totalQ = relatedQuestions.length;
      const correctQ = relatedQuestions.filter((q) => q.correct).length;
      const accuracy = totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : 100;
      const reteaches = lessonReteachCounts[secTitle] || 0;

      let status: "Strong" | "Good" | "Needs Practice" | "Weak" = "Strong";
      if (accuracy < 50 || (totalQ > 0 && correctQ === 0) || reteaches >= 2) {
        status = "Weak";
      } else if (accuracy < 75 || reteaches === 1) {
        status = "Needs Practice";
      } else if (accuracy < 100) {
        status = "Good";
      }

      return {
        sectionTitle: secTitle,
        sectionNum: secNum,
        totalQuestions: totalQ,
        correctQuestions: correctQ,
        status,
        accuracy,
        reteachCount: reteaches,
      };
    });
  };

  const sectionStats = computeSectionStats();
  const strongSections = sectionStats.filter((s) => s.status === "Strong" || s.status === "Good");
  const weakSections = sectionStats.filter((s) => s.status === "Needs Practice" || s.status === "Weak");

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const progressPercent = shuffledQuestions.length
    ? Math.round(((currentQuestionIndex + 1) / shuffledQuestions.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Top Bar */}
      <header className="w-full border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 h-16 shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-black text-white text-sm shadow-md">
            KS
          </div>
          <div>
            <span className="text-[10px] text-blue-600 font-mono font-bold tracking-wider block">LEARNING STUDIO</span>
            <span className="text-sm font-extrabold text-slate-800">KnowledgeStream AI &bull; Python Course</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main Workspace Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
        
        {/* Breadcrumb Navigation & Back link */}
        <div className="flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <button onClick={() => router.push("/dashboard")} className="hover:text-slate-800 transition-colors">
              Courses
            </button>
            <span>&bull;</span>
            <button onClick={() => router.push("/courses/python")} className="hover:text-slate-800 transition-colors">
              Python
            </button>
            <span>&bull;</span>
            <button onClick={() => router.push(`/courses/python/chapter/${chapterOrder}`)} className="hover:text-slate-800 transition-colors">
              Chapter {chapterOrder}
            </button>
            <span>&bull;</span>
            <span className="text-blue-600 font-mono font-bold">
              {quizResult ? "Performance Analysis" : "Quiz Assessment"}
            </span>
          </div>

          <button
            onClick={() => router.push(`/courses/python/chapter/${chapterOrder}`)}
            className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <ArrowLeft size={13} /> Back to Lesson Notes
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-blue-500/25 border-t-blue-600 animate-spin" />
            <div className="text-slate-400 text-xs font-mono">Loading Chapter 0 Quiz Assessment...</div>
          </div>
        ) : error ? (
          <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center space-y-4 max-w-md mx-auto shadow-sm">
            <h3 className="text-base font-bold text-slate-800">Notice</h3>
            <p className="text-xs text-slate-500">{error}</p>
            <button
              onClick={() => router.push(`/courses/python/chapter/${chapterOrder}`)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200"
            >
              Back to Lesson
            </button>
          </div>
        ) : quizEligibility && !quizEligibility.isEligible ? (
          <div className="bg-white p-10 rounded-3xl border-2 border-amber-200/90 text-center space-y-4 max-w-lg mx-auto shadow-sm animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
              <Lock size={26} />
            </div>
            <h3 className="text-lg font-black text-slate-900">Chapter Assessment Locked</h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              {quizEligibility.reason || "Please master all chapter topics with your AI Teacher before taking the Chapter Assessment Quiz."}
            </p>
            <div className="pt-2">
              <button
                onClick={() => router.push(`/courses/python/chapter/${chapterOrder}`)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-xs"
              >
                Back to Learning Topics
              </button>
            </div>
          </div>
        ) : !quizResult ? (
          /* =========================================================
             QUIZ ASSESSMENT PLAYER
             ========================================================= */
          <div className="space-y-6 animate-fade-in max-w-3xl mx-auto w-full">
            
            {/* Question Header Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-blue-600 uppercase tracking-widest font-bold">
                    Question {currentQuestionIndex + 1} of {quizQuestions.length}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                    {currentQuestion?.section || "Chapter Concept"}
                  </span>
                </div>
                <span className="text-slate-500 font-mono text-xs">
                  {Object.keys(selectedAnswers).length} of {quizQuestions.length} Answered
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            {currentQuestion && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6 shadow-sm">
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-relaxed">
                  {currentQuestion.question}
                </h3>

                <div className="grid grid-cols-1 gap-3 pt-1">
                  {currentQuestion.options.map((option, optIdx) => {
                    const originalIdx = currentQuestion.optionMapping[optIdx];
                    const isSelected = selectedAnswers[currentQuestion.id] === originalIdx;

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(optIdx)}
                        className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-blue-50 border-blue-500 text-blue-800 font-bold shadow-xs ring-1 ring-blue-500/20"
                            : "bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                            isSelected ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-500"
                          }`}>
                            {["A", "B", "C", "D"][optIdx]}
                          </span>
                          <span>{option}</span>
                        </div>
                        {isSelected && (
                          <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation Controls */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-5 py-3 rounded-xl font-bold text-xs bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <ChevronLeft size={16} /> Previous
              </button>

              {currentQuestionIndex < quizQuestions.length - 1 ? (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-3 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/15"
                >
                  Next Question <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleQuizSubmit}
                  disabled={submittingQuiz || Object.keys(selectedAnswers).length < quizQuestions.length}
                  className="px-7 py-3.5 rounded-xl font-black text-xs text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-95 disabled:opacity-50 transition-opacity flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  {submittingQuiz ? "Evaluating Answers..." : "Submit Assessment"}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* =========================================================
             QUIZ COMPLETION & REAL STRENGTH / WEAKNESS ANALYSIS
             ========================================================= */
          <div className="space-y-8 animate-fade-in max-w-4xl mx-auto w-full pb-16">
            
            {/* Score Header Card */}
            <div
              className={`p-6 sm:p-8 rounded-3xl border text-center space-y-6 shadow-md bg-gradient-to-b ${
                quizResult.passed
                  ? "from-emerald-50 to-emerald-100/20 border-emerald-200 text-emerald-950"
                  : "from-amber-50 to-amber-100/20 border-amber-200 text-amber-950"
              }`}
            >
              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center border border-slate-200 bg-white shadow-md">
                {quizResult.passed ? (
                  <CheckCircle2 size={38} className="text-emerald-500" />
                ) : (
                  <RotateCcw size={38} className="text-amber-500" />
                )}
              </div>

              <div className="space-y-1.5">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {quizResult.passed ? "🎉 Chapter 0 Assessment Complete!" : "Chapter 0 Assessment Result"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                  {quizResult.passed
                    ? `Outstanding work! You scored ${quizResult.score}% (${quizResult.correctCount} of ${quizResult.totalCount} correct) and demonstrated mastery of the core concepts.`
                    : `You scored ${quizResult.score}% (${quizResult.correctCount} of ${quizResult.totalCount} correct). Review the weak areas identified below to solidify your understanding.`}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto pt-2">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">Score</div>
                  <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">{quizResult.score}%</div>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">Accuracy</div>
                  <div className="text-base font-black text-slate-900 font-mono mt-1.5">
                    {quizResult.correctCount} / {quizResult.totalCount}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">Time Taken</div>
                  <div className="text-xs font-bold text-slate-900 font-mono mt-2 flex items-center justify-center gap-1">
                    <Clock size={12} className="text-blue-600 shrink-0" />
                    <span className="truncate">{quizResult.timeTakenString}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap justify-center gap-3 border-t border-slate-200/80">
                <button
                  onClick={() => router.push(`/courses/python/chapter/${chapterOrder}`)}
                  className="px-6 py-3 rounded-xl font-bold text-xs bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-all flex items-center gap-1.5 shadow-2xs"
                >
                  <BookOpen size={14} /> Review Lesson Notes
                </button>
                
                <button
                  onClick={handleRetakeQuiz}
                  className="px-6 py-3 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-all flex items-center gap-1.5"
                >
                  <RotateCcw size={14} /> Retake Assessment
                </button>
              </div>
            </div>

            {/* =========================================================
                REAL SECTION PERFORMANCE TABLE (SECTIONS 1 TO 7)
                ========================================================= */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                    📊
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Chapter 0 Section Performance Analysis
                    </h3>
                    <p className="text-xs text-slate-500">
                      Calculated from your quiz answers, understanding checks, and reteach requests
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                    quizResult.score >= 85
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : quizResult.score >= 70
                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}
                >
                  Overall: {quizResult.score >= 85 ? "Strong" : quizResult.score >= 70 ? "Good" : "Needs Practice"}
                </span>
              </div>

              {/* Real Section Performance Rows */}
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                {sectionStats.map((stat) => {
                  const badgeColor =
                    stat.status === "Strong"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : stat.status === "Good"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : stat.status === "Needs Practice"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-red-50 text-red-700 border-red-200";

                  const badgeDot =
                    stat.status === "Strong"
                      ? "🟢"
                      : stat.status === "Good"
                      ? "🟡"
                      : stat.status === "Needs Practice"
                      ? "🟠"
                      : "🔴";

                  return (
                    <div
                      key={stat.sectionNum}
                      className="p-4 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs sm:text-sm font-bold text-slate-800">
                          {stat.sectionTitle}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-3">
                          <span>Accuracy: {stat.accuracy}%</span>
                          {stat.reteachCount > 0 && (
                            <span className="text-amber-600 font-medium">
                              &bull; Reteached: {stat.reteachCount}x
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${badgeColor}`}
                        >
                          <span>{badgeDot}</span>
                          <span>{stat.status}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Strong Areas & Needs Practice Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Strong Areas */}
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2.5">
                  <div className="font-bold text-emerald-900 text-xs sm:text-sm flex items-center gap-2">
                    <Sparkles size={16} className="text-emerald-600" />
                    <span>Your Strong Areas ({strongSections.length})</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] sm:text-xs text-emerald-800">
                    {strongSections.length > 0 ? (
                      strongSections.map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span><strong>{s.sectionTitle}</strong> &mdash; {s.accuracy}% accuracy</span>
                        </li>
                      ))
                    ) : (
                      <li>Continue working through chapter exercises.</li>
                    )}
                  </ul>
                </div>

                {/* Needs Practice */}
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2.5">
                  <div className="font-bold text-amber-900 text-xs sm:text-sm flex items-center gap-2">
                    <RotateCcw size={16} className="text-amber-600" />
                    <span>Needs Practice ({weakSections.length})</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] sm:text-xs text-amber-800">
                    {weakSections.length > 0 ? (
                      weakSections.map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <X size={14} className="text-amber-600 shrink-0 mt-0.5" />
                          <span><strong>{s.sectionTitle}</strong> &mdash; {s.accuracy}% accuracy</span>
                        </li>
                      ))
                    ) : (
                      <li className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                        <Check size={14} /> All chapter concepts mastered with high accuracy!
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* =========================================================
                DETAILED QUESTION REVIEW (WHY & EXPLANATION)
                ========================================================= */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <HelpCircle size={17} className="text-blue-600" />
                Assessment Question-by-Question Review
              </h3>

              <div className="space-y-4">
                {quizResult.breakdown.map((item, idx) => {
                  const correctOptionText = item.options[item.correctAnswer] || "";

                  return (
                    <div
                      key={item.questionId}
                      className={`p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 text-xs leading-relaxed space-y-4 shadow-sm border-l-4 ${
                        item.correct ? "border-l-emerald-500" : "border-l-red-500"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-2.5">
                          <span className="font-mono text-slate-400 font-bold">Q{idx + 1}.</span>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-relaxed">
                              {item.question}
                            </h4>
                            <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                              Topic: {item.section || "Chapter Concept"}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full font-mono uppercase shrink-0 ${
                            item.correct
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {item.correct ? "✓ Correct" : "✗ Incorrect"}
                        </span>
                      </div>

                      {/* Options List */}
                      <div className="grid grid-cols-1 gap-2 pl-4 sm:pl-6">
                        {item.options.map((option, optIdx) => {
                          const isUserChoice = item.userAnswer === optIdx;
                          const isCorrectChoice = item.correctAnswer === optIdx;

                          let optionStyle = "bg-slate-50/70 border-slate-200 text-slate-600";
                          if (isCorrectChoice) {
                            optionStyle = "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold";
                          } else if (isUserChoice && !item.correct) {
                            optionStyle = "bg-red-50 border-red-300 text-red-900 font-bold";
                          }

                          return (
                            <div
                              key={optIdx}
                              className={`p-3 rounded-xl border text-xs flex justify-between items-center ${optionStyle}`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-slate-400 font-bold">
                                  {["A", "B", "C", "D"][optIdx]}.
                                </span>
                                <span>{option}</span>
                              </div>
                              {isCorrectChoice && (
                                <span className="text-[9px] text-emerald-800 font-mono font-bold uppercase tracking-wider shrink-0 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md">
                                  Correct Answer
                                </span>
                              )}
                              {isUserChoice && !item.correct && (
                                <span className="text-[9px] text-red-800 font-mono font-bold uppercase tracking-wider shrink-0 bg-red-100 border border-red-200 px-2 py-0.5 rounded-md">
                                  Your Choice
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation Box */}
                      <div className="mt-3 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-[11px] sm:text-xs text-blue-900 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-blue-800 font-mono uppercase text-[10px]">
                          <span>💡 Why:</span>
                        </div>
                        <p className="leading-relaxed">
                          {item.explanation || `The correct answer is "${correctOptionText}" as explained in ${item.section || "the lesson"}.`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Proceed Action */}
            <div className="pt-4 flex flex-wrap justify-between items-center gap-4 border-t border-slate-200">
              <button
                onClick={() => router.push(`/courses/python/chapter/${chapterOrder}`)}
                className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-2"
              >
                <ArrowLeft size={14} /> Back to Chapter {chapterOrder} Notes
              </button>

              {quizResult.passed ? (
                <button
                  onClick={() => router.push(`/courses/python/chapter/${chapterOrder + 1}`)}
                  className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 hover:opacity-95 text-white text-xs font-black transition flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <span>🎉 Chapter Passed! Continue to Chapter {chapterOrder + 1}</span>
                  <ArrowRight size={15} />
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRetakeQuiz}
                    className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs"
                  >
                    <RotateCcw size={14} /> Retake Assessment
                  </button>
                  <button
                    onClick={() => router.push(`/courses/python/chapter/${chapterOrder}`)}
                    className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs"
                  >
                    <span>Review Weak Topics</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

