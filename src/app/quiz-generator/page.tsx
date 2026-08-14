"use client";

import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { motion } from "framer-motion";
import {
  Play, ShieldCheck, Eye, Bookmark, Sparkles, RefreshCw,
  CheckCircle, HelpCircle, CalendarDays, BookOpen, Layers, CheckCircle2,
  CheckSquare, Square
} from "lucide-react";
import { useNotification } from "@/components/ui/NotificationContext";
import { PracticeHistoryPanel } from "@/components/practice/PracticeHistoryPanel";
import { LeftSidebar } from "@/components/dashboard/LeftSidebar";

type QuizQuestion = {
  id: string;
  question: string;
  type: string;
  options?: any[];
  answer?: any;
  correctAnswer?: any;
  topic?: string | null;
  difficulty?: string;
  estTimeSeconds?: number;
  marks?: number;
  explanation?: string | null;
};

function QuizGeneratorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { notify } = useNotification();
  const session = useSession();
  const sessionUser = (session?.data as any)?.user ?? null;
  const isPending = session?.isPending ?? false;

  const [activeTab, setActiveTab] = useState<"builder" | "history">("builder");
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [builderConfig, setBuilderConfig] = useState({ difficulty: "mixed", count: 10, types: ["mcq"] });
  const [proctorMode, setProctorMode] = useState(false);
  const [retryModeActive, setRetryModeActive] = useState(false);

  useEffect(() => {
    if (!isPending && sessionUser?.email) {
      fetch(`/api/courses/my-courses?email=${encodeURIComponent(sessionUser.email)}`)
        .then((r) => r.json())
        .then((d) => setEnrollments(d.enrollments || []))
        .catch(console.error);

      fetch(`/api/courses`)
        .then((r) => r.json())
        .then((d) => setCourses(d.courses || []))
        .catch(console.error);

      fetch(`/api/practice/history`)
        .then((r) => r.json())
        .then((d) => setHistory(d.history || []))
        .catch(() => setHistory([]));
    }
  }, [isPending, sessionUser]);

  useEffect(() => {
    if (selectedCourse) {
      setChapters(selectedCourse.chapters || []);
      // Auto-select all chapters by default for best user experience
      const allChapterIds = (selectedCourse.chapters || []).map((ch: any) => ch.id);
      setSelectedChapters(allChapterIds);
    } else {
      setChapters([]);
      setSelectedChapters([]);
    }
  }, [selectedCourse]);

  // Handle URL query retry param
  useEffect(() => {
    const courseParam = searchParams.get("courseId");
    const retryParam = searchParams.get("retryMode");

    if (courseParam && courses.length > 0) {
      const found = courses.find((c) => c.id === courseParam);
      if (found) {
        setSelectedCourse(found);
        if (retryParam === "wrong") {
          setRetryModeActive(true);
        }
      }
    }
  }, [searchParams, courses]);

  const myPurchasedCourses = useMemo(() => {
    const purchasedIds = (enrollments || []).map((e) => e.courseId);
    const userPurchased = courses.filter((c) => purchasedIds.includes(c.id));
    return userPurchased.length > 0 ? userPurchased : courses;
  }, [courses, enrollments]);

  const toggleChapter = (chapterId: string) => {
    setSelectedChapters((prev) => (prev.includes(chapterId) ? prev.filter((id) => id !== chapterId) : [...prev, chapterId]));
  };

  const generateQuiz = async (overrideRetryMode = false) => {
    if (!selectedCourse) {
      notify("Please select a course before starting your MCQ quiz.", "warning");
      return;
    }
    setIsGenerating(true);

    try {
      const activeChapters = selectedChapters.length > 0 ? selectedChapters : chapters.map((c) => c.id);
      const res = await fetch("/api/practice/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          chapters: activeChapters,
          config: { ...builderConfig, types: ["mcq"] },
          proctored: proctorMode,
          retryMode: overrideRetryMode || retryModeActive ? "wrong" : "standard",
        }),
      });

      const data = await res.json();
      if (res.ok && data.quiz) {
        // Enforce MCQ type filter on generated questions
        const mcqOnlyQuiz = (data.quiz || []).map((q: any) => ({
          ...q,
          type: "mcq",
          options: q.options && q.options.length > 0 ? q.options : ["Option A", "Option B", "Option C", "Option D"]
        }));
        setQuiz(mcqOnlyQuiz);
        setSessionId(data.sessionId || null);
        notify(
          overrideRetryMode || retryModeActive
            ? "Retry MCQ quiz generated targeting your weak topics!"
            : "Adaptive MCQ practice quiz generated successfully.",
          "success"
        );
      } else {
        notify(data.error || "Failed to generate MCQ quiz.", "error");
      }
    } catch (err) {
      console.error(err);
      notify("Could not generate MCQ quiz. Please try again.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-screen bg-[#F8FAFC] text-slate-800 flex overflow-hidden font-sans antialiased">
      {/* Unified Left Sidebar */}
      <LeftSidebar
        activeTab="AI Quiz Generator"
        onTabChange={(tab) => {
          if (tab === "Dashboard") router.push("/dashboard");
          else if (tab === "Explore Courses") router.push("/courses/catalog");
          else if (tab === "Courses") router.push("/courses");
          else if (tab === "Leaderboard") router.push("/leaderboard");
          else if (tab === "AI Mentor") router.push("/codexai");
          else if (tab === "AI Quiz Generator") router.push("/quiz-generator");
          else if (tab === "Workspace") router.push("/workspace");
          else if (tab === "Certificates") router.push("/certificates");
          else if (tab === "Settings") router.push("/settings");
        }}
        fullHeight={true}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 w-full max-w-[1600px] mx-auto custom-scrollbar">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between glass-panel p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#4F46E5] text-xs font-bold border border-blue-100 mb-2">
              <Sparkles size={13} /> 100% MCQ Practice Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">AI MCQ Quiz Generator 🧠</h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl">Practice multiple-choice questions on your enrolled courses and selected concepts with instant feedback.</p>
          </div>
          <div>
            <button onClick={() => router.push('/dashboard')} className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-black text-slate-700 shadow-sm hover:shadow-md transition cursor-pointer">Back to Dashboard</button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex rounded-2xl bg-white p-1.5 border border-slate-200 shadow-sm max-w-md">
          <button
            onClick={() => setActiveTab("builder")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black transition ${activeTab === "builder" ? "bg-[#4F46E5] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
          >
            <Layers size={15} /> MCQ Quiz Builder
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black transition ${activeTab === "history" ? "bg-[#4F46E5] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
          >
            <CalendarDays size={15} /> Practice History ({history.length})
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          {activeTab === "history" ? (
            <PracticeHistoryPanel
              history={history}
              onDelete={(id) => {
                fetch(`/api/practice/history?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
                  .then((res) => res.json())
                  .then(() => setHistory((current) => current.filter((item) => item.id !== id)))
                  .catch(() => notify('Unable to delete history item.', 'error'));
              }}
            />
          ) : (
            <div className="space-y-6">
              {!quiz ? (
                <div className="space-y-6">
                  {/* Step 1: Course Selector */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#4F46E5]">Step 1</span>
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mt-0.5">
                          <BookOpen size={20} className="text-[#4F46E5]" /> Select Enrolled Course
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Choose a course from your account to source MCQ questions from.</p>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {myPurchasedCourses.map((course) => (
                        <button
                          key={course.id}
                          onClick={() => setSelectedCourse(course)}
                          className={`p-5 rounded-2xl border ${selectedCourse?.id === course.id ? 'bg-indigo-50/80 text-slate-900 border-[#4F46E5] ring-2 ring-indigo-200 shadow-md' : 'bg-slate-50/70 text-slate-700 border-slate-200 hover:bg-slate-100/80'} text-left transition duration-200 cursor-pointer flex flex-col justify-between space-y-4`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <span className="inline-block px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-extrabold text-[#4F46E5] uppercase tracking-wider mb-2">
                                {course.language || course.category || "Course"}
                              </span>
                              <div className="text-sm font-black text-slate-900 leading-snug">{course.title}</div>
                            </div>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${selectedCourse?.id === course.id ? 'bg-[#4F46E5] text-white' : 'bg-slate-200 text-slate-400'}`}>
                              ✓
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-3 border-t border-slate-200/60">
                            <span>{(course.chapters || []).length} Chapters</span>
                            <span className="text-[#4F46E5]">{course.level || 'All Levels'}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedCourse && (
                    <>
                      {/* Step 2: Select Concepts & Chapters - BIG & PROFESSIONAL */}
                      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#4F46E5]">Step 2</span>
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2.5 mt-0.5">
                              <Layers size={22} className="text-[#4F46E5]" /> Select Concepts &amp; Chapters
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                              Select specific chapters to generate targeted MCQs, or include all for a complete assessment.
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-extrabold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                              {selectedChapters.length} of {chapters.length} Selected
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedChapters(chapters.map((c) => c.id))}
                              className="px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-black text-[#4F46E5] hover:bg-indigo-100 transition cursor-pointer"
                            >
                              Select All
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedChapters([])}
                              className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        {/* BIG PROFESSIONAL CHAPTER CARDS GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {chapters.map((ch: any, idx: number) => {
                            const isSelected = selectedChapters.includes(ch.id);
                            return (
                              <div
                                key={ch.id}
                                onClick={() => toggleChapter(ch.id)}
                                className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-4 ${
                                  isSelected
                                    ? "bg-gradient-to-br from-indigo-50/90 via-white to-blue-50/40 border-[#4F46E5] ring-2 ring-indigo-200 shadow-md"
                                    : "bg-slate-50/60 border-slate-200 hover:bg-slate-100/70 hover:border-slate-300"
                                }`}
                              >
                                <div className="flex items-start gap-3.5">
                                  <div className="mt-0.5">
                                    {isSelected ? (
                                      <CheckSquare size={20} className="text-[#4F46E5]" />
                                    ) : (
                                      <Square size={20} className="text-slate-400" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <span className="inline-block px-2 py-0.5 rounded-md bg-white/80 border border-slate-200/80 text-[10px] font-black text-[#4F46E5] tracking-wide mb-1.5">
                                      Chapter {String(idx + 1).padStart(2, "0")}
                                    </span>
                                    <h4 className="text-sm font-black text-slate-900 leading-snug">
                                      {ch.title}
                                    </h4>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-3 border-t border-slate-200/60">
                                  <span className="flex items-center gap-1">
                                    <CheckCircle2 size={13} className={isSelected ? "text-emerald-500" : "text-slate-400"} />
                                    {isSelected ? "Active for Quiz" : "Excluded"}
                                  </span>
                                  <span className="text-xs font-black text-[#4F46E5]">MCQ Practice</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Step 3: MCQ Settings */}
                      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition space-y-6">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#4F46E5]">Step 3</span>
                          <h3 className="text-lg font-black text-slate-900 mt-0.5">MCQ Quiz Settings</h3>
                          <p className="text-xs text-slate-500 mt-1">Customize question count, difficulty level, and proctor exam mode.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <label className="text-xs font-black text-slate-700 space-y-1.5">
                            <span>Difficulty Level</span>
                            <select
                              value={builderConfig.difficulty}
                              onChange={(e) => setBuilderConfig((s) => ({ ...s, difficulty: e.target.value }))}
                              className="w-full rounded-2xl bg-slate-50 p-3 text-xs font-extrabold border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                            >
                              <option value="mixed">Mixed Difficulty (Easy, Medium, Hard)</option>
                              <option value="easy">Easy (2 Marks per question)</option>
                              <option value="medium">Medium (3 Marks per question)</option>
                              <option value="hard">Hard (5 Marks per question)</option>
                            </select>
                          </label>

                          <label className="text-xs font-black text-slate-700 space-y-1.5">
                            <span>Number of MCQ Questions</span>
                            <input
                              type="number"
                              value={builderConfig.count}
                              min={1}
                              max={50}
                              onChange={(e) => setBuilderConfig((s) => ({ ...s, count: Number(e.target.value) }))}
                              className="w-full rounded-2xl bg-slate-50 p-3 text-xs font-extrabold border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                            />
                          </label>

                          <div className="sm:col-span-2 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-extrabold text-[#4F46E5]">
                            <span className="flex items-center gap-2">
                              <Sparkles size={16} className="text-[#4F46E5]" /> Question Format:
                            </span>
                            <span className="px-4 py-1.5 rounded-full bg-white border border-indigo-200 text-xs font-black shadow-xs flex items-center gap-2">
                              <CheckCircle2 size={15} className="text-emerald-500" /> 100% MCQ (Multiple Choice Questions)
                            </span>
                          </div>

                          <label className="sm:col-span-2 flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition">
                            <input
                              type="checkbox"
                              checked={proctorMode}
                              onChange={(e) => setProctorMode(e.target.checked)}
                              className="h-5 w-5 rounded border-slate-300 text-[#4F46E5] focus:ring-[#4F46E5]"
                            />
                            <div>
                              <div className="font-black text-slate-900 text-xs flex items-center gap-2">
                                <ShieldCheck size={16} className="text-[#4F46E5]" /> Proctor Exam Mode
                              </div>
                              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                Enforces strict supervision for mock exam qualification: tab switch detection, blur tracking, copy/paste block.
                              </p>
                            </div>
                          </label>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button
                      onClick={() => generateQuiz(false)}
                      disabled={isGenerating || !selectedCourse || selectedChapters.length === 0}
                      className="inline-flex items-center gap-2 rounded-3xl bg-[#4F46E5] hover:bg-[#4338CA] px-8 py-4 text-xs font-black text-white shadow-md hover:shadow-lg transition duration-200 disabled:opacity-50 cursor-pointer"
                    >
                      <Play size={16} />
                      {isGenerating ? "Generating MCQ Quiz..." : "Start MCQ Practice Quiz"}
                    </button>

                    <button
                      onClick={() => generateQuiz(true)}
                      disabled={isGenerating || !selectedCourse || selectedChapters.length === 0}
                      className="inline-flex items-center gap-2 rounded-3xl bg-amber-500 hover:bg-amber-600 px-6 py-4 text-xs font-black text-white shadow-md hover:shadow-lg transition duration-200 disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw size={16} />
                      Retry Weak Concept MCQs
                    </button>
                  </div>
                </div>
              ) : (
                <QuizPlayer
                  quiz={quiz}
                  sessionId={sessionId}
                  proctorMode={proctorMode}
                  onExit={() => {
                    setQuiz(null);
                    setSessionId(null);
                    fetch(`/api/practice/history`)
                      .then((r) => r.json())
                      .then((d) => setHistory(d.history || []))
                      .catch(() => {});
                  }}
                />
              )}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

function QuizPlayer({
  quiz,
  sessionId,
  proctorMode,
  onExit,
}: {
  quiz: QuizQuestion[];
  sessionId: string | null;
  proctorMode: boolean;
  onExit: () => void;
}) {
  const router = useRouter();
  const { notify } = useNotification();

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [confidence, setConfidence] = useState<Record<string, boolean>>({});
  const [violations, setViolations] = useState(0);
  const [startedAt] = useState(() => Date.now());

  const totalSeconds = useMemo(() => {
    return quiz.reduce((sum, q) => {
      const qTime = q.difficulty === "hard" ? 90 : 60;
      return sum + qTime;
    }, 0);
  }, [quiz]);

  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const timerRef = useRef<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          submitFinal();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      autosave();
    }, 10000);
    return () => clearInterval(iv);
  }, [answers, confidence, bookmarks]);

  useEffect(() => {
    if (!proctorMode) return;

    const recordViolation = (type: string) => {
      setViolations((current) => {
        const next = current + 1;
        notify(`Proctor violation detected: ${type} (${next}/3)`, "warning");
        if (next >= 3 && !isSubmitting) {
          submitFinal();
        }
        return next;
      });
    };

    const handleVisibility = () => {
      if (document.visibilityState !== "visible") recordViolation("Tab switch");
    };
    const handleBlur = () => recordViolation("Window blur");
    const handleContext = (e: Event) => {
      e.preventDefault();
      recordViolation("Right click blocked");
    };
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      recordViolation("Copy block");
    };
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      recordViolation("Paste block");
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("contextmenu", handleContext);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("contextmenu", handleContext);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
    };
  }, [proctorMode, isSubmitting]);

  const autosave = async () => {
    if (!sessionId) return;
    try {
      await fetch('/api/practice/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          answers,
          confidence,
          bookmarks: Object.keys(bookmarks).filter((k) => bookmarks[k]),
          timeTakenSeconds: Math.floor((Date.now() - startedAt) / 1000),
          finalize: false,
        }),
      });
    } catch {}
  };

  const setAnswerFor = (qId: string, value: any) => {
    setAnswers((s) => ({ ...s, [qId]: value }));
  };

  const submitFinal = async () => {
    if (!sessionId) {
      notify("Session ID missing", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/practice/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          answers,
          confidence,
          bookmarks: Object.keys(bookmarks).filter((k) => bookmarks[k]),
          timeTakenSeconds: Math.floor((Date.now() - startedAt) / 1000),
          finalize: true,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        notify(`MCQ Quiz complete! Score: ${data.scorePercent}% (${data.earnedMarks}/${data.totalMarks} Marks)`, "success");
        onExit();
        router.push(`/practice/results/${sessionId}`);
      } else {
        notify(data.error || 'Submission failed', "error");
      }
    } catch {
      notify('Submission error', "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const q = quiz[index];
  const options = q.options && q.options.length > 0 ? q.options : ["Option A", "Option B", "Option C", "Option D"];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition max-w-4xl mx-auto">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-slate-500">MCQ Question {index + 1} of {quiz.length}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#4F46E5]">MCQ</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{q.difficulty?.toUpperCase()} ({q.marks ?? 3} Marks)</span>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">Time left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {proctorMode && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
              <Eye size={14} /> Proctor Active ({violations}/3)
            </span>
          )}
          <button
            onClick={() => setBookmarks((b) => ({ ...b, [q.id]: !b[q.id] }))}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${bookmarks[q.id] ? 'bg-amber-100 text-amber-800 border-amber-300 font-semibold' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
          >
            <Bookmark size={14} /> {bookmarks[q.id] ? 'Bookmarked' : 'Bookmark'}
          </button>
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 mb-6">
        <div className="h-full rounded-full bg-[#4F46E5] transition-all duration-300" style={{ width: `${((index + 1) / quiz.length) * 100}%` }} />
      </div>

      {/* Question Header & Body */}
      <div className="my-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <div className="flex items-start justify-between gap-3">
          <p className="text-base font-black text-slate-900 whitespace-pre-wrap">{q.question}</p>
        </div>
        {q.topic ? <p className="mt-2 text-xs font-bold text-slate-500">Concept / Topic: {q.topic}</p> : null}
      </div>

      {/* MCQ Answer Options */}
      <div className="mb-6">
        <div className="grid gap-3">
          {options.map((opt: any, i: number) => (
            <label key={i} className={`flex items-center gap-3.5 p-4 rounded-2xl border cursor-pointer transition ${answers[q.id] === i ? 'bg-indigo-50/80 text-slate-900 border-[#4F46E5] ring-2 ring-indigo-200 font-bold shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}>
              <input type="radio" name={q.id} checked={answers[q.id] === i} onChange={() => setAnswerFor(q.id, i)} className="h-4 w-4 text-[#4F46E5] border-slate-300 rounded focus:ring-[#4F46E5]" />
              <div className="text-xs font-bold">{typeof opt === 'string' ? opt : JSON.stringify(opt)}</div>
            </label>
          ))}
        </div>
      </div>

      {/* Confidence Selection */}
      <div className="mb-6 flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
        <span className="text-xs font-black text-slate-700">Confidence Level:</span>
        <button
          type="button"
          onClick={() => setConfidence((c) => ({ ...c, [q.id]: true }))}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition ${confidence[q.id] === true ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-black' : 'bg-white text-slate-700 border-slate-200'}`}
        >
          <CheckCircle size={14} /> Confident
        </button>
        <button
          type="button"
          onClick={() => setConfidence((c) => ({ ...c, [q.id]: false }))}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition ${confidence[q.id] === false ? 'bg-orange-100 text-orange-800 border-orange-300 font-black' : 'bg-white text-slate-700 border-slate-200'}`}
        >
          <HelpCircle size={14} /> Not Confident
        </button>
      </div>

      {/* Pagination & Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
        <div className="flex gap-2">
          <button onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} className="px-5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 transition disabled:opacity-50 cursor-pointer">Previous</button>
          <button onClick={() => setIndex((i) => Math.min(quiz.length - 1, i + 1))} disabled={index === quiz.length - 1} className="px-5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 transition disabled:opacity-50 cursor-pointer">Next</button>
        </div>

        <div className="flex gap-2">
          <button onClick={submitFinal} disabled={isSubmitting} className="px-7 py-3 rounded-3xl bg-[#4F46E5] hover:bg-[#4338CA] text-xs font-black text-white shadow-md transition disabled:opacity-50 cursor-pointer">Submit MCQ Quiz</button>
          <button onClick={() => { notify('Quiz progress saved.', 'info'); onExit(); }} className="px-5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer">Exit</button>
        </div>
      </div>
    </div>
  );
}

export default function QuizGeneratorPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#F8FAFC] flex items-center justify-center text-xs font-mono font-bold text-slate-500">Loading MCQ Quiz Generator...</div>}>
      <QuizGeneratorContent />
    </Suspense>
  );
}
