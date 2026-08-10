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
} from "lucide-react";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
}

interface ShuffledQuizQuestion {
  id: number;
  question: string;
  options: string[];
  optionMapping: number[];
}

interface QuizBreakdownItem {
  questionId: number;
  question: string;
  options: string[];
  userAnswer: number;
  correctAnswer: number;
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
    };
  });

  const shuffledQuestions = [...questionsWithOptionsShuffled];
  for (let i = shuffledQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
  }

  return shuffledQuestions;
}

export default function CourseQuizPage() {
  const router = useRouter();
  const params = useParams();
  const courseSlug = params?.courseSlug ? String(params.courseSlug) : "python";
  const chapterIdStr = params?.id ? String(params.id) : "0";
  const chapterOrder = parseInt(chapterIdStr, 10);

  const { data: session, isPending } = useSession();

  // State Variables
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [courseTitle, setCourseTitle] = useState(
    courseSlug === "c"
      ? "C Language Mastery & System Programming"
      : "Python AI & Data Structures Architecture"
  );
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [shuffledQuestions, setShuffledQuestions] = useState<ShuffledQuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  
  // Timing
  const [startTime, setStartTime] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch logged in user and page data
  useEffect(() => {
    if (!isPending && session?.user) {
      setUser({
        name: session.user.name ?? "Student",
        email: session.user.email ?? "",
        role: (session.user as any).role ?? "Student",
      });
    }
  }, [session, isPending]);

  // Load quiz details
  useEffect(() => {
    const loadQuizData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/courses/${courseSlug}/chapters/${chapterOrder}/quiz`);
        const data = await res.json();

        if (res.ok && data.success) {
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
  }, [chapterOrder, courseSlug]);

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

    // Check if all questions are answered
    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < shuffledQuestions.length) {
      alert(`⚠️ Please answer all questions before submitting. (${answeredCount} of ${shuffledQuestions.length} answered)`);
      return;
    }

    setSubmittingQuiz(true);
    const durationMs = Date.now() - startTime;
    const timeTakenStr = formatDuration(durationMs);

    try {
      const res = await fetch(`/api/courses/${courseSlug}/chapters/${chapterOrder}/quiz/submit`, {
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

      setQuizResult({
        submitted: true,
        score: data.score,
        passed: data.passed,
        correctCount: data.correctCount,
        totalCount: data.totalCount,
        breakdown: data.breakdown,
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

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const progressPercent = shuffledQuestions.length
    ? Math.round(((currentQuestionIndex + 1) / shuffledQuestions.length) * 100)
    : 0;

  const isC = courseSlug === "c";

  return (
    <div className="h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col selection:bg-cyan-500 selection:text-black overflow-hidden">
      {/* Custom Top Bar */}
      <header className="w-full border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 h-16 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-black text-white text-sm shadow-md">
            KS
          </div>
          <div>
            <span className="text-[10px] text-blue-600 font-mono font-bold tracking-wider block">LEARNING STUDIO</span>
            <span className="text-sm font-extrabold text-slate-800">KnowledgeStream AI &bull; {isC ? "C" : "Python"} Course</span>
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
      <main data-lenis-prevent className={`flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full ${quizResult ? "overflow-y-auto h-full custom-scrollbar" : "overflow-hidden flex flex-col justify-center h-[calc(100vh-4rem)]"}`}>
        
        {/* Breadcrumb Navigation & Back link */}
        <div className="flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-505">
            <button
              onClick={() => router.push("/dashboard")}
              className="hover:text-slate-800 transition-colors"
            >
              My Courses
            </button>
            <span>&bull;</span>
            <button
              onClick={() => router.push(`/courses/${courseSlug}`)}
              className="hover:text-slate-800 transition-colors"
            >
              Course
            </button>
            <span>&bull;</span>
            <button
              onClick={() => router.push(`/courses/${courseSlug}/curriculum`)}
              className="hover:text-slate-800 transition-colors"
            >
              Curriculum
            </button>
            <span>&bull;</span>
            <button
              onClick={() => router.push(`/courses/${courseSlug}/chapter/${chapterOrder}`)}
              className="hover:text-slate-800 transition-colors"
            >
              Lesson {chapterOrder}
            </button>
            <span>&bull;</span>
            <span className="text-blue-600 font-mono font-bold">
              {quizResult ? "Progress Result" : "Quiz Assessment"}
            </span>
          </div>

          <button
            onClick={() => router.push(`/courses/${courseSlug}/chapter/${chapterOrder}`)}
            className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 text-[11px] font-bold flex items-center gap-1.5 transition-all"
          >
            <ArrowLeft size={13} /> Back to Lesson Notes
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-blue-500/25 border-t-blue-600 animate-spin" />
            <div className="text-slate-400 text-xs font-mono">Loading Quiz Assessment...</div>
          </div>
        ) : error ? (
          <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center space-y-4 max-w-md mx-auto shadow-sm">
            <h3 className="text-base font-bold text-slate-800">Notice</h3>
            <p className="text-xs text-slate-500">{error}</p>
            <button
              onClick={() => router.push(`/courses/${courseSlug}/chapter/${chapterOrder}`)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-750 bg-slate-100 hover:bg-slate-200 border border-slate-200"
            >
              Back to Lesson
            </button>
          </div>
        ) : !quizResult ? (
          /* Quiz Player Section */
          <div className="space-y-6 animate-fade-in max-w-3xl mx-auto w-full flex-1 flex flex-col justify-center overflow-hidden">
            
            {/* Question Header Card */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-sm shrink-0">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-blue-600 uppercase tracking-widest font-bold">
                  Question {currentQuestionIndex + 1} of {quizQuestions.length}
                </span>
                <span className="text-slate-500 font-mono">
                  {Object.keys(selectedAnswers).length} of {quizQuestions.length} Answered
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            {currentQuestion && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-5 shadow-sm flex-1 flex flex-col justify-center overflow-y-auto custom-scrollbar">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-800 leading-relaxed">
                  {currentQuestion.question}
                </h3>

                <div className="grid grid-cols-1 gap-3 pt-1">
                  {currentQuestion.options.map((option, optIdx) => {
                    const isSelected = selectedAnswers[currentQuestion.id] === currentQuestion.optionMapping[optIdx];
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(optIdx)}
                        className={`w-full p-3.5 rounded-2xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-sm"
                            : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-slate-400 text-xs shrink-0">
                            {["A", "B", "C", "D"][optIdx]}.
                          </span>
                          <span>{option}</span>
                        </div>
                        {isSelected && (
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation Controls */}
            <div className="flex items-center justify-between gap-4 shrink-0">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-5 py-3 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
              >
                <ChevronLeft size={16} /> Previous
              </button>

              {currentQuestionIndex < quizQuestions.length - 1 ? (
                <button
                  onClick={handleNextQuestion}
                  className="px-5 py-3 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-all flex items-center gap-1.5"
                >
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleQuizSubmit}
                  disabled={submittingQuiz || Object.keys(selectedAnswers).length < quizQuestions.length}
                  className="px-6 py-3.5 rounded-xl font-black text-xs text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-95 disabled:opacity-55 transition-opacity flex items-center gap-1.5 shadow-md shadow-blue-500/10"
                >
                  {submittingQuiz ? "Submitting..." : "Submit Assessment"}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Quiz Result Dashboard */
          <div className="space-y-8 animate-fade-in max-w-3xl mx-auto w-full pb-10">
            
            {/* Score Header Card */}
            <div
              className={`p-6 sm:p-8 rounded-3xl border text-center space-y-6 shadow-md bg-gradient-to-b ${
                quizResult.passed
                  ? "from-emerald-50 to-emerald-100/10 border-emerald-200 text-emerald-800"
                  : "from-red-50 to-red-100/10 border-red-200 text-red-800"
              }`}
            >
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center border border-slate-200 bg-white shadow-md animate-bounce">
                {quizResult.passed ? (
                  <CheckCircle2 size={36} className="text-emerald-500" />
                ) : (
                  <XCircle size={36} className="text-red-500" />
                )}
              </div>

              <div className="space-y-1.5">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                  {quizResult.passed ? "🎉 Chapter Assessment Passed!" : "❌ Quiz Attempt Failed"}
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  {quizResult.passed
                    ? `Congratulations! You scored ${quizResult.score}% and passed the Chapter ${chapterOrder} quiz. The next chapter is now unlocked.`
                    : `You did not achieve the required passing score of 70% (your score: ${quizResult.score}%). Review the lesson notes and try again.`}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-2">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">Score</div>
                  <div className="text-xl font-bold text-slate-800 font-mono mt-0.5">{quizResult.score}%</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">Accuracy</div>
                  <div className="text-sm font-bold text-slate-800 font-mono mt-1">
                    {quizResult.correctCount} / {quizResult.totalCount}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">Time Taken</div>
                  <div className="text-[10px] font-bold text-slate-800 font-mono mt-1 flex items-center justify-center gap-1">
                    <Clock size={11} className="text-blue-600 shrink-0" />
                    <span className="truncate">{quizResult.timeTakenString}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap justify-center gap-3 border-t border-slate-200">
                <button
                  onClick={() => router.push(`/courses/${courseSlug}/curriculum`)}
                  className="px-6 py-3.5 rounded-xl font-black text-xs text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-95 transition-opacity flex items-center gap-1.5 shadow-md shadow-blue-500/10"
                >
                  Go to Curriculum Syllabus
                </button>
                
                {!quizResult.passed && (
                  <button
                    onClick={handleRetakeQuiz}
                    className="px-6 py-3.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-all flex items-center gap-1.5"
                  >
                    <RotateCcw size={14} /> Retake Assessment
                  </button>
                )}
              </div>
            </div>

            {/* Detailed Breakdown Review */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <HelpCircle size={16} className="text-blue-600" />
                Assessment Question Review
              </h3>

              <div className="space-y-4">
                {quizResult.breakdown.map((item, idx) => (
                  <div
                    key={item.questionId}
                    className={`p-5 rounded-2xl bg-white border border-slate-200 text-xs leading-relaxed space-y-4 shadow-sm border-l-4 ${
                      item.correct
                        ? "border-l-emerald-500"
                        : "border-l-red-500"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-2.5">
                        <span className="font-mono text-slate-400 font-bold">
                          Q{idx + 1}.
                        </span>
                        <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-relaxed">
                          {item.question}
                        </h4>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase shrink-0 ${
                          item.correct
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-red-50 text-red-700 border border-red-250"
                        }`}
                      >
                        {item.correct ? "Correct" : "Incorrect"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 pl-6">
                      {item.options.map((option, optIdx) => {
                        const isUserChoice = item.userAnswer === optIdx;
                        const isCorrectChoice = item.correctAnswer === optIdx;

                        let optionStyle = "bg-slate-50 border-slate-200 text-slate-650";
                        if (isCorrectChoice) {
                          optionStyle = "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold";
                        } else if (isUserChoice && !item.correct) {
                          optionStyle = "bg-red-50 border-red-300 text-red-800 font-bold";
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-xl border text-[11px] flex justify-between items-center ${optionStyle}`}
                          >
                            <div>
                              <span className="font-mono text-slate-400 mr-2">
                                {["A", "B", "C", "D"][optIdx]}.
                              </span>
                              {option}
                            </div>
                            {isCorrectChoice && (
                              <span className="text-[9px] text-emerald-800 font-mono font-bold uppercase tracking-wider shrink-0 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded">
                                Correct
                              </span>
                            )}
                            {isUserChoice && !item.correct && (
                              <span className="text-[9px] text-red-800 font-mono font-bold uppercase tracking-wider shrink-0 bg-red-100 border border-red-200 px-2 py-0.5 rounded">
                                Your Choice
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
