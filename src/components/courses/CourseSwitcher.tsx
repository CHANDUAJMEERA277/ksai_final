"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sparkles, Code2, BookOpen, Terminal } from "lucide-react";

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
  const activeLang = (
    currentLanguage ||
    (pathname?.startsWith("/courses/cpp") || pathname?.includes("/cpp")
      ? "cpp"
      : pathname?.startsWith("/courses/java") || pathname?.includes("/java")
      ? "java"
      : pathname?.startsWith("/courses/c/") || pathname === "/courses/c" || pathname?.includes("/courses/c")
      ? "c"
      : "python")
  ).toLowerCase();

  const handleSelectCourse = (lang: string) => {
    if (lang === activeLang) return;
    const isChapter = pathname?.includes("/chapter/");

    if (lang === "cpp") {
      router.push(isChapter ? "/courses/cpp/chapter/1" : "/courses/cpp");
    } else if (lang === "java") {
      router.push(isChapter ? "/courses/java/chapter/1" : "/courses/java");
    } else if (lang === "c") {
      router.push(isChapter ? "/courses/c/chapter/0" : "/courses/c");
    } else {
      router.push(isChapter ? "/courses/python/chapter/0" : "/courses/python");
    }
  };

  const tracks = [
    {
      id: "python",
      name: "Python",
      chapters: "11 Ch.",
      icon: Code2,
      activeBg: "bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30 ring-2 ring-cyan-400/50 scale-[1.03]",
      iconActive: "text-cyan-200",
      iconInactive: "text-cyan-400",
      badgeActive: "bg-white/25 text-white shadow-inner",
      badgeInactive: "bg-slate-950 text-cyan-300 border border-slate-700/80",
    },
    {
      id: "java",
      name: "Java",
      chapters: "15 Ch.",
      icon: BookOpen,
      activeBg: "bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 text-white shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/50 scale-[1.03]",
      iconActive: "text-amber-200",
      iconInactive: "text-amber-400",
      badgeActive: "bg-white/25 text-white shadow-inner",
      badgeInactive: "bg-slate-950 text-amber-300 border border-slate-700/80",
    },
    {
      id: "cpp",
      name: "C++",
      chapters: "15 Ch.",
      icon: Sparkles,
      activeBg: "bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-400/50 scale-[1.03]",
      iconActive: "text-indigo-200",
      iconInactive: "text-indigo-400",
      badgeActive: "bg-white/25 text-white shadow-inner",
      badgeInactive: "bg-slate-950 text-indigo-300 border border-slate-700/80",
    },
    {
      id: "c",
      name: "C",
      chapters: "11 Ch.",
      icon: Terminal,
      activeBg: "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/50 scale-[1.03]",
      iconActive: "text-emerald-200",
      iconInactive: "text-emerald-400",
      badgeActive: "bg-white/25 text-white shadow-inner",
      badgeInactive: "bg-slate-950 text-emerald-300 border border-slate-700/80",
    },
  ];

  return (
    <div className={`inline-flex items-center p-1.5 rounded-2xl bg-slate-900 border-2 border-slate-700 shadow-xl backdrop-blur-md ${className}`}>
      <span className="text-[10px] font-mono font-black uppercase tracking-wider text-cyan-400 px-3 hidden sm:inline-flex items-center gap-1.5 border-r border-slate-700/80 mr-1 py-1">
        <Sparkles size={12} className="text-cyan-400 animate-pulse" />
        Course Track
      </span>

      <div className="flex items-center gap-1.5 overflow-x-auto">
        {tracks.map((track) => {
          const Icon = track.icon;
          const isActive = activeLang === track.id;

          return (
            <button
              key={track.id}
              type="button"
              onClick={() => handleSelectCourse(track.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer shrink-0 ${
                isActive
                  ? track.activeBg
                  : "text-slate-100 hover:text-white bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80"
              }`}
            >
              <Icon size={14} className={isActive ? track.iconActive : track.iconInactive} />
              <span className="font-extrabold tracking-tight">{track.name}</span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  isActive ? track.badgeActive : track.badgeInactive
                }`}
              >
                {track.chapters}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
