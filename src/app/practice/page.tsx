"use client";

import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { motion } from "framer-motion";
import { Search, Play, ShieldCheck, Eye, Bookmark, Sparkles, RefreshCw, Code, CheckCircle, HelpCircle, CalendarDays, BookOpen, Layers } from "lucide-react";
import { useNotification } from "@/components/ui/NotificationContext";
import { PracticeHistoryPanel } from "@/components/practice/PracticeHistoryPanel";

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
  starterCode?: string;
  testCases?: any[];
  expectedOutput?: string;
};

function PracticeContent() {
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
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [builderConfig, setBuilderConfig] = useState({ difficulty: "mixed", count: 10, types: ["mcq", "coding", "conceptual"] });
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
      const t: string[] = [];
      (selectedCourse.chapters || []).forEach((ch: any) => {
        if (ch.title) t.push(ch.title.replace(/Chapter \d+:?\s*/i, ""));
      });
      setTopics(Array.from(new Set(t)));
      setSelectedChapters([]);
      setSelectedTopics([]);
    } else {
      setChapters([]);
      setTopics([]);
      setSelectedChapters([]);
      setSelectedTopics([]);
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
    return courses.filter((c) => purchasedIds.includes(c.id));
  }, [courses, enrollments]);

  const toggleChapter = (chapterId: string) => {
    setSelectedChapters((prev) => (prev.includes(chapterId) ? prev.filter((id) => id !== chapterId) : [...prev, chapterId]));
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) => (prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]));
  };

  const generateQuiz = async (overrideRetryMode = false) => {
    if (!selectedCourse) {
      notify("Please select a course before starting a quiz.", "warning");
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
          topics: selectedTopics.length ? selectedTopics : topics.filter((t) => t.toLowerCase().includes(searchTerm.toLowerCase())),
          config: builderConfig,
          proctored: proctorMode,
          retryMode: overrideRetryMode || retryModeActive ? "wrong" : "standard",
        }),
      });

      const data = await res.json();
      if (res.ok && data.quiz) {
        setQuiz(data.quiz || []);
        setSessionId(data.sessionId || null);
        notify(
          overrideRetryMode || retryModeActive
            ? "Retry quiz generated targeting your weak topics!"
            : "Adaptive practice quiz generated successfully.",
          "success"
        );
      } else {
        notify(data.error || "Failed to generate AI quiz.", "error");
      }
    } catch (err) {
      console.error(err);
      notify("Could not generate quiz. Please try again.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Adaptive AI Engine</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">AI Practice Lab</h1>
            <p className="mt-2 text-sm text-slate-500 max-w-2xl">Course-aware, non-repetitive, AI-driven practice assessments with real-time feedback and DSA coding challenges.</p>
          </div>
          <div>
            <button onClick={() => router.push('/dashboard')} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm hover:shadow-md transition">Back to Dashboard</button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex rounded-2xl bg-white p-1.5 border border-slate-200 shadow-sm max-w-md">
          <button
            onClick={() => setActiveTab("builder")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition ${activeTab === "builder" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
          >
            <Layers size={16} /> Quiz Generator
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition ${activeTab === "history" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
          >
            <CalendarDays size={16} /> Practice History ({history.length})
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
            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
              <div className="space-y-6">
                {!quiz ? (
                  <div className="space-y-6">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
                      <h3 className="text-lg font-semibold text-slate-900">Select Course</h3>
                      <p className="text-sm text-slate-500">Choose a course to source intelligent AI questions from.</p>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {myPurchasedCourses.length === 0 && (
                          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 col-span-2">No purchased courses yet. Please enroll in a course to start practicing.</div>
                        )}

                        {myPurchasedCourses.map((course) => (
                          <button key={course.id} onClick={() => setSelectedCourse(course)} className={`p-4 rounded-2xl border ${selectedCourse?.id === course.id ? 'bg-blue-50 text-slate-900 border-blue-400 ring-2 ring-blue-100' : 'bg-slate-50 text-slate-700 border-slate-200'} text-left transition hover:shadow-sm`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-semibold">{course.title}</div>
                                <div className="text-xs text-slate-500 mt-1">{(course.chapters || []).length} chapters • {course.level || 'Level'}</div>
                              </div>
                              <div className="text-xs font-semibold text-blue-600">Select</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedCourse && (
                      <>
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
                          <h3 className="text-lg font-semibold text-slate-900">Chapters</h3>
                          <p className="text-sm text-slate-500">Select specific chapters or include all.</p>

                          <div className="mt-4 space-y-2">
                            <div className="flex gap-2">
                              <button type="button" onClick={() => setSelectedChapters(chapters.map((c) => c.id))} className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 hover:shadow-sm transition">Select All</button>
                              <button type="button" onClick={() => setSelectedChapters([])} className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 hover:shadow-sm transition">Clear</button>
                            </div>

                            <div className="mt-3 grid gap-2 max-h-56 overflow-y-auto custom-scrollbar">
                              {chapters.map((ch: any) => (
                                <label key={ch.id} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer">
                                  <input type="checkbox" checked={selectedChapters.includes(ch.id)} onChange={() => toggleChapter(ch.id)} className="h-4 w-4 text-blue-600 border-slate-300 rounded" />
                                  <div className="flex-1 text-left">
                                    <div className="text-sm font-semibold text-slate-900">{ch.title}</div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
                          <h3 className="text-lg font-semibold text-slate-900">Topics & Filter</h3>
                          <p className="text-sm text-slate-500">Filter topics or rely on dynamic randomization.</p>

                          <div className="mt-4">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search topics" className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm" />
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                              {topics.filter((t) => t.toLowerCase().includes(searchTerm.toLowerCase())).map((t) => (
                                <button key={t} onClick={() => toggleTopic(t)} className={`px-3 py-1.5 rounded-xl border text-xs ${selectedTopics.includes(t) ? 'bg-blue-50 text-blue-800 border-blue-300 font-semibold' : 'bg-slate-50 text-slate-700 border-slate-200'} transition hover:shadow-sm`}>{t}</button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
                          <h3 className="text-lg font-semibold text-slate-900">Quiz Settings</h3>
                          <p className="text-sm text-slate-500">Customize question count, difficulty, and practice mode.</p>

                          <div className="mt-4 grid grid-cols-2 gap-4">
                            <label className="text-sm font-medium text-slate-700">
                              Difficulty
                              <select value={builderConfig.difficulty} onChange={(e) => setBuilderConfig((s) => ({ ...s, difficulty: e.target.value }))} className="mt-1 w-full rounded-xl bg-slate-50 p-2.5 text-sm border border-slate-200 text-slate-900">
                                <option value="mixed">Mixed (Easy, Medium, Hard)</option>
                                <option value="easy">Easy (2 Marks)</option>
                                <option value="medium">Medium (3 Marks)</option>
                                <option value="hard">Hard (5 Marks)</option>
                              </select>
                            </label>

                            <label className="text-sm font-medium text-slate-700">
                              Question Count
                              <input type="number" value={builderConfig.count} min={1} max={50} onChange={(e) => setBuilderConfig((s) => ({ ...s, count: Number(e.target.value) }))} className="mt-1 w-full rounded-xl bg-slate-50 p-2.5 text-sm border border-slate-200 text-slate-900" />
                            </label>

                            <label className="text-sm font-medium text-slate-700 col-span-2">
                              Question Types
                              <div className="mt-2 flex gap-3 flex-wrap">
                                <label className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm cursor-pointer ${builderConfig.types.includes('mcq') ? 'bg-blue-50 text-blue-900 border-blue-300 font-semibold' : 'bg-white text-slate-700 border-slate-200'}`}>
                                  <input type="checkbox" checked={builderConfig.types.includes('mcq')} onChange={() => setBuilderConfig((s) => ({ ...s, types: s.types.includes('mcq') ? s.types.filter(t=>t!=='mcq') : [...s.types,'mcq'] }))} /> <span>MCQ</span>
                                </label>
                                <label className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm cursor-pointer ${builderConfig.types.includes('coding') ? 'bg-blue-50 text-blue-900 border-blue-300 font-semibold' : 'bg-white text-slate-700 border-slate-200'}`}>
                                  <input type="checkbox" checked={builderConfig.types.includes('coding')} onChange={() => setBuilderConfig((s) => ({ ...s, types: s.types.includes('coding') ? s.types.filter(t=>t!=='coding') : [...s.types,'coding'] }))} /> <span>DSA Coding (5 Marks)</span>
                                </label>
                                <label className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm cursor-pointer ${builderConfig.types.includes('conceptual') ? 'bg-blue-50 text-blue-900 border-blue-300 font-semibold' : 'bg-white text-slate-700 border-slate-200'}`}>
                                  <input type="checkbox" checked={builderConfig.types.includes('conceptual')} onChange={() => setBuilderConfig((s) => ({ ...s, types: s.types.includes('conceptual') ? s.types.filter(t=>t!=='conceptual') : [...s.types,'conceptual'] }))} /> <span>Conceptual</span>
                                </label>
                              </div>
                            </label>

                            <label className="text-sm col-span-2 flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                              <input type="checkbox" checked={proctorMode} onChange={(e) => setProctorMode(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                              <div>
                                <div className="font-semibold text-slate-900 flex items-center gap-2"><ShieldCheck size={16} className="text-blue-600" /> Proctor Exam Mode</div>
                                <p className="text-xs text-slate-500">Enforces strict supervision required for certificate qualification: tab switch detection, blur tracking, copy/paste block.</p>
                              </div>
                            </label>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex flex-wrap items-center gap-3">
                      <button onClick={() => generateQuiz(false)} disabled={isGenerating || !selectedCourse} className="inline-flex items-center gap-2 rounded-3xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50">
                        <Play size={16} />
                        {isGenerating ? 'Generating Quiz...' : 'Generate Practice Quiz'}
                      </button>

                      <button onClick={() => generateQuiz(true)} disabled={isGenerating || !selectedCourse} className="inline-flex items-center gap-2 rounded-3xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 transition disabled:opacity-50">
                        <RefreshCw size={16} />
                        Retry Weak Topics
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

              <aside className="space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center gap-3 text-slate-800">
                    <Sparkles size={18} className="text-blue-600" />
                    <div>
                      <p className="text-sm font-semibold">Evaluation Rules</p>
                      <p className="text-xs text-slate-500">Real-time adaptive engine</p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2 text-xs text-slate-600">
                    <li>• <strong>Zero Repetition</strong>: Normalized text deduplication across all attempts.</li>
                    <li>• <strong>Real Marks</strong>: Easy=2, Medium=3, Hard=5, Coding=5 Marks.</li>
                    <li>• <strong>Accuracy & Score</strong>: Computed strictly from attempted questions (0 attempted = 0% score).</li>
                    <li>• <strong>Certificate Qualified</strong>: Required Score ≥ 75%, Proctor Mode ON, and all questions attempted.</li>
                  </ul>
                </div>
              </aside>
            </div>
          )}
        </motion.div>
      </div>
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
      const qTime = q.type === "coding" ? 180 : q.difficulty === "hard" ? 90 : 60;
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
        notify(`Quiz complete! Score: ${data.scorePercent}% (${data.earnedMarks}/${data.totalMarks} Marks)`, "success");
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
  const isCoding = q.type === "coding";

  useEffect(() => {
    if (isCoding && q.starterCode && answers[q.id] === undefined) {
      setAnswerFor(q.id, q.starterCode);
    }
  }, [index, q]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Question {index + 1} of {quiz.length}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{q.type?.toUpperCase()}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{q.difficulty?.toUpperCase()} ({q.marks ?? (isCoding ? 5 : 3)} Marks)</span>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">Time left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {proctorMode && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
              <Eye size={14} /> Proctor Active ({violations}/3)
            </span>
          )}
          <button
            onClick={() => setBookmarks((b) => ({ ...b, [q.id]: !b[q.id] }))}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs transition ${bookmarks[q.id] ? 'bg-amber-100 text-amber-800 border-amber-300 font-semibold' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
          >
            <Bookmark size={14} /> {bookmarks[q.id] ? 'Bookmarked' : 'Bookmark'}
          </button>
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 mb-6">
        <div className="h-full rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${((index + 1) / quiz.length) * 100}%` }} />
      </div>

      {/* Question Header & Body */}
      <div className="my-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-lg font-semibold text-slate-900 whitespace-pre-wrap">{q.question}</p>
        </div>
        {q.topic ? <p className="mt-2 text-xs font-medium text-slate-500">Topic: {q.topic}</p> : null}
      </div>

      {/* Answer Area */}
      <div className="mb-6">
        {q.type === 'mcq' && Array.isArray(q.options) && q.options.length > 0 ? (
          <div className="grid gap-2.5">
            {q.options.map((opt: any, i: number) => (
              <label key={i} className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition ${answers[q.id] === i ? 'bg-blue-50 text-blue-950 border-blue-300 ring-2 ring-blue-100 font-medium' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}>
                <input type="radio" name={q.id} checked={answers[q.id] === i} onChange={() => setAnswerFor(q.id, i)} className="h-4 w-4 text-blue-600 border-slate-300 rounded" />
                <div className="text-sm">{typeof opt === 'string' ? opt : JSON.stringify(opt)}</div>
              </label>
            ))}
          </div>
        ) : isCoding ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold flex items-center gap-1.5"><Code size={14} /> Solution Code Editor</span>
              <span>Supported language: JS/TS/Python</span>
            </div>
            <textarea
              value={answers[q.id] || ''}
              onChange={(e) => setAnswerFor(q.id, e.target.value)}
              placeholder="// Write your code solution here..."
              className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-sm h-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {q.testCases && Array.isArray(q.testCases) && q.testCases.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-100 text-xs space-y-1 text-slate-700">
                <p className="font-semibold text-slate-900">Sample Test Cases:</p>
                {q.testCases.map((tc: any, tIdx: number) => (
                  <div key={tIdx} className="font-mono text-slate-600">• {typeof tc === 'string' ? tc : JSON.stringify(tc)}</div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <textarea
            value={answers[q.id] || ''}
            onChange={(e) => setAnswerFor(q.id, e.target.value)}
            placeholder="Type your detailed explanation or answer..."
            className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
      </div>

      {/* Confidence Selection */}
      <div className="mb-6 flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
        <span className="text-xs font-semibold text-slate-700">Confidence Level:</span>
        <button
          type="button"
          onClick={() => setConfidence((c) => ({ ...c, [q.id]: true }))}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${confidence[q.id] === true ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-white text-slate-700 border-slate-200'}`}
        >
          <CheckCircle size={14} /> Confident
        </button>
        <button
          type="button"
          onClick={() => setConfidence((c) => ({ ...c, [q.id]: false }))}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${confidence[q.id] === false ? 'bg-orange-100 text-orange-800 border-orange-300' : 'bg-white text-slate-700 border-slate-200'}`}
        >
          <HelpCircle size={14} /> Not Confident
        </button>
      </div>

      {/* Pagination & Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} className="px-4 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-700 hover:bg-slate-100 transition disabled:opacity-50">Previous</button>
          <button onClick={() => setIndex((i) => Math.min(quiz.length - 1, i + 1))} disabled={index === quiz.length - 1} className="px-4 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-700 hover:bg-slate-100 transition disabled:opacity-50">Next</button>
        </div>

        <div className="flex gap-2">
          <button onClick={submitFinal} disabled={isSubmitting} className="px-6 py-2.5 rounded-3xl bg-blue-600 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50">Submit Quiz</button>
          <button onClick={() => { notify('Quiz progress saved.', 'info'); onExit(); }} className="px-4 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-700 hover:bg-slate-100 transition">Exit</button>
        </div>
      </div>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#F8FAFC] flex items-center justify-center text-xs font-mono font-bold text-slate-500">Loading Practice Workspace...</div>}>
      <PracticeContent />
    </Suspense>
  );
}
