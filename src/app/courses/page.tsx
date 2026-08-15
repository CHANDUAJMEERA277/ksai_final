"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { LeftSidebar } from "@/components/dashboard/LeftSidebar";
import { RightAIPanel } from "@/components/dashboard/RightAIPanel";
import { BookOpen, ArrowRight, Compass, Sparkles, Star } from "lucide-react";

export default function MyCoursesPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [activeTab, setActiveTab] = useState("Courses");
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    if (!isPending) {
      if (session?.user) {
        const currentUser = {
          id: (session.user as any).id,
          name: session.user.name ?? "",
          email: session.user.email ?? "",
          role: (session.user as any).role ?? "Student",
        };
        setUser(currentUser);

        fetch(`/api/courses/my-courses?email=${currentUser.email}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.enrollments) {
              setEnrollments(data.enrollments);
            }
            setLoading(false);
          })
          .catch((err) => {
            console.error(err);
            setLoading(false);
          });
      } else {
        router.push("/auth");
      }
    }
  }, [session, isPending, router]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "Dashboard") {
      router.push("/dashboard");
    } else if (tab === "Leaderboard") {
      router.push("/leaderboard");
    } else if (tab === "AI Mentor") {
      router.push("/codexai");
    } else if (tab === "AI Quiz Generator") {
      router.push("/quiz-generator");
    }
  };

  const handleStartLearning = (course: any) => {
    const lang = course.language ? course.language.toLowerCase() : "";
    if (lang === "python" || course.title.toLowerCase().includes("python")) {
      router.push("/courses/python");
    } else if (lang === "java" || course.title.toLowerCase().includes("java")) {
      router.push("/courses/java");
    } else if (lang === "cpp" || lang === "c++" || course.title.toLowerCase().includes("c++")) {
      router.push("/courses/cpp");
    } else if (lang === "c" || course.title.toLowerCase().includes("c programming") || course.title.toLowerCase() === "c") {
      router.push("/courses/c");
    } else {
      router.push(`/courses/${lang || "python"}`);
    }
  };

  return (
    <div className="h-screen bg-[#F8FAFC] text-slate-800 flex overflow-hidden font-sans antialiased">
      {/* Left Sidebar */}
      <LeftSidebar 
        activeTab="Courses" 
        onTabChange={handleTabChange}
        userProfile={user || undefined}
        isLight={false}
        fullHeight={true}
      />

      {/* Center Main Workspace Content Area */}
      <main data-lenis-prevent className="flex-1 overflow-y-auto h-full p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full custom-scrollbar">
          {/* Welcome Header */}
          <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1 flex-shrink-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-semibold border border-blue-100">
              <Sparkles size={12} /> Learning Path &bull; My Space
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              My Enrolled Courses 🎓
            </h1>
            <p className="text-slate-500 text-xs font-medium">
              Your registered pathways. Click "Continue Learning" to resume your notes and chapter assessments.
            </p>
          </div>

          {loading ? (
            /* Loading Skeleton */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 py-3">
              {[1, 2].map((i) => (
                <div key={i} className="glass-panel p-4 rounded-2xl border border-slate-200 bg-white space-y-3 animate-pulse">
                  <div className="flex justify-between items-center">
                    <div className="h-3 bg-slate-200 rounded-full w-24" />
                    <div className="h-3 bg-slate-200 rounded-full w-10" />
                  </div>
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="space-y-1.5">
                    <div className="h-3 bg-slate-200 rounded w-full" />
                    <div className="h-3 bg-slate-200 rounded w-5/6" />
                  </div>
                  <div className="h-8 bg-slate-200 rounded-xl w-32 pt-2" />
                </div>
              ))}
            </div>
          ) : enrollments.length === 0 ? (
            /* Empty State */
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white text-center space-y-3 max-w-md mx-auto py-10 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 mx-auto">
                <Compass size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-950">You haven't enrolled in any courses yet</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                  Start your learning journey by browsing our high-quality paths!
                </p>
              </div>
              <button
                onClick={() => router.push("/courses/catalog")}
                className="px-4 py-2 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-95 transition-opacity inline-flex items-center gap-1 shadow-xs cursor-pointer"
              >
                Browse Available Courses <ArrowRight size={13} />
              </button>
            </div>
          ) : (
            /* Enrolled Courses Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {enrollments.map((item) => {
                const c = item.course;
                if (!c) return null;
                return (
                  <div
                    key={item.id}
                    className="glass-panel p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-500/50 hover:shadow-md transition-all space-y-2.5 shadow-xs flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 uppercase">
                          {c.category} &bull; Enrolled
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-amber-400 font-extrabold">
                          <Star size={12} className="fill-amber-400" />
                          <span>{c.rating}</span>
                        </div>
                      </div>

                      <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                        {c.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-snug font-medium">
                        {c.description}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[9px] text-slate-400 font-mono font-semibold">
                        Valid &bull; 90 Days Access
                      </span>

                      <button
                        onClick={() => handleStartLearning(c)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 hover:opacity-95 shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                      >
                        Continue Learning <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Right Copilot Panel */}
        <RightAIPanel />
    </div>
  );
}

