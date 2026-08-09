"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { CourseSwitcher } from "@/components/courses/CourseSwitcher";
import {
  Clock,
  Award,
  BookOpen,
  ArrowRight,
  Sparkles,
  BarChart3,
  Compass,
  ArrowLeft,
  CheckCircle2,
  Lock,
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

export default function JavaOverviewPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [courseTitle, setCourseTitle] = useState("Java Enterprise & Object-Oriented Architecture");
  const [courseId, setCourseId] = useState("");
  const [coursePrice, setCoursePrice] = useState(1999);
  const [isEnrolled, setIsEnrolled] = useState(true);
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [progresses, setProgresses] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && session?.user) {
      setUser({
        name: session.user.name ?? "Student",
        email: session.user.email ?? "",
        role: (session.user as any).role ?? "Student",
      });
    }
  }, [session, isPending]);

  useEffect(() => {
    const fetchOverviewData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/courses/java/chapters/1");
        const data = await res.json();

        if (res.ok && data.success) {
          setCourseTitle(data.courseTitle);
          setCourseId(data.courseId);
          setCoursePrice(data.coursePrice);
          setIsEnrolled(data.isEnrolled);
          setChapters(data.chapters);
          setProgresses(data.progresses);

          if (!data.isEnrolled) {
            router.push("/courses/catalog?enroll=java");
            return;
          }
        } else {
          setError(data.error || "Failed to load course details.");
        }
      } catch (err) {
        console.error(err);
        setError("Network error loading Java overview data.");
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  const completedChaptersCount = progresses.filter((p) => p.isCompleted).length;
  const totalChaptersCount = chapters.length || 15;
  const progressPercentage = Math.round((completedChaptersCount / totalChaptersCount) * 100);

  const handleContinueLearning = () => {
    const nextChapter = chapters.find((c) => {
      const p = progresses.find((prog) => prog.chapterId === c.id);
      return !p || !p.isCompleted;
    });

    if (nextChapter) {
      router.push(`/courses/java/chapter/${nextChapter.orderNumber}`);
    } else {
      router.push(`/courses/java/chapter/1`);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Sticky Top Header with Navigation & Course Switcher */}
      <header className="sticky top-0 z-50 bg-[#09090B]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all flex items-center gap-2 text-xs font-semibold"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
            Java Enterprise Masterclass
          </h1>
        </div>

        {/* Reusable Course Switcher */}
        <CourseSwitcher currentLanguage="java" />
      </header>

      {/* Main Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* Banner Section */}
        <div className="relative rounded-3xl overflow-hidden border border-amber-500/20 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 p-6 sm:p-10 shadow-2xl">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-6 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
              <Sparkles size={13} /> 15 Complete Modules &bull; Core Java & Enterprise Architecture
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              {courseTitle}
            </h1>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Master Java from zero to enterprise software architect: JVM Internals, Object-Oriented Design, Polymorphism, Collections Framework, Multithreading, Concurrent Data Structures, and Streams API.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Chapters</span>
                <span className="text-lg font-black text-amber-400 font-mono">15 Chapters</span>
              </div>
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Access Duration</span>
                <span className="text-lg font-black text-white font-mono">90 Days</span>
              </div>
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Completed</span>
                <span className="text-lg font-black text-emerald-400 font-mono">{completedChaptersCount} / {totalChaptersCount}</span>
              </div>
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Overall Progress</span>
                <span className="text-lg font-black text-cyan-400 font-mono">{progressPercentage}%</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={handleContinueLearning}
                className="px-8 py-4 rounded-2xl font-black text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:brightness-110 transition-all shadow-xl shadow-amber-500/20 flex items-center gap-2.5 scale-100 hover:scale-[1.02] active:scale-[0.98]"
              >
                <BookOpen size={18} />
                <span>{completedChaptersCount > 0 ? "Resume Learning" : "Start Java Course"}</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => router.push("/courses/java/curriculum")}
                className="px-6 py-4 rounded-2xl font-bold text-sm text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all flex items-center gap-2"
              >
                <Compass size={18} />
                <span>View Full Curriculum (15 Chapters)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Chapters Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <BookOpen size={20} className="text-amber-400" />
              Java Course Syllabus
            </h2>
            <span className="text-xs font-semibold text-slate-500">15 Interactive Markdown Lessons</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chapters.map((ch) => {
              const prog = progresses.find((p) => p.chapterId === ch.id);
              const isCompleted = prog?.isCompleted;

              return (
                <div
                  key={ch.id}
                  onClick={() => router.push(`/courses/java/chapter/${ch.orderNumber}`)}
                  className="group relative p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-900 transition-all cursor-pointer shadow-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                      CH {ch.orderNumber}
                    </span>
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                        <CheckCircle2 size={14} /> Complete
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-500 group-hover:text-slate-300 transition-colors flex items-center gap-1">
                        Read Lesson <ArrowRight size={12} />
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                    {ch.title}
                  </h3>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
