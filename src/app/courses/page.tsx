"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { TopNavbar } from "@/components/dashboard/TopNavbar";
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
    <div className="h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col selection:bg-cyan-500 selection:text-black overflow-hidden">
      {/* Top Navbar */}
      <TopNavbar
        userName={user?.name || "Loading..."}
        userRole={user?.role || "Student"}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex w-full overflow-hidden">
        {/* Left Sidebar Menu */}
        <LeftSidebar activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Center Main Workspace Content Area */}
        <main data-lenis-prevent className="flex-1 overflow-y-auto h-full p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full custom-scrollbar">
          {/* Welcome Header */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-2 bg-white shadow-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-100">
              <Sparkles size={13} /> Learning Path &bull; My Space
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              My Enrolled Courses 🎓
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm">
              Your registered pathways. Click "Continue Learning" to resume your notes and chapter assessments.
            </p>
          </div>

          {loading ? (
            /* Loading Skeleton */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
              {[1, 2].map((i) => (
                <div key={i} className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white space-y-4 animate-pulse">
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-slate-200 rounded-full w-24" />
                    <div className="h-4 bg-slate-200 rounded-full w-10" />
                  </div>
                  <div className="h-6 bg-slate-200 rounded w-3/4" />
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-full" />
                    <div className="h-3 bg-slate-200 rounded w-5/6" />
                  </div>
                  <div className="h-10 bg-slate-200 rounded-xl w-32 pt-4" />
                </div>
              ))}
            </div>
          ) : enrollments.length === 0 ? (
            /* Empty State */
            <div className="glass-panel p-10 rounded-3xl border border-slate-200 bg-white text-center space-y-5 max-w-xl mx-auto py-16 shadow-lg">
              <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 mx-auto">
                <Compass size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-950">You haven't enrolled in any courses yet</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                  Start your learning journey by browsing our high-quality paths in Python, Java, C++, and C!
                </p>
              </div>
              <button
                onClick={() => router.push("/dashboard")}
                className="px-6 py-3.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-95 transition-opacity inline-flex items-center gap-1.5 shadow-md shadow-blue-500/10"
              >
                Browse Available Courses <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            /* Enrolled Courses Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrollments.map((item) => {
                const c = item.course;
                if (!c) return null;
                return (
                  <div
                    key={item.id}
                    className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white hover:border-blue-500/50 hover:bg-slate-50/50 transition-all space-y-4 shadow-md flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                          {c.category} &bull; Enrolled
                        </span>
                        <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                          <Star size={13} className="fill-amber-400" />
                          <span>{c.rating}</span>
                        </div>
                      </div>

                      <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
                        {c.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {c.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">
                        Valid &bull; 90 Days Access
                      </span>

                      <button
                        onClick={() => handleStartLearning(c)}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 hover:opacity-95 shadow-md transition-all flex items-center gap-1.5"
                      >
                        Continue Learning <ArrowRight size={13} />
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
    </div>
  );
}

