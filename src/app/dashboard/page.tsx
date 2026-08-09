"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LeftSidebar } from "@/components/dashboard/LeftSidebar";
import { 
  BookOpen, Star, Sparkles, Trophy, Settings, LogOut, ChevronLeft, ChevronRight,
  TrendingUp, Award, Play, CheckCircle2, AlertTriangle, ArrowRight,
  Terminal, ShieldCheck, Flame, Send, Bot, MessageSquare, GraduationCap, Code2,
  Bell, Search, Check, CheckSquare
} from "lucide-react";

interface CourseSlide {
  courseId: string;
  courseTitle: string;
  courseThumbnail: string;
  courseLanguage: string;
  progressPercent: number;
  completedChaptersCount: number;
  totalChaptersCount: number;
  currentChapter: {
    id: string;
    title: string;
    orderNumber: number;
    description: string;
  } | null;
  upNext: {
    title: string;
  } | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  // Force Light Mode on Mount
  useEffect(() => {
    document.documentElement.classList.add("light");
    document.body.classList.add("light");
    return () => {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme !== "light") {
        document.documentElement.classList.remove("light");
        document.body.classList.remove("light");
      }
    };
  }, []);

  // Dashboard state
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Notifications state
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Carousels state
  const [currentLearnIndex, setCurrentLearnIndex] = useState(0);
  const [currentCompleteIndex, setCurrentCompleteIndex] = useState(0);
  const learnAutoplayRef = useRef<NodeJS.Timeout | null>(null);
  const completeAutoplayRef = useRef<NodeJS.Timeout | null>(null);
  const [pausedLearn, setPausedLearn] = useState(false);
  const [pausedComplete, setPausedComplete] = useState(false);

  // AI Teacher chat state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "ai" | "user"; text: string }>>([
    { sender: "ai", text: "Ask me anything. I'm here to help you learn!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Heartbeat ping effect
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        await fetch("/api/activity/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ actionType: "HEARTBEAT" })
        });
      } catch (err) {
        console.error("Heartbeat log failed:", err);
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close notifications on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch dashboard metrics
  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to load dashboard metrics");
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        setError(json.error || "Failed to load dashboard metrics");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Network error loading dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.push("/auth");
      } else {
        fetchDashboardData();
      }
    }
  }, [session, isPending, router]);

  // Continue Learning Autoplay Control
  const startLearnAutoplay = () => {
    stopLearnAutoplay();
    if (!pausedLearn && data?.continueLearningCourses && data.continueLearningCourses.length > 1) {
      learnAutoplayRef.current = setInterval(() => {
        setCurrentLearnIndex((prev) => (prev + 1) % data.continueLearningCourses.length);
      }, 5000);
    }
  };

  const stopLearnAutoplay = () => {
    if (learnAutoplayRef.current) {
      clearInterval(learnAutoplayRef.current);
      learnAutoplayRef.current = null;
    }
  };

  const triggerManualLearnSelect = (index: number) => {
    stopLearnAutoplay();
    setPausedLearn(true);
    setCurrentLearnIndex(index);
    setTimeout(() => {
      setPausedLearn(false);
    }, 6000);
  };

  // Course Completion Autoplay Control
  const startCompleteAutoplay = () => {
    stopCompleteAutoplay();
    if (!pausedComplete && data?.continueLearningCourses && data.continueLearningCourses.length > 1) {
      completeAutoplayRef.current = setInterval(() => {
        setCurrentCompleteIndex((prev) => (prev + 1) % data.continueLearningCourses.length);
      }, 6000);
    }
  };

  const stopCompleteAutoplay = () => {
    if (completeAutoplayRef.current) {
      clearInterval(completeAutoplayRef.current);
      completeAutoplayRef.current = null;
    }
  };

  const triggerManualCompleteSelect = (index: number) => {
    stopCompleteAutoplay();
    setPausedComplete(true);
    setCurrentCompleteIndex(index);
    setTimeout(() => {
      setPausedComplete(false);
    }, 6000);
  };

  useEffect(() => {
    if (data?.continueLearningCourses) {
      startLearnAutoplay();
    }
    return () => stopLearnAutoplay();
  }, [data, pausedLearn]);

  useEffect(() => {
    if (data?.continueLearningCourses) {
      startCompleteAutoplay();
    }
    return () => stopCompleteAutoplay();
  }, [data, pausedComplete]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  // AI Teacher Send Message
  const handleSendChat = async (inputQuery: string, quickActionType?: string) => {
    const query = inputQuery.trim();
    if (!query && !quickActionType) return;

    let userPromptText = query;
    if (quickActionType === "explain") {
      userPromptText = "Can you explain the main concept of my current course chapter in simple terms?";
    } else if (quickActionType === "quiz") {
      userPromptText = "Generate a practice quiz question related to my current lesson!";
    } else if (quickActionType === "debug") {
      userPromptText = "How do I debug common syntax or logic errors in my code?";
    } else if (quickActionType === "summarize") {
      userPromptText = "Give me a quick 3-bullet summary of my study progress today.";
    }

    setChatMessages((prev) => [...prev, { sender: "user", text: userPromptText }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/ai/teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userPromptText })
      });

      const responseData = await res.json();
      if (res.ok && responseData.reply) {
        setChatMessages((prev) => [...prev, { sender: "ai", text: responseData.reply }]);
      } else {
        setChatMessages((prev) => [
          ...prev, 
          { sender: "ai", text: responseData.error || "Sorry, I couldn't process that right now. Please try again!" }
        ]);
      }
    } catch (err) {
      console.error("AI Teacher chat failed:", err);
      setChatMessages((prev) => [
        ...prev, 
        { sender: "ai", text: "Network error connecting to AI Teacher. Please check your internet connection." }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const res = await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notificationId })
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#F8FAFC] text-slate-800 flex items-center justify-center flex-col space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-[#4F46E5] animate-spin" />
        <div className="text-slate-600 text-sm font-mono font-bold">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-[#F8FAFC] text-slate-800 flex items-center justify-center flex-col space-y-4">
        <div className="p-8 rounded-3xl border border-red-200 bg-red-50/50 max-w-md text-center space-y-4 shadow-sm">
          <AlertTriangle className="text-red-500 mx-auto" size={40} />
          <h2 className="text-lg font-bold text-slate-900">Dashboard Error</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all text-xs"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const { stats, continueLearningCourses = [], learningProgress, weeklyGoals, heatmap = [], recommended = [], notifications = { unreadCount: 0, list: [] } } = data || {};
  const activeUser = data?.user || {};
  const firstName = activeUser.name ? activeUser.name.split(" ")[0] : "Student";

  return (
    <div className="h-screen bg-[#F8FAFC] text-slate-800 flex overflow-hidden font-sans antialiased">
      {/* Left Sidebar */}
      <LeftSidebar 
        activeTab="Dashboard" 
        onTabChange={(tab) => {
          if (tab === "Explore Courses") router.push("/dashboard");
          else if (tab === "Courses") router.push("/courses");
          else if (tab === "Leaderboard") router.push("/leaderboard");
          else if (tab === "AI Mentor") router.push("/codexai");
          else if (tab === "AI Quiz Generator") router.push("/quiz-generator");
          else if (tab === "Workspace") router.push("/workspace");
          else if (tab === "Certificates") router.push("/certificates");
          else if (tab === "Settings") router.push("/settings");
        }} 
        userProfile={activeUser}
        isLight={false}
        fullHeight={true}
      />

      {/* Main Right Area — Exactly 100% Viewport Height (Zero Scroll) */}
      <main className="flex-1 h-full flex flex-col justify-between overflow-hidden p-4 gap-3 w-full min-w-0">
        
        {/* Header Row */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Welcome back, {firstName}! <span className="animate-bounce">👋</span>
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              Keep learning, keep growing. You&apos;re doing great!
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative hidden md:block">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search courses, topics..." 
                className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 w-56 focus:outline-none focus:border-[#4F46E5] placeholder-slate-400 font-medium shadow-sm"
                disabled
              />
            </div>

            {/* Notification Icon */}
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-8 h-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all hover:shadow-sm cursor-pointer"
              >
                <Bell size={16} />
                {notifications?.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {notifications.unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-10 w-80 max-h-80 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1 scrollbar-thin">
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">Notifications</span>
                    <span className="text-[10px] text-slate-400 font-medium">{notifications?.unreadCount} unread</span>
                  </div>
                  {notifications.list.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No notifications yet.</div>
                  ) : (
                    notifications.list.map((n: any) => (
                      <div 
                        key={n.id} 
                        onClick={() => handleMarkAsRead(n.id)}
                        className={`p-2 rounded-xl text-left text-xs transition-colors cursor-pointer border ${
                          n.read ? "bg-white border-transparent text-slate-500" : "bg-blue-50/40 border-slate-100 text-slate-800 hover:bg-blue-50/70"
                        }`}
                      >
                        <div className="font-extrabold flex items-center justify-between gap-2">
                          <span>{n.title}</span>
                          {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            {activeUser.image ? (
              <img 
                src={activeUser.image} 
                alt={activeUser.name} 
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center font-black text-xs shadow-sm border border-slate-200">
                {firstName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Top 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-shrink-0 select-none h-[11vh] min-h-[75px]">
          {/* Courses Enrolled */}
          <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-white shadow-sm flex items-center gap-3.5 h-full">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-[#4F46E5] shrink-0">
              <BookOpen size={18} />
            </div>
            <div className="min-w-0 flex-1 flex flex-col justify-center">
              <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider leading-none">Courses Enrolled</span>
              <span className="text-2xl font-black text-slate-900 leading-tight mt-1">{stats?.coursesCount ?? 0}</span>
              <span className="text-[11px] font-bold text-emerald-600 mt-0.5">
                ↑ {stats?.newThisMonth ?? 0} new <span className="text-slate-400 font-normal">this month</span>
              </span>
            </div>
          </div>

          {/* Chapters Completed */}
          <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-white shadow-sm flex items-center gap-3.5 h-full">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div className="min-w-0 flex-1 flex flex-col justify-center space-y-0.5">
              <div className="flex justify-between items-end leading-none">
                <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Chapters Completed</span>
                <span className="text-[10px] text-slate-400 font-mono font-bold">Out of {stats?.totalChaptersCount ?? 0}</span>
              </div>
              <span className="text-2xl font-black text-slate-900 leading-tight">{stats?.completedChaptersCount ?? 0}</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                    style={{ width: `${stats?.chaptersPercentage ?? 0}%` }}
                  />
                </div>
                <span className="text-[11px] text-slate-600 font-mono font-bold">{stats?.chaptersPercentage ?? 0}%</span>
              </div>
            </div>
          </div>

          {/* Quiz Accuracy */}
          <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-white shadow-sm flex items-center gap-3.5 h-full">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
              <Trophy size={18} />
            </div>
            <div className="min-w-0 flex-1 flex flex-col justify-center">
              <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider leading-none">Quiz Accuracy</span>
              <span className="text-2xl font-black text-slate-900 leading-tight mt-1">{stats?.quizAccuracy ?? 0}%</span>
              <span className="text-[11px] font-bold text-emerald-600 mt-0.5">
                ↑ {stats?.quizImprovement ?? 0}% <span className="text-slate-400 font-normal">improvement</span>
              </span>
            </div>
          </div>

          {/* Learning Streak */}
          <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-white shadow-sm flex items-center gap-3.5 h-full">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
              <Flame size={18} className="animate-pulse" />
            </div>
            <div className="min-w-0 flex-1 flex flex-col justify-center">
              <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider leading-none">Learning Streak</span>
              <span className="text-2xl font-black text-slate-900 leading-tight mt-1">{stats?.streak ?? 0} Days</span>
              <span className="text-[11px] font-bold text-orange-500 mt-0.5">
                Keep it up! 🔥
              </span>
            </div>
          </div>
        </div>

        {/* Middle Row: Continue Learning (Carousel), Course Completion (Carousel), and AI Teacher */}
        <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-5 gap-3 overflow-hidden">
          
          {/* Continue Learning Carousel */}
          <div className="xl:col-span-2 p-4 rounded-2xl border border-slate-200/80 bg-white flex flex-col justify-between overflow-hidden shadow-sm relative">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-shrink-0">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                <Play size={14} className="text-[#4F46E5] fill-[#4F46E5]" /> Continue Learning
              </h3>
              {continueLearningCourses.length > 1 && (
                <span className="text-[10px] text-slate-400 font-mono font-bold">
                  {currentLearnIndex + 1}/{continueLearningCourses.length}
                </span>
              )}
            </div>

            {continueLearningCourses.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-2">
                <span className="text-2xl">🎓</span>
                <div className="text-xs font-bold text-slate-900">No courses in progress</div>
                <p className="text-[11px] text-slate-500 max-w-xs">
                  Subscribe to a language curriculum to start coding.
                </p>
                <button 
                  onClick={() => router.push("/dashboard")}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-[#4F46E5] hover:bg-[#4338CA] transition-colors cursor-pointer shadow-md"
                >
                  Browse Catalog
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between min-h-0 pt-2.5 relative">
                {continueLearningCourses.length > 1 && (
                  <>
                    <button 
                      onClick={() => triggerManualLearnSelect((currentLearnIndex - 1 + continueLearningCourses.length) % continueLearningCourses.length)}
                      className="absolute left-0 top-[40%] -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:text-[#4F46E5] transition-all hover:scale-105 z-10 cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button 
                      onClick={() => triggerManualLearnSelect((currentLearnIndex + 1) % continueLearningCourses.length)}
                      className="absolute right-0 top-[40%] -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:text-[#4F46E5] transition-all hover:scale-105 z-10 cursor-pointer"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </>
                )}

                {continueLearningCourses.map((course: CourseSlide, idx: number) => {
                  if (idx !== currentLearnIndex) return null;
                  return (
                    <div key={course.courseId} className="flex-1 flex flex-col justify-between min-h-0 space-y-2 px-1">
                      <div className="flex gap-3 items-center">
                        <img 
                          src={course.courseThumbnail} 
                          alt={course.courseTitle}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0"
                        />
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate leading-snug">
                            {course.courseTitle}
                          </h4>
                          <div className="text-xs text-slate-700 font-extrabold truncate">
                            {course.currentChapter?.title || "Overview"}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium truncate">
                            Chapter {course.currentChapter?.orderNumber ?? 1} • {course.currentChapter?.description || "Concept overview"}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[11px] font-bold text-slate-600">
                          <span>Course Progress</span>
                          <span className="font-mono text-[#4F46E5] font-black">{course.progressPercent}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-[#4F46E5] rounded-full transition-all duration-500"
                            style={{ width: `${course.progressPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-0.5">
                        <button 
                          onClick={() => router.push(`/courses/${course.courseLanguage}/chapter/${course.currentChapter?.orderNumber ?? 1}`)}
                          className="flex-1 py-2 rounded-xl text-xs font-black text-white bg-[#4F46E5] hover:bg-[#4338CA] transition-colors text-center cursor-pointer shadow-sm shadow-indigo-500/10"
                        >
                          Continue Learning
                        </button>
                        <button 
                          onClick={() => router.push(`/courses/${course.courseLanguage}/curriculum`)}
                          className="px-3 py-2 rounded-xl text-xs font-extrabold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          View Curriculum
                        </button>
                      </div>
                    </div>
                  );
                })}

                {continueLearningCourses.length > 1 && (
                  <div className="flex justify-center items-center gap-1.5 pt-1.5">
                    {continueLearningCourses.map((_course: CourseSlide, dIdx: number) => (
                      <button
                        key={dIdx}
                        onClick={() => triggerManualLearnSelect(dIdx)}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                          dIdx === currentLearnIndex ? "bg-[#4F46E5] w-3" : "bg-slate-200 w-1.5"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Course Completion Carousel */}
          <div className="xl:col-span-1 p-4 rounded-2xl border border-slate-200/80 bg-white flex flex-col justify-between overflow-hidden shadow-sm relative">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-shrink-0">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                <Award size={14} className="text-[#4F46E5]" /> Course Metric
              </h3>
              {continueLearningCourses.length > 1 && (
                <span className="text-[10px] text-slate-400 font-mono font-bold">
                  {currentCompleteIndex + 1}/{continueLearningCourses.length}
                </span>
              )}
            </div>

            {continueLearningCourses.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-3">
                <span className="text-xl">🏆</span>
                <p className="text-[11px] text-slate-500 font-medium mt-1">Zero active courses.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between min-h-0 pt-2.5 relative">
                {continueLearningCourses.length > 1 && (
                  <>
                    <button 
                      onClick={() => triggerManualCompleteSelect((currentCompleteIndex - 1 + continueLearningCourses.length) % continueLearningCourses.length)}
                      className="absolute left-0 top-[40%] -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:text-[#4F46E5] transition-all hover:scale-105 z-10 cursor-pointer"
                    >
                      <ChevronLeft size={12} />
                    </button>
                    <button 
                      onClick={() => triggerManualCompleteSelect((currentCompleteIndex + 1) % continueLearningCourses.length)}
                      className="absolute right-0 top-[40%] -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:text-[#4F46E5] transition-all hover:scale-105 z-10 cursor-pointer"
                    >
                      <ChevronRight size={12} />
                    </button>
                  </>
                )}

                {continueLearningCourses.map((course: CourseSlide, idx: number) => {
                  if (idx !== currentCompleteIndex) return null;
                  return (
                    <div key={course.courseId} className="flex-1 flex flex-col justify-between min-h-0 space-y-2 px-1">
                      <div className="flex flex-col items-center text-center space-y-1">
                        <img 
                          src={course.courseThumbnail} 
                          alt={course.courseTitle}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-sm"
                        />
                        <h4 className="text-xs font-black text-slate-900 line-clamp-2">
                          {course.courseTitle}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">
                          {course.courseLanguage} TRACK
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[11px] font-extrabold text-slate-600">
                          <span>Timeline Completion</span>
                          <span className="font-mono text-[#4F46E5]">{course.progressPercent}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${course.progressPercent}%` }}
                          />
                        </div>
                      </div>

                      <button 
                        onClick={() => router.push(`/courses/${course.courseLanguage}/chapter/${course.currentChapter?.orderNumber ?? 1}`)}
                        className="w-full py-2 rounded-xl text-xs font-black text-white bg-[#4F46E5] hover:bg-[#4338CA] transition-colors text-center cursor-pointer shadow-sm"
                      >
                        Continue Learning
                      </button>
                    </div>
                  );
                })}

                {continueLearningCourses.length > 1 && (
                  <div className="flex justify-center items-center gap-1 pt-1">
                    {continueLearningCourses.map((_course: CourseSlide, dIdx: number) => (
                      <button
                        key={dIdx}
                        onClick={() => triggerManualCompleteSelect(dIdx)}
                        className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                          dIdx === currentCompleteIndex ? "bg-[#4F46E5] w-2.5" : "bg-slate-200 w-1"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Teacher */}
          <div className="xl:col-span-2 p-4 rounded-2xl border border-slate-200/80 bg-white flex flex-col justify-between overflow-hidden shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-[#4F46E5] shrink-0">
                  <Bot size={16} />
                </div>
                <span className="text-xs sm:text-sm font-black text-slate-900">AI Teacher</span>
              </div>
              <span className="text-[11px] text-emerald-600 font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto my-2 space-y-2 p-1 scrollbar-thin text-xs leading-relaxed min-h-0">
              {chatMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex gap-2 max-w-[88%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                    msg.sender === "user" ? "bg-indigo-50 text-[#4F46E5] border border-indigo-100" : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}>
                    {msg.sender === "user" ? "👤" : "🤖"}
                  </div>
                  <div className={`p-2.5 rounded-2xl border ${
                    msg.sender === "user" 
                      ? "bg-indigo-50/70 border-indigo-100 text-[#4F46E5]" 
                      : "bg-slate-50 border-slate-150 text-slate-800"
                  }`}>
                    <p className="whitespace-pre-line font-medium text-xs">{msg.text}</p>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex gap-2 max-w-[88%] mr-auto items-center">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs">
                    🤖
                  </div>
                  <div className="flex gap-1 py-2 px-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="w-1.5 h-1.5 bg-[#4F46E5] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-[#4F46E5] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-[#4F46E5] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Controls */}
            <div className="space-y-1.5 flex-shrink-0 pt-1.5 border-t border-slate-100">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendChat(chatInput); }}
                className="flex items-center gap-2 border border-slate-200 rounded-xl bg-slate-50 px-3 py-1.5 shadow-inner"
              >
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type your question here..." 
                  className="bg-transparent border-none outline-none text-xs text-slate-800 w-full placeholder-slate-400 font-medium"
                  disabled={chatLoading}
                />
                <button 
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="p-1.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white transition-colors disabled:opacity-40 cursor-pointer shrink-0"
                >
                  <Send size={12} />
                </button>
              </form>

              {/* Action grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-extrabold">
                <button 
                  onClick={() => handleSendChat("", "explain")}
                  className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#4F46E5] hover:border-indigo-300 hover:bg-slate-50 transition-all text-center cursor-pointer flex items-center justify-center gap-1"
                >
                  💡 Explain
                </button>
                <button 
                  onClick={() => handleSendChat("", "quiz")}
                  className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#4F46E5] hover:border-indigo-300 hover:bg-slate-50 transition-all text-center cursor-pointer flex items-center justify-center gap-1"
                >
                  🎯 Quiz
                </button>
                <button 
                  onClick={() => handleSendChat("", "debug")}
                  className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#4F46E5] hover:border-indigo-300 hover:bg-slate-50 transition-all text-center cursor-pointer flex items-center justify-center gap-1"
                >
                  💻 Debug
                </button>
                <button 
                  onClick={() => handleSendChat("", "summarize")}
                  className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#4F46E5] hover:border-indigo-300 hover:bg-slate-50 transition-all text-center cursor-pointer flex items-center justify-center gap-1"
                >
                  📝 Summarize
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Donut Chart, Goals, Heatmap */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-shrink-0 h-[24vh] min-h-[160px]">
          
          {/* Learning Progress Donut */}
          <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-white shadow-sm flex flex-col justify-between overflow-hidden relative select-none h-full">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-100 flex-shrink-0">
              Learning Progress
            </h3>
            
            <div className="flex items-center gap-4 py-1 flex-1 min-h-0">
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="30" className="stroke-slate-100 fill-none" strokeWidth="7" />
                  <circle cx="40" cy="40" r="30" className="stroke-slate-300 fill-none" strokeWidth="7" 
                    strokeDasharray={2 * Math.PI * 30}
                    strokeDashoffset={2 * Math.PI * 30 - (100 / 100) * (2 * Math.PI * 30)}
                  />
                  <circle cx="40" cy="40" r="30" className="stroke-[#7C3AED] fill-none" strokeWidth="7" 
                    strokeDasharray={2 * Math.PI * 30}
                    strokeDashoffset={2 * Math.PI * 30 - ((learningProgress?.completedPercentage + learningProgress?.inProgressPercentage) / 100) * (2 * Math.PI * 30)}
                  />
                  <circle cx="40" cy="40" r="30" className="stroke-emerald-500 fill-none" strokeWidth="7" 
                    strokeDasharray={2 * Math.PI * 30}
                    strokeDashoffset={2 * Math.PI * 30 - (learningProgress?.completedPercentage / 100) * (2 * Math.PI * 30)}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs font-black text-slate-900 leading-none font-mono">{learningProgress?.overallProgressPercent ?? 0}%</span>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide mt-0.5">Overall</span>
                </div>
              </div>

              {/* Legends list */}
              <div className="flex-1 space-y-1 text-xs text-slate-700 font-bold">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Completed</span>
                  </div>
                  <span className="font-mono font-black text-slate-900">{learningProgress?.completedCount} ({learningProgress?.completedPercentage}%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                    <span>In Progress</span>
                  </div>
                  <span className="font-mono font-black text-slate-900">{learningProgress?.inProgressCount} ({learningProgress?.inProgressPercentage}%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                    <span>Remaining</span>
                  </div>
                  <span className="font-mono font-black text-slate-900">{learningProgress?.remainingCount} ({learningProgress?.remainingPercentage}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Goals */}
          <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-white shadow-sm flex flex-col justify-between overflow-hidden relative select-none h-full">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-100 flex-shrink-0">
              This Week&apos;s Goals
            </h3>
            
            <div className="space-y-2 py-1 flex-1 flex flex-col justify-center text-xs text-slate-700 font-extrabold">
              <div className="space-y-1">
                <div className="flex justify-between items-center leading-none">
                  <span className="flex items-center gap-1">🟢 Complete {weeklyGoals?.chapters?.target ?? 2} Chapters</span>
                  <span className="font-mono text-slate-500 font-bold">{weeklyGoals?.chapters?.current ?? 0}/{weeklyGoals?.chapters?.target ?? 2}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.min(100, ((weeklyGoals?.chapters?.current ?? 0) / (weeklyGoals?.chapters?.target ?? 2)) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center leading-none">
                  <span className="flex items-center gap-1">🎯 Solve {weeklyGoals?.quizzes?.target ?? 10} Quiz Questions</span>
                  <span className="font-mono text-slate-500 font-bold">{weeklyGoals?.quizzes?.current ?? 0}/{weeklyGoals?.quizzes?.target ?? 10}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${Math.min(100, ((weeklyGoals?.quizzes?.current ?? 0) / (weeklyGoals?.quizzes?.target ?? 10)) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center leading-none">
                  <span className="flex items-center gap-1">🤖 AI Practice &amp; Chats</span>
                  <span className="font-mono text-slate-500 font-bold">{weeklyGoals?.aiSessions?.current ?? 0}/{weeklyGoals?.aiSessions?.target ?? 5}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, ((weeklyGoals?.aiSessions?.current ?? 0) / (weeklyGoals?.aiSessions?.target ?? 5)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="text-center pt-1 border-t border-slate-100 flex-shrink-0">
              <a href="#goals" className="text-xs font-black text-[#4F46E5] hover:underline">View All Goals</a>
            </div>
          </div>

          {/* Heatmap */}
          <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-white shadow-sm flex flex-col justify-between overflow-hidden relative select-none h-full">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-100 flex-shrink-0">
              Editor Activity
            </h3>
            
            <div className="flex flex-col justify-between flex-1 min-h-0 pt-1.5 space-y-2">
              <div className="flex gap-1.5 justify-center">
                {heatmap.map((week: any, wIdx: number) => (
                  <div key={wIdx} className="flex flex-col gap-1">
                    {week.days.map((day: any, dIdx: number) => (
                      <div 
                        key={dIdx}
                        title={`${day.date}: ${day.count} editor activities`}
                        className={`w-3 h-3 rounded-sm transition-all duration-300 hover:scale-110 cursor-pointer ${
                          day.intensity === 0 ? "bg-slate-100" :
                          day.intensity === 1 ? "bg-indigo-100 border border-indigo-200/30" :
                          day.intensity === 2 ? "bg-indigo-300 border border-indigo-400/30" :
                          "bg-[#4F46E5] shadow-sm shadow-[#4F46E5]/15"
                        }`}
                      />
                    ))}
                  </div>
                ))}
              </div>

              {/* Heatmap Legend Swatches */}
              <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wider">
                <span>Less</span>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    <div className="w-1.5 h-1.5 rounded-sm bg-indigo-100" />
                    <span>Hints</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <div className="w-1.5 h-1.5 rounded-sm bg-indigo-300" />
                    <span>Suggestions</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <div className="w-1.5 h-1.5 rounded-sm bg-[#4F46E5]" />
                    <span>Fixes</span>
                  </div>
                </div>
                <span>More</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended for You Row */}
        <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-white shadow-sm flex flex-col justify-between overflow-hidden flex-shrink-0 h-[10.5vh] min-h-[65px] select-none">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100 flex-shrink-0">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-wider leading-none">
              Recommended for You
            </h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Based on progress</span>
          </div>
          
          <div className="flex items-center gap-3 overflow-x-auto py-0.5 scrollbar-thin min-h-0 flex-shrink-0 relative">
            {recommended.length === 0 ? (
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">All courses fully enrolled! Outstanding progress!</span>
            ) : (
              recommended.map((course: any) => (
                <div 
                  key={course.id}
                  onClick={() => {
                    if (course.badge === "Review Required") {
                      router.push(`/courses/${course.language}/curriculum`);
                    } else {
                      router.push(`/courses/${course.language}/curriculum`);
                    }
                  }}
                  className="flex-shrink-0 w-64 p-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/50 hover:border-[#4F46E5]/40 flex gap-2.5 items-center cursor-pointer transition-all hover:scale-101 group shadow-sm"
                >
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center justify-between gap-1 leading-none">
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border leading-none ${
                        course.badge === "Review Required" 
                          ? "bg-red-50 border-red-200 text-red-600" 
                          : "bg-indigo-50 border-indigo-100 text-[#4F46E5]"
                      }`}>
                        {course.badge}
                      </span>
                      <div className="flex items-center gap-0.5 text-[10px] text-amber-500 font-bold shrink-0">
                        <Star size={10} className="fill-amber-400 text-amber-500" />
                        <span>{course.rating}</span>
                      </div>
                    </div>
                    <h4 className="text-xs font-black text-slate-900 truncate group-hover:text-[#4F46E5] transition-colors">
                      {course.title}
                    </h4>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
