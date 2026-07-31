"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sparkles, Code2, BookOpen, ChevronDown } from "lucide-react";

interface CourseSwitcherProps {
  currentLanguage?: string;
  currentChapter?: number;
  className?: string;
}

export function CourseSwitcher({
  currentLanguage,
  currentChapter,
  className = "",
}: CourseSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Detect current course from pathname if not explicitly passed
  const activeLang = currentLanguage || (pathname?.includes("/java") ? "java" : "python");

  const handleSelectCourse = (lang: string) => {
    if (lang === activeLang) return;

    if (lang === "java") {
      // Direct route to Java chapter 1 or curriculum
      if (pathname?.includes("/chapter/")) {
        router.push("/courses/java/chapter/1");
      } else {
        router.push("/courses/java");
      }
    } else {
      if (pathname?.includes("/chapter/")) {
        router.push("/courses/python/chapter/1");
      } else {
        router.push("/courses/python");
      }
    }
  };

  return (
    <div className={`inline-flex items-center p-1 rounded-2xl bg-slate-900/90 border border-slate-700/60 shadow-lg shadow-black/40 backdrop-blur-md ${className}`}>
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5 hidden sm:inline-flex items-center gap-1">
        <Sparkles size={11} className="text-cyan-400 animate-pulse" />
        Course Track
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => handleSelectCourse("python")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
            activeLang === "python"
              ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/25 scale-[1.02]"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Code2 size={13} className={activeLang === "python" ? "text-cyan-200" : "text-slate-500"} />
          <span>Python</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            activeLang === "python" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
          }`}>
            11 Ch.
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectCourse("java")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
            activeLang === "java"
              ? "bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 text-white shadow-md shadow-amber-500/25 scale-[1.02]"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <BookOpen size={13} className={activeLang === "java" ? "text-amber-200" : "text-slate-500"} />
          <span>Java</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            activeLang === "java" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
          }`}>
            15 Ch.
          </span>
        </button>
      </div>
    </div>
  );
}
