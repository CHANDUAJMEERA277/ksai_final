"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { renderMarkdown } from "@/lib/markdown";
import { CourseSwitcher } from "@/components/courses/CourseSwitcher";
import {
  AlertCircle,
  Clock,
  ArrowLeft,
  GraduationCap,
  Sparkles,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Lock,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

interface ChapterItem {
  id: string;
  title: string;
  orderNumber: number;
}

interface ProgressItem {
  chapterId: string;
  isCompleted: boolean;
  quizScore: number;
}

export default function JavaChapterReaderPage() {
  const params = useParams();
  const router = useRouter();


  const chapterParam = (params?.id as string) || "1";
  const currentOrderNum = parseInt(chapterParam.replace(/[^0-9]/g, ""), 10) || 1;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [courseTitle, setCourseTitle] = useState("Java Enterprise Masterclass");
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterContent, setChapterContent] = useState("");
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [progresses, setProgresses] = useState<ProgressItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchChapter = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/courses/java/chapters/${currentOrderNum}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setCourseTitle(data.courseTitle);
          setChapterTitle(data.currentChapter.title);
          setChapterContent(data.currentChapter.content);
          setChapters(data.chapters || []);
          setProgresses(data.progresses || []);
        } else {
          setError(data.error || "Failed to load chapter content.");
        }
      } catch (err) {
        console.error(err);
        setError("Network error fetching chapter data.");
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [currentOrderNum]);

  const prevChapter = chapters.find((c) => c.orderNumber === currentOrderNum - 1);
  const nextChapter = chapters.find((c) => c.orderNumber === currentOrderNum + 1);

  return (
    <div className="h-screen bg-[#09090B] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black overflow-hidden">
      {/* Top Navbar */}
      <header className="h-14 bg-[#09090B]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 flex items-center justify-between z-40 shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <Menu size={18} />
          </button>

          <button
            onClick={() => router.push("/courses/java")}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Java Overview</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />

          <div className="hidden md:flex items-center gap-2 text-xs">
            <span className="font-semibold text-amber-400">Java Track</span>
            <span className="text-slate-600">&bull;</span>
            <span className="font-bold text-slate-200 truncate max-w-xs">{chapterTitle}</span>
          </div>
        </div>

        {/* Course Switcher */}
        <CourseSwitcher currentLanguage="java" currentChapter={currentOrderNum} />
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Chapter Navigation Sidebar */}
        <aside
          className={`fixed lg:relative inset-y-0 left-0 z-30 w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-300 transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BookOpen size={14} className="text-amber-400" />
              Java Chapters (1-15)
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {chapters.map((ch) => {
              const isActive = ch.orderNumber === currentOrderNum;
              const prog = progresses.find((p) => p.chapterId === ch.id);
              const isCompleted = prog?.isCompleted;

              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    router.push(`/courses/java/chapter/${ch.orderNumber}`);
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-between gap-2 ${
                    isActive
                      ? "bg-gradient-to-r from-amber-500/20 to-orange-600/10 text-amber-300 border border-amber-500/40 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-[10px] shrink-0 ${
                        isActive
                          ? "bg-amber-500 text-slate-950"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {ch.orderNumber}
                    </span>
                    <span className="truncate">{ch.title.replace(/^Chapter \d+:\s*/, "")}</span>
                  </div>

                  {isCompleted && (
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Center Main Reader Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10 space-y-8 bg-[#09090B] custom-scrollbar">
          {loading ? (
            <div className="max-w-4xl mx-auto space-y-6 py-12 animate-pulse">
              <div className="h-10 bg-slate-800 rounded-xl w-3/4" />
              <div className="h-6 bg-slate-800/60 rounded-xl w-1/2" />
              <div className="h-64 bg-slate-900 rounded-3xl border border-slate-800" />
            </div>
          ) : error ? (
            <div className="max-w-xl mx-auto my-16 p-8 rounded-3xl bg-red-950/20 border border-red-500/30 text-center space-y-4">
              <AlertCircle size={40} className="text-red-400 mx-auto" />
              <h2 className="text-lg font-bold text-white">Error Loading Chapter</h2>
              <p className="text-sm text-red-300">{error}</p>
              <button
                onClick={() => router.push("/courses/java")}
                className="px-6 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition-all"
              >
                Return to Java Overview
              </button>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8 pb-16">
              {/* Chapter Header Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 shadow-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Java Chapter {currentOrderNum} of 15
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock size={13} /> ~30 Minutes Reading & Lab
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  {chapterTitle}
                </h1>
              </div>

              {/* Rendered Markdown Lesson Content */}
              <article className="prose prose-invert max-w-none space-y-6 text-slate-300 leading-relaxed text-sm sm:text-base">
                {renderMarkdown(chapterContent)}
              </article>

              {/* Bottom Pagination Controls */}
              <div className="pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
                {prevChapter ? (
                  <button
                    onClick={() => router.push(`/courses/java/chapter/${prevChapter.orderNumber}`)}
                    className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 flex items-center gap-2 transition-all"
                  >
                    <ChevronLeft size={16} />
                    <span>Ch. {prevChapter.orderNumber}: Previous Lesson</span>
                  </button>
                ) : <div />}

                <button
                  onClick={() => router.push(`/courses/java/chapter/${currentOrderNum}/quiz`)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
                >
                  <HelpCircle size={16} />
                  <span>Take Chapter Quiz</span>
                </button>

                {nextChapter ? (
                  <button
                    onClick={() => router.push(`/courses/java/chapter/${nextChapter.orderNumber}`)}
                    className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 flex items-center gap-2 transition-all"
                  >
                    <span>Ch. {nextChapter.orderNumber}: Next Lesson</span>
                    <ChevronRight size={16} />
                  </button>
                ) : <div />}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
