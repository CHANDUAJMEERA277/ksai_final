"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { TopNavbar } from "@/components/dashboard/TopNavbar";
import { LeftSidebar } from "@/components/dashboard/LeftSidebar";
import { RightAIPanel } from "@/components/dashboard/RightAIPanel";
import {
  Trophy,
  Award,
  Medal,
  Flame,
  Clock,
  Sparkles,
  Search,
  BookOpen,
  Users,
  Compass,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Zap,
} from "lucide-react";

interface LeaderboardUserEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string | null;
  xp: number;
  streak: number;
  challengesSolved: number;
  completionPct: number;
  college?: string | null;
}

interface LeaderboardResponse {
  success: boolean;
  scope: "global" | "course" | "college";
  window: "weekly" | "monthly" | "alltime";
  courseId?: string | null;
  college?: string | null;
  isSnapshot: boolean;
  period: {
    start: string | null;
    end: string | null;
  };
  top10: LeaderboardUserEntry[];
  currentUser: LeaderboardUserEntry | null;
  totalParticipants: number;
}

interface CourseItem {
  id: string;
  title: string;
  language: string;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [activeTab, setActiveTab] = useState("Leaderboard");
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    college?: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<"global" | "course" | "college">("global");
  const [window, setWindow] = useState<"weekly" | "monthly" | "alltime">("weekly");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedCollege, setSelectedCollege] = useState<string>("");

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [collegesList, setCollegesList] = useState<string[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResponse | null>(null);
  const [resetCountdown, setResetCountdown] = useState<string>("");

  // Auth Protection: Mirroring better-auth pattern
  useEffect(() => {
    if (!isPending) {
      if (session?.user) {
        const currentUser = {
          id: (session.user as any).id,
          name: session.user.name ?? "",
          email: session.user.email ?? "",
          role: (session.user as any).role ?? "Student",
          college: (session.user as any).college ?? "",
        };
        setUser(currentUser);
        if (currentUser.college && !selectedCollege) {
          setSelectedCollege(currentUser.college);
        }
      } else {
        router.push("/auth");
      }
    }
  }, [session, isPending, router]);

  // Fetch available courses for scope="course" dropdown
  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.json())
      .then((data) => {
        if (data.courses) {
          setCourses(data.courses);
          if (data.courses.length > 0 && !selectedCourseId) {
            setSelectedCourseId(data.courses[0].id);
          }
        }
      })
      .catch(console.error);

    // Fetch distinct colleges from DB endpoint /api/colleges
    fetch("/api/colleges")
      .then((res) => res.json())
      .then((data) => {
        if (data.colleges && Array.isArray(data.colleges)) {
          setCollegesList(data.colleges);
        }
      })
      .catch(console.error);
  }, []);

  // Calculate live countdown to week reset (Monday 00:00:00 UTC)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const day = now.getUTCDay();
      const daysUntilMonday = day === 0 ? 1 : 8 - day;

      const nextMonday = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() + daysUntilMonday,
          0,
          0,
          0,
          0
        )
      );

      const diffMs = nextMonday.getTime() - now.getTime();
      if (diffMs <= 0) {
        setResetCountdown("Resets soon");
        return;
      }

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diffMs / (1000 * 60)) % 60);

      setResetCountdown(`${days}d ${hours}h ${mins}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Leaderboard Data on filter change
  useEffect(() => {
    if (isPending || !session?.user) return;

    if (scope === "course" && !selectedCourseId) return;
    if (scope === "college" && !selectedCollege && (!user || !user.college)) return;

    setLoading(true);
    let url = `/api/leaderboard?scope=${scope}&window=${window}`;
    if (scope === "course" && selectedCourseId) {
      url += `&courseId=${selectedCourseId}`;
    }
    if (scope === "college") {
      const col = selectedCollege || user?.college;
      if (col) {
        url += `&college=${encodeURIComponent(col)}`;
      }
    }

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        return res.json();
      })
      .then((data) => {
        setLeaderboardData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching leaderboard:", err);
        setLoading(false);
      });
  }, [scope, window, selectedCourseId, selectedCollege, isPending, session, user]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "Dashboard") {
      router.push("/dashboard");
    } else if (tab === "Courses") {
      router.push("/courses");
    } else if (tab === "Leaderboard") {
      router.push("/leaderboard");
    } else if (tab === "AI Mentor") {
      router.push("/codexai");
    } else if (tab === "AI Quiz Generator") {
      router.push("/quiz-generator");
    } else {
      router.push("/dashboard");
    }
  };

  const top10 = leaderboardData?.top10 || [];
  const rank1 = top10[0] || null;
  const rank2 = top10[1] || null;
  const rank3 = top10[2] || null;
  const positions4to10 = top10.slice(3);
  const currentUserEntry = leaderboardData?.currentUser || null;

  // Helper to generate initials for avatar placeholder
  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  // Helper to calculate XP needed to reach next rank
  const getXpToNextRank = () => {
    if (!currentUserEntry || !top10 || top10.length === 0) return null;
    if (currentUserEntry.rank === 1) return "🎉 You are in 1st Place!";

    const nextRankUser = top10.find((u) => u.rank === currentUserEntry.rank - 1);
    if (nextRankUser) {
      const diff = nextRankUser.xp - currentUserEntry.xp + 1;
      return `${diff} XP needed to reach Rank #${nextRankUser.rank}`;
    }
    return null;
  };

  return (
    <div className="h-screen bg-[#F8FAFC] text-[#0F172A] flex overflow-hidden font-sans antialiased">
      {/* Left Sidebar */}
      <LeftSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        userProfile={user || undefined}
        isLight={false}
        fullHeight={true}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto w-full custom-scrollbar">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200/60 text-xs font-bold">
                <Sparkles size={14} className="text-blue-500 animate-pulse" />
                <span>Weekly Leaderboard</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                Weekly Coding <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">Leaderboard</span>
              </h1>
              <p className="text-xs md:text-sm text-slate-500 font-medium">
                Ranked by XP earned this week — resets every Monday.
              </p>
            </div>

            {/* Countdown Badge */}
            <div className="glass-panel bg-white border border-slate-200/80 rounded-2xl px-4 py-2.5 shadow-sm flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-500">
                <Clock size={18} />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Week Reset</div>
                <div className="text-xs font-black text-slate-900 font-mono">{resetCountdown || "Loading..."}</div>
              </div>
            </div>
          </div>

          {/* Scope & Window Filter Controls */}
          <div className="glass-panel bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              {/* Scope Switcher Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
                <button
                  onClick={() => setScope("global")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    scope === "global"
                      ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Global
                </button>
                <button
                  onClick={() => setScope("course")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    scope === "course"
                      ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  By Course
                </button>
                <button
                  onClick={() => setScope("college")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    scope === "college"
                      ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  College
                </button>
              </div>

              {/* Time Window Switcher */}
              <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-xs font-semibold text-slate-500">
                <button
                  onClick={() => setWindow("weekly")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    window === "weekly" ? "bg-blue-600 text-white font-bold shadow-sm" : "hover:text-slate-900"
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setWindow("monthly")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    window === "monthly" ? "bg-blue-600 text-white font-bold shadow-sm" : "hover:text-slate-900"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setWindow("alltime")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    window === "alltime" ? "bg-blue-600 text-white font-bold shadow-sm" : "hover:text-slate-900"
                  }`}
                >
                  All-Time
                </button>
              </div>
            </div>

            {/* Secondary Selectors */}
            {scope === "course" && (
              <div className="flex items-center gap-3 pt-1">
                <BookOpen size={16} className="text-blue-500" />
                <span className="text-xs font-bold text-slate-700">Select Course:</span>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold rounded-xl px-3.5 py-2 focus:outline-none focus:border-blue-500"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {scope === "college" && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-purple-500" />
                  <span className="text-xs font-bold text-slate-700">Select College:</span>
                </div>
                <div className="flex items-center gap-2 flex-1 max-w-lg">
                  {collegesList.length > 0 && (
                    <select
                      value={selectedCollege}
                      onChange={(e) => setSelectedCollege(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-purple-500"
                    >
                      <option value="">-- Choose College --</option>
                      {collegesList.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  )}
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      list="colleges-datalist"
                      value={selectedCollege}
                      onChange={(e) => setSelectedCollege(e.target.value)}
                      placeholder="Or search/type college..."
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-purple-500"
                    />
                    <datalist id="colleges-datalist">
                      {collegesList.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white space-y-4 animate-pulse">
                    <div className="w-16 h-16 rounded-full bg-slate-200 mx-auto" />
                    <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto" />
                    <div className="h-3 bg-slate-200 rounded w-1/3 mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          ) : top10.length === 0 ? (
            /* Cold-Start / Empty State */
            <div className="glass-panel p-10 rounded-3xl border border-slate-200 bg-white text-center space-y-5 max-w-xl mx-auto py-16 shadow-lg">
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 mx-auto">
                <Trophy size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-950">Complete your first chapter to appear here</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                  No XP recorded yet for this filter criteria. Complete lessons, pass quizzes, and solve coding challenges to claim top rank!
                </p>
              </div>
              <button
                onClick={() => router.push("/courses")}
                className="px-6 py-3.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 hover:opacity-95 transition-opacity inline-flex items-center gap-1.5 shadow-md shadow-blue-500/10"
              >
                Start Learning Now <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <>
              {/* Top 3 Podium */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                {/* Rank 2 (Silver - Left) */}
                {rank2 ? (
                  <div className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white hover:border-blue-500/50 hover:bg-slate-50/50 transition-all text-center space-y-3 shadow-sm relative order-2 md:order-1">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black tracking-wider uppercase border border-slate-300">
                      Rank #2
                    </div>
                    <div className="relative w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-slate-200 to-slate-400 p-1 shadow-md">
                      {rank2.avatar ? (
                        <img src={rank2.avatar} alt={rank2.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <div className="w-full h-full rounded-full bg-slate-800 text-white font-black text-sm flex items-center justify-center">
                          {getInitials(rank2.name)}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 bg-slate-300 text-slate-800 rounded-full p-1 border border-white shadow">
                        <Award size={12} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 truncate">{rank2.name}</h3>
                      {rank2.college && <p className="text-[10px] text-slate-400 truncate">{rank2.college}</p>}
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-4">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">XP</div>
                        <div className="text-sm font-black text-blue-600 font-mono">{rank2.xp}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Streak</div>
                        <div className="text-xs font-bold text-amber-500 flex items-center justify-center gap-0.5">
                          <Flame size={12} className="fill-amber-500" />
                          <span>{rank2.streak}d</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : <div className="hidden md:block order-1" />}

                {/* Rank 1 (Gold - Center Prominent) */}
                {rank1 && (
                  <div className="glass-panel p-7 rounded-3xl border-2 border-amber-300 bg-gradient-to-b from-amber-50/50 to-white hover:border-amber-400 transition-all text-center space-y-4 shadow-md relative order-1 md:order-2 md:-translate-y-2">
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-black tracking-wider uppercase shadow">
                      🏆 Champion #1
                    </div>
                    <div className="relative w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-300 via-amber-400 to-yellow-200 p-1 shadow-lg">
                      {rank1.avatar ? (
                        <img src={rank1.avatar} alt={rank1.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <div className="w-full h-full rounded-full bg-slate-900 text-amber-400 font-black text-lg flex items-center justify-center">
                          {getInitials(rank1.name)}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 rounded-full p-1.5 border-2 border-white shadow">
                        <Trophy size={14} className="fill-slate-950" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 truncate">{rank1.name}</h3>
                      {rank1.college && <p className="text-xs text-slate-500 font-medium truncate">{rank1.college}</p>}
                    </div>
                    <div className="pt-3 border-t border-amber-100/80 flex items-center justify-center gap-6">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Total XP</div>
                        <div className="text-base font-black text-amber-600 font-mono">{rank1.xp} XP</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Streak</div>
                        <div className="text-sm font-black text-amber-500 flex items-center justify-center gap-1">
                          <Flame size={14} className="fill-amber-500" />
                          <span>{rank1.streak}d</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rank 3 (Bronze - Right) */}
                {rank3 ? (
                  <div className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white hover:border-blue-500/50 hover:bg-slate-50/50 transition-all text-center space-y-3 shadow-sm relative order-3">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black tracking-wider uppercase border border-amber-200">
                      Rank #3
                    </div>
                    <div className="relative w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-amber-600 to-amber-800 p-1 shadow-md">
                      {rank3.avatar ? (
                        <img src={rank3.avatar} alt={rank3.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <div className="w-full h-full rounded-full bg-slate-800 text-white font-black text-sm flex items-center justify-center">
                          {getInitials(rank3.name)}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 bg-amber-700 text-white rounded-full p-1 border border-white shadow">
                        <Medal size={12} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 truncate">{rank3.name}</h3>
                      {rank3.college && <p className="text-[10px] text-slate-400 truncate">{rank3.college}</p>}
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-4">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">XP</div>
                        <div className="text-sm font-black text-blue-600 font-mono">{rank3.xp}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Streak</div>
                        <div className="text-xs font-bold text-amber-500 flex items-center justify-center gap-0.5">
                          <Flame size={12} className="fill-amber-500" />
                          <span>{rank3.streak}d</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : <div className="hidden md:block order-3" />}
              </div>

              {/* Positions 4 to 10 Ranked List */}
              {positions4to10.length > 0 && (
                <div className="glass-panel bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Top Contenders (Ranks 4 – 10)</h3>
                  <div className="divide-y divide-slate-100">
                    {positions4to10.map((entry) => (
                      <div
                        key={entry.userId}
                        className="py-3.5 px-3 flex items-center justify-between gap-4 rounded-xl hover:bg-slate-50/80 transition-colors"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span className="w-7 text-center font-mono font-black text-slate-400 text-sm">
                            #{entry.rank}
                          </span>
                          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                            {entry.avatar ? (
                              <img src={entry.avatar} alt={entry.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              getInitials(entry.name)
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-extrabold text-slate-900 truncate">{entry.name}</div>
                            {entry.college && <div className="text-[10px] text-slate-400 truncate">{entry.college}</div>}
                          </div>
                        </div>

                        <div className="flex items-center gap-6 shrink-0">
                          <div className="text-right hidden sm:block">
                            <div className="text-[10px] text-slate-400 uppercase font-bold">Solved</div>
                            <div className="text-xs font-bold text-slate-700">{entry.challengesSolved}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-slate-400 uppercase font-bold">XP</div>
                            <div className="text-xs font-black text-blue-600 font-mono">{entry.xp}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-slate-400 uppercase font-bold">Streak</div>
                            <div className="text-xs font-bold text-amber-500 flex items-center justify-end gap-0.5">
                              <Flame size={12} className="fill-amber-500" />
                              <span>{entry.streak}d</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>

      {/* Sticky "Your Rank" Footer Card */}
      {currentUserEntry && (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl z-30">
          <div className="glass-panel bg-slate-900 text-white border border-slate-800 rounded-2xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                #{currentUserEntry.rank}
              </div>
              <div>
                <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <span>Your Current Standing</span>
                  <span className="text-[10px] font-semibold text-slate-400 font-mono">({currentUserEntry.name})</span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  {getXpToNextRank() || "Keep completing chapters to climb the ranks!"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-5 ml-auto">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Your XP</div>
                <div className="text-sm font-black text-cyan-400 font-mono">{currentUserEntry.xp} XP</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Streak</div>
                <div className="text-xs font-bold text-amber-400 flex items-center justify-end gap-1">
                  <Flame size={13} className="fill-amber-400" />
                  <span>{currentUserEntry.streak}d</span>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Trend</div>
                <div className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-0.5">
                  <TrendingUp size={13} />
                  <span>Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
