"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import VisualNoteRenderer from "@/components/notes/VisualNoteRenderer";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Code2,
  Copy,
  Check,
  Filter,
  HelpCircle,
  Layers,
  Loader2,
  Search,
  Sparkles,
  Trash2,
  Zap,
  BookMarked,
} from "lucide-react";

type Note = {
  id: string;
  courseId: string;
  chapterId: string;
  topic: string;
  title: string;
  type: string;
  content: string;
  metadata?: string | null;
  importance: number;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;

  course?: {
    id: string;
    title: string;
    language: string;
  };

  chapter?: {
    id: string;
    title: string;
    orderNumber: number;
    explanation: string;
  };
};

type ChapterSection = {
  title: string;
  question?: string;
  answer?: string;
  importantPoints?: string[];
  examples?: Array<{ title: string; lang?: string; code?: string; content?: string }>;
  diagram?: any | null;
  content: string;
  bullets: string[];
  codeBlocks: Array<{ lang: string; code: string }>;
  teacherQuestions?: Array<{
    question: string;
    answer?: string;
    feedback?: string;
    result?: string;
  }>;
  studentQuestions?: Array<{
    question: string;
    answer: string;
  }>;
};

type ChapterData = {
  id: string;
  title: string;
  orderNumber: number;
  courseTitle: string;
  language: string;
  content: string;
  sections: ChapterSection[];
  revisionPoints?: string[];
};

type DayGroup = {
  date: string;
  formattedDate: string;
  courses: Array<{ id: string; title: string; language: string }>;
  chapters: ChapterData[];
  notes: Note[];
};

const SUPPORTED_COURSES = [
  {
    id: "python",
    title: "Python AI & Data Structures Architecture",
    language: "python",
    label: "Python",
  },
  {
    id: "java",
    title: "Java Enterprise & Object-Oriented Architecture",
    language: "java",
    label: "Java",
  },
  {
    id: "c",
    title: "C Programming Architecture",
    language: "c",
    label: "C",
  },
  {
    id: "cpp",
    title: "C++ Mastery Architecture",
    language: "cpp",
    label: "C++",
  },
];

function NotesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialCourseParam =
    searchParams.get("course") ||
    searchParams.get("language") ||
    searchParams.get("courseId") ||
    "";

  const [activeCourse, setActiveCourse] = useState<string>(() => {
    if (initialCourseParam) {
      const clean = initialCourseParam.toLowerCase().trim();
      return clean === "c++" ? "cpp" : clean;
    }
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("active_notes_course");
      if (saved) return saved;
    }
    return "python";
  });

  const [notes, setNotes] = useState<Note[]>([]);
  const [days, setDays] = useState<DayGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>("ALL");
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [explainingNoteId, setExplainingNoteId] = useState<string | null>(null);
  const [explainedNoteId, setExplainedNoteId] = useState<string | null>(null);
  const [explanation, setExplanation] = useState("");

  useEffect(() => {
    if (initialCourseParam) {
      const clean = initialCourseParam.toLowerCase().trim();
      const normalized = clean === "c++" ? "cpp" : clean;
      if (normalized !== activeCourse) {
        setActiveCourse(normalized);
        if (typeof window !== "undefined") {
          localStorage.setItem("active_notes_course", normalized);
        }
        loadNotes(normalized);
      }
    }
  }, [initialCourseParam]);

  async function loadNotes(courseToLoad = activeCourse) {
    try {
      setLoading(true);
      setError("");

      const timezoneOffset = new Date().getTimezoneOffset();
      const response = await fetch(
        `/api/notes?course=${encodeURIComponent(courseToLoad)}&timezoneOffset=${timezoneOffset}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to load notes.");
      }

      setNotes(data.notes || []);
      setDays(data.days || []);
    } catch (err) {
      console.error("Notes loading error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load your notes."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotes(activeCourse);
  }, [activeCourse]);

  const handleCourseChange = (newCourse: string) => {
    const clean = newCourse.toLowerCase().trim();
    const normalized = clean === "c++" ? "cpp" : clean;
    setActiveCourse(normalized);
    if (typeof window !== "undefined") {
      localStorage.setItem("active_notes_course", normalized);
    }
    router.replace(`/notes?course=${encodeURIComponent(normalized)}`);
  };

  const currentCourseObj =
    SUPPORTED_COURSES.find(
      (c) => c.language === activeCourse || c.id === activeCourse
    ) || {
      id: activeCourse,
      title: `${activeCourse.toUpperCase()} Architecture`,
      language: activeCourse,
      label: activeCourse.toUpperCase(),
    };

  const filteredDays: DayGroup[] = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const result: DayGroup[] = [];

    for (const dayGroup of days) {
      if (selectedDayFilter !== "ALL" && dayGroup.date !== selectedDayFilter) {
        continue;
      }

      const matchingChapters = (dayGroup.chapters || []).filter((ch) => {
        if (!query) return true;
        return (
          ch.title.toLowerCase().includes(query) ||
          ch.content.toLowerCase().includes(query) ||
          ch.sections.some(
            (s) =>
              s.title.toLowerCase().includes(query) ||
              (s.answer && s.answer.toLowerCase().includes(query)) ||
              (s.question && s.question.toLowerCase().includes(query))
          )
        );
      });

      const matchingNotes = (dayGroup.notes || []).filter((note) => {
        if (!query) return true;

        const textToSearch = `${note.title} ${note.topic} ${note.content} ${
          note.course?.title || ""
        } ${note.chapter?.title || ""}`.toLowerCase();

        return textToSearch.includes(query);
      });

      if (matchingNotes.length === 0 && matchingChapters.length === 0) {
        continue;
      }

      result.push({
        date: dayGroup.date,
        formattedDate: dayGroup.formattedDate,
        chapters: matchingChapters,
        notes: matchingNotes,
        courses: dayGroup.courses || [],
      });
    }

    return result;
  }, [days, searchQuery, selectedDayFilter]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const openInCourse = (chapterOrder: number, specificLang?: string) => {
    const langToUse = specificLang || activeCourse;
    const clean = langToUse.toLowerCase().trim();
    const targetSlug =
      clean === "c++" || clean === "cpp"
        ? "cpp"
        : clean === "c"
        ? "c"
        : clean === "java"
        ? "java"
        : "python";
    router.push(`/courses/${targetSlug}/chapter/${chapterOrder}`);
  };

  async function explainNote(note: Note) {
    try {
      setExplainingNoteId(note.id);
      setExplainedNoteId(null);
      setExplanation("");

      const response = await fetch("/api/notes/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: note.id }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to explain this note.");
      }

      setExplainedNoteId(note.id);
      setExplanation(data.explanation || "");
    } catch (err) {
      console.error("Explain note error:", err);
      alert(
        err instanceof Error ? err.message : "Failed to explain this note."
      );
    } finally {
      setExplainingNoteId(null);
    }
  }

  async function deleteNote(id: string) {
    const confirmed = window.confirm(
      "Delete this learning note? This cannot be undone."
    );
    if (!confirmed) return;

    try {
      setDeletingId(id);
      const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete note.");
      }
      setNotes((current) => current.filter((note) => note.id !== id));
      setDays((current) =>
        current
          .map((day) => ({
            ...day,
            notes: day.notes.filter((note) => note.id !== id),
          }))
          .filter((day) => day.notes.length > 0 || day.chapters.length > 0)
      );
    } catch (err) {
      console.error("Delete note error:", err);
      alert(err instanceof Error ? err.message : "Failed to delete note.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-24">
      <header className="h-[76px] bg-white border-b border-slate-200/90 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition shadow-xs text-slate-700"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white flex items-center justify-center shadow-md">
              <BookMarked size={20} />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] font-black text-blue-600">
                {currentCourseObj.label} Notes • KnowledgeStream AI
              </p>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-950">
                {currentCourseObj.label} Study Notebook
              </h1>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center w-[280px] lg:w-[320px] h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 gap-2 focus-within:border-blue-500 focus-within:bg-white transition shadow-xs">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search concepts, questions, code..."
            className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-black tracking-wide flex items-center gap-1.5 shadow-xs">
              <BookOpen size={14} />
              <span>{currentCourseObj.label} Completed Topics</span>
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {days.length} Learning {days.length === 1 ? "Day" : "Days"} Recorded
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
              <Filter size={13} className="text-slate-400" />
              <select
                value={activeCourse}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                {SUPPORTED_COURSES.map((c) => (
                  <option key={c.language} value={c.language}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {days.length > 1 && (
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
                <Calendar size={13} className="text-slate-400" />
                <select
                  value={selectedDayFilter}
                  onChange={(e) => setSelectedDayFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="ALL">All Dates</option>
                  {days.map((d) => (
                    <option key={d.date} value={d.date}>
                      {d.formattedDate}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="py-24 text-center">
              <Loader2 size={36} className="text-blue-600 animate-spin mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">
                Opening your {currentCourseObj.label} study notebook...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
              <p className="font-bold mb-2">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : filteredDays.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center max-w-lg mx-auto shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                <BookOpen size={28} />
              </div>
              <h3 className="text-base font-black text-slate-900 mb-1">
                No {currentCourseObj.label} study notebook entries found
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-5">
                Your study notebook automatically records key concepts, questions, answers,
                diagrams, and code examples as you complete {currentCourseObj.label} topics.
              </p>
              <button
                onClick={() =>
                  openInCourse(
                    activeCourse === "cpp" || activeCourse === "java" ? 1 : 0
                  )
                }
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm"
              >
                Start Learning {currentCourseObj.label} →
              </button>
            </div>
          ) : (
            <div className="space-y-14">
              {filteredDays.map((dayGroup) => (
                <section key={dayGroup.date} className="space-y-8">
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:px-7 rounded-3xl shadow-sm border border-slate-800">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-blue-600/40 border border-blue-400/40 text-blue-200 flex items-center justify-center shadow-xs">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-blue-300">
                          LEARNING DATE
                        </div>
                        <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                          {dayGroup.formattedDate}
                        </h2>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-white/10 border border-white/20 text-xs font-extrabold text-blue-200 backdrop-blur-sm">
                        {currentCourseObj.title}
                      </span>
                    </div>
                  </div>

                  {dayGroup.chapters && dayGroup.chapters.length > 0 ? (
                    <div className="space-y-10">
                      {dayGroup.chapters.map((chapter) => (
                        <div key={chapter.id} className="space-y-6">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-900 pb-3">
                            <div className="space-y-0.5">
                              <div className="text-[10px] font-black uppercase tracking-widest text-blue-700">
                                {currentCourseObj.label.toUpperCase()} • CHAPTER {chapter.orderNumber}
                              </div>
                              <h3 className="text-lg sm:text-xl font-black text-slate-950 uppercase tracking-tight">
                                {chapter.title}
                              </h3>
                            </div>

                            <button
                              type="button"
                              onClick={() => openInCourse(chapter.orderNumber)}
                              className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold hover:bg-blue-100 transition flex items-center gap-1"
                            >
                              <span>Open in Course</span>
                              <ChevronRight size={14} />
                            </button>
                          </div>

                          <div className="space-y-6">
                            {chapter.sections.map((section, sIdx) => {
                              const sectionCodeId = `${chapter.id}-${sIdx}`;
                              return (
                                <article
                                  key={sIdx}
                                  className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6 transition hover:border-slate-300"
                                >
                                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                    <h4 className="text-base sm:text-lg font-black text-slate-950 uppercase tracking-tight flex items-center gap-2.5">
                                      <span className="w-8 h-8 rounded-xl bg-slate-950 text-white flex items-center justify-center text-xs font-mono font-bold shadow-xs">
                                        {sIdx + 1}
                                      </span>
                                      <span>{section.title}</span>
                                    </h4>

                                    <div className="flex items-center gap-2">
                                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-mono font-black uppercase flex items-center gap-1">
                                        <CheckCircle2 size={11} className="text-emerald-600" />
                                        Completed
                                      </span>
                                    </div>
                                  </div>

                                  {section.question && (
                                    <div className="rounded-2xl bg-rose-50/80 border border-rose-200/90 p-4 space-y-1">
                                      <div className="text-[10px] font-black uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                                        <HelpCircle size={13} className="text-rose-600" />
                                        <span>Question</span>
                                      </div>
                                      <p className="text-xs sm:text-sm font-bold text-rose-900 leading-snug">
                                        {section.question}
                                      </p>
                                    </div>
                                  )}

                                  {section.answer && (
                                    <div className="rounded-2xl bg-blue-50/70 border border-blue-200/80 p-4 sm:p-5 space-y-1.5">
                                      <div className="text-[10px] font-black uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                                        <Sparkles size={13} className="text-blue-600" />
                                        <span>What I Learned (Core Concept)</span>
                                      </div>
                                      <div className="text-xs sm:text-sm font-medium text-blue-950 leading-relaxed whitespace-pre-wrap">
                                        {section.answer}
                                      </div>
                                    </div>
                                  )}

                                  {section.diagram && (
                                    <div className="space-y-2">
                                      <div className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-1.5">
                                        <Layers size={14} className="text-blue-600" />
                                        <span>HOW IT WORKS (FLOWCHART)</span>
                                      </div>
                                      <VisualNoteRenderer metadata={section.diagram} />
                                    </div>
                                  )}

                                  {section.importantPoints && section.importantPoints.length > 0 && (
                                    <div className="space-y-2.5">
                                      <div className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-1.5">
                                        <CheckCircle2 size={14} className="text-slate-800" />
                                        <span>IMPORTANT POINTS</span>
                                      </div>
                                      <div className="grid gap-2 sm:grid-cols-2">
                                        {section.importantPoints.map((pt, ptIdx) => (
                                          <div
                                            key={ptIdx}
                                            className="rounded-xl bg-blue-50/50 border border-blue-200/60 p-3 text-xs font-medium text-blue-950 flex items-start gap-2 shadow-2xs"
                                          >
                                            <span className="text-blue-600 font-bold shrink-0">•</span>
                                            <span>{pt}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* 6. TEACHER QUESTIONS (Checkpoints) */}
                                  {section.teacherQuestions && section.teacherQuestions.length > 0 && (
                                    <div className="space-y-3">
                                      <div className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-1.5">
                                        <HelpCircle size={14} className="text-indigo-600" />
                                        <span>TEACHER QUESTIONS & CHECKPOINTS</span>
                                      </div>
                                      <div className="space-y-2.5">
                                        {section.teacherQuestions.map((tq, tqIdx) => (
                                          <div
                                            key={tqIdx}
                                            className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 space-y-2"
                                          >
                                            <div className="text-xs font-bold text-indigo-950 flex items-start gap-2">
                                              <span className="px-1.5 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-black uppercase shrink-0">Teacher</span>
                                              <span>{tq.question}</span>
                                            </div>
                                            {tq.answer && (
                                              <div className="text-xs text-indigo-900/90 pl-6 border-l-2 border-indigo-300 ml-2">
                                                <span className="font-bold">Evaluation: </span>
                                                {tq.feedback || tq.answer}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* 7. STUDENT ASK AI QUESTIONS */}
                                  {section.studentQuestions && section.studentQuestions.length > 0 && (
                                    <div className="space-y-3">
                                      <div className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-1.5">
                                        <Sparkles size={14} className="text-emerald-600" />
                                        <span>MY QUESTIONS (ASK AI CHAT)</span>
                                      </div>
                                      <div className="space-y-2.5">
                                        {section.studentQuestions.map((sq, sqIdx) => (
                                          <div
                                            key={sqIdx}
                                            className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2"
                                          >
                                            <div className="text-xs font-bold text-emerald-950 flex items-start gap-2">
                                              <span className="px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black uppercase shrink-0">Me</span>
                                              <span>{sq.question}</span>
                                            </div>
                                            {sq.answer && (
                                              <div className="text-xs text-emerald-900/90 pl-6 border-l-2 border-emerald-300 ml-2 whitespace-pre-wrap">
                                                <span className="font-bold">AI Mentor: </span>
                                                {sq.answer}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {section.codeBlocks && section.codeBlocks.length > 0 && (
                                    <div className="space-y-3">
                                      <div className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-1.5">
                                        <Code2 size={14} className="text-slate-800" />
                                        <span>CODE & SYNTAX EXAMPLE</span>
                                      </div>
                                      {section.codeBlocks.map((block, cbIdx) => {
                                        const codeId = `${sectionCodeId}-${cbIdx}`;
                                        return (
                                          <div
                                            key={cbIdx}
                                            className="relative rounded-2xl bg-slate-950 text-cyan-300 p-4 font-mono text-xs overflow-x-auto shadow-inner border border-slate-800"
                                          >
                                            <button
                                              type="button"
                                              onClick={() =>
                                                copyToClipboard(block.code, codeId)
                                              }
                                              className="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
                                              title="Copy code"
                                            >
                                              {copiedCodeId === codeId ? (
                                                <Check
                                                  size={14}
                                                  className="text-emerald-400"
                                                />
                                              ) : (
                                                <Copy size={14} />
                                              )}
                                            </button>
                                            <div className="text-[10px] text-slate-400 font-sans mb-1 font-bold uppercase tracking-wider">
                                              {block.lang || activeCourse}
                                            </div>
                                            <code>{block.code}</code>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </article>
                              );
                            })}
                          </div>

                          {chapter.revisionPoints && chapter.revisionPoints.length > 0 && (
                            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 space-y-4 shadow-md border border-slate-800">
                              <div className="flex items-center gap-2">
                                <Zap size={18} className="text-amber-400" />
                                <h4 className="text-sm font-black uppercase tracking-widest text-amber-300">
                                  CHAPTER REVISION & HIGH-YIELD POINTS
                                </h4>
                              </div>
                              <div className="grid gap-2.5 sm:grid-cols-2">
                                {chapter.revisionPoints.map((rp, rpIdx) => (
                                  <div
                                    key={rpIdx}
                                    className="rounded-2xl bg-white/10 border border-white/15 p-3.5 text-xs font-medium text-blue-100 flex items-start gap-2.5 backdrop-blur-sm"
                                  >
                                    <span className="text-amber-400 font-bold shrink-0">✓</span>
                                    <span>{rp}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      {dayGroup.notes.map((note) => (
                        <article
                          key={note.id}
                          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold uppercase">
                                {note.course?.title || currentCourseObj.title}
                              </span>
                              <button
                                onClick={() => deleteNote(note.id)}
                                className="text-slate-400 hover:text-red-600 transition"
                                title="Delete note"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <h4 className="text-sm font-black text-slate-950 uppercase">
                              {note.title}
                            </h4>
                            <div className="text-xs text-slate-600 whitespace-pre-wrap line-clamp-4">
                              {note.content}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                            <span className="text-[10px] font-mono text-slate-400">
                              {new Date(note.createdAt).toLocaleDateString()}
                            </span>
                            <button
                              onClick={() => explainNote(note)}
                              disabled={explainingNoteId === note.id}
                              className="px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition flex items-center gap-1"
                            >
                              <Sparkles size={12} />
                              <span>
                                {explainingNoteId === note.id
                                  ? "Explaining..."
                                  : "Explain"}
                              </span>
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function NotesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <Loader2 size={36} className="text-blue-600 animate-spin" />
        </div>
      }
    >
      <NotesContent />
    </Suspense>
  );
}