"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { TopNavbar } from "@/components/dashboard/TopNavbar";
import { LeftSidebar } from "@/components/dashboard/LeftSidebar";
import { 
  BookOpen, Star, Sparkles, Trophy, Settings, LogOut, ChevronLeft, ChevronRight,
  TrendingUp, Award, AwardIcon, Compass, Play, CheckCircle2, AlertTriangle, ArrowRight,
  Terminal, ShieldCheck, Flame, Send, Bot, MessageSquare, GraduationCap, Code2
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

  // Dashboard state
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carousels state
  const [currentLearnIndex, setCurrentLearnIndex] = useState(0);
  const [currentCompleteIndex, setCurrentCompleteIndex] = useState(0);
  const learnAutoplayRef = useRef<NodeJS.Timeout | null>(null);
  const completeAutoplayRef = useRef<NodeJS.Timeout | null>(null);

  // AI Teacher chat state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "ai" | "user"; text: string }>>([
    { sender: "ai", text: "Hello! 👋 I am your AI Teacher. How can I help you master coding today? Ask a question or click a quick action below!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Heartbeat ping effect
  useEffect(() => {
    // Heartbeat sends a ping every 60 seconds (1 minute) to log active learning
    const sendHeartbeat = async () => {
      try {
        await fetch("/api/activity/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ actionType: "HEARTBEAT" })
        });
      } catch (err) {
        console.error("Heartbeat fail:", err);
      }
    };

    // Send first heartbeat immediately
    sendHeartbeat();

    const interval = setInterval(sendHeartbeat, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch dashboard metrics
  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to load dashboard data");
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

  // Carousels Autoplay Control
  const startLearnAutoplay = () => {
    stopLearnAutoplay();
    if (data?.continueLearningCourses && data.continueLearningCourses.length > 1) {
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

  const startCompleteAutoplay = () => {
    stopCompleteAutoplay();
    if (data?.continueLearningCourses && data.continueLearningCourses.length > 1) {
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

  useEffect(() => {
    if (data?.continueLearningCourses) {
      startLearnAutoplay();
      startCompleteAutoplay();
    }
    return () => {
      stopLearnAutoplay();
      stopCompleteAutoplay();
    };
  }, [data]);

  // Scroll chat to bottom on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // AI Teacher query triggers
  const handleSendChat = async (messageText: string, quickAction?: string) => {
    if (!messageText.trim() && !quickAction) return;

    setChatLoading(true);
    if (!quickAction) {
      setChatMessages((prev) => [...prev, { sender: "user", text: messageText }]);
      setChatInput("");
    } else {
      let actionLabel = "";
      if (quickAction === "explain") actionLabel = "📚 Explain Current Topic";
      else if (quickAction === "quiz") actionLabel = "🎯 Quiz Me";
      else if (quickAction === "debug") actionLabel = "🐞 Debug Flawed Code";
      else if (quickAction === "summarize") actionLabel = "📝 Summarize Chapter";
      
      setChatMessages((prev) => [...prev, { sender: "user", text: actionLabel }]);
    }

    try {
      const activeCourseLang = data?.continueLearningCourses?.[currentLearnIndex]?.courseLanguage || "cpp";
      const res = await fetch("/api/ai/teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          quickAction,
          courseLanguage: activeCourseLang
        })
      });
      const resJson = await res.json();
      if (resJson.success) {
        setChatMessages((prev) => [...prev, { sender: "ai", text: resJson.reply }]);
        // Refresh dashboard data as XP/Streaks might have incremented!
        fetchDashboardData();
      } else {
        setChatMessages((prev) => [...prev, { sender: "ai", text: "Sorry, I couldn't generate a response. Please check your network and try again." }]);
      }
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [...prev, { sender: "ai", text: "Failed to connect to AI server." }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#09090B] text-white flex items-center justify-center flex-col space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
        <div className="text-slate-400 text-xs font-mono">Loading premium student dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-[#09090B] text-white flex items-center justify-center flex-col space-y-4">
        <div className="p-8 rounded-3xl border border-red-500/30 bg-red-950/15 max-w-md text-center space-y-4">
          <AlertTriangle className="text-red-400 mx-auto" size={40} />
          <h2 className="text-lg font-bold">Dashboard Error</h2>
          <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all text-xs"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const { stats, continueLearningCourses = [], learningProgress, weeklyGoals, heatmap = [], recommended = [] } = data || {};
  const activeUser = data?.user || {};

  return (
    <div className="min-h-screen xl:h-screen bg-[#09090B] text-white flex flex-col overflow-hidden font-sans">
      {/* Top Navbar */}
      <TopNavbar
        userName={activeUser.name || "Student"}
        userRole={activeUser.role || "Student"}
      />

      {/* Workspace Wrapper */}
      <div className="flex-1 flex w-full overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar activeTab="Dashboard" onTabChange={(tab) => {
          if (tab === "Courses") router.push("/courses");
          else if (tab === "Leaderboard") router.push("/leaderboard");
          else if (tab === "AI Mentor") router.push("/codexai");
          else if (tab === "AI Quiz Generator") router.push("/quiz-generator");
          else if (tab === "Workspace") router.push("/workspace");
        }} userProfile={activeUser} />

        {/* Dashboard Canvas Container */}
        <main className="flex-1 overflow-y-auto xl:overflow-hidden h-full flex flex-col p-4 sm:p-5 gap-4 max-w-7xl mx-auto w-full min-w-0">
          
          {/* Welcome Row */}
          <div className="flex items-center justify-between flex-shrink-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-1.5">
                Welcome back, {activeUser.name || "Student"}! <span className="animate-bounce">👋</span>
              </h1>
              <p className="text-[11px] text-slate-400 leading-tight">
                Keep learning, keep growing. You&apos;re doing great!
              </p>
            </div>
            
            {/* Search Bar Placeholder matching reference */}
            <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl w-64">
              <span className="text-slate-400 text-xs">🔍</span>
              <input 
                type="text" 
                placeholder="Search courses, topics..." 
                className="bg-transparent border-none outline-none text-xs text-slate-300 w-full"
                disabled
              />
            </div>
          </div>

          {/* Top 4 Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-shrink-0 select-none">
            {/* Enrolled Courses */}
            <div className="glass-panel p-3.5 rounded-2xl border border-white/5 bg-white/5 flex flex-col justify-between h-[10.5vh] relative overflow-hidden">
              <div className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 text-xs">
                📖
              </div>
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Courses Enrolled</span>
              <div className="space-y-1">
                <span className="text-2xl font-black text-white font-mono leading-none">{stats?.coursesCount ?? 0}</span>
                <span className="text-[9px] text-emerald-400 flex items-center gap-0.5 font-bold">
                  ↑ {stats?.newThisMonth ?? 0} new <span className="text-slate-500 font-normal">this month</span>
                </span>
              </div>
            </div>

            {/* Chapters Completed */}
            <div className="glass-panel p-3.5 rounded-2xl border border-white/5 bg-white/5 flex flex-col justify-between h-[10.5vh] relative overflow-hidden">
              <div className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs">
                ✅
              </div>
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Chapters Completed</span>
              <div className="space-y-1">
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-black text-white font-mono leading-none">{stats?.completedChaptersCount ?? 0}</span>
                  <span className="text-[9px] text-slate-400 font-mono">Out of {stats?.totalChaptersCount ?? 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full" 
                      style={{ width: `${stats?.chaptersPercentage ?? 0}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono">{stats?.chaptersPercentage ?? 0}%</span>
                </div>
              </div>
            </div>

            {/* Quiz Accuracy */}
            <div className="glass-panel p-3.5 rounded-2xl border border-white/5 bg-white/5 flex flex-col justify-between h-[10.5vh] relative overflow-hidden">
              <div className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-xs">
                🎯
              </div>
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Quiz Accuracy</span>
              <div className="space-y-1">
                <span className="text-2xl font-black text-white font-mono leading-none">{stats?.quizAccuracy ?? 0}%</span>
                <span className="text-[9px] text-emerald-400 flex items-center gap-0.5 font-bold">
                  ↑ {stats?.quizImprovement ?? 0}% <span className="text-slate-500 font-normal">improvement</span>
                </span>
              </div>
            </div>

            {/* Learning Streak */}
            <div className="glass-panel p-3.5 rounded-2xl border border-white/5 bg-white/5 flex flex-col justify-between h-[10.5vh] relative overflow-hidden">
              <div className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 text-xs animate-pulse">
                🔥
              </div>
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Learning Streak</span>
              <div className="space-y-1">
                <span className="text-2xl font-black text-white font-mono leading-none">{stats?.streak ?? 0} Days</span>
                <span className="text-[9px] text-amber-400 font-black tracking-wider block animate-pulse">
                  Keep it up! 🔥
                </span>
              </div>
            </div>
          </div>

          {/* Middle Row: Continue Learning (Carousel) & AI Teacher */}
          <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-5 gap-4 overflow-hidden">
            {/* Continue Learning Carousel Widget */}
            <div className="xl:col-span-3 glass-panel p-4 sm:p-5 rounded-3xl border border-white/10 bg-[#0B0B13] flex flex-col justify-between overflow-hidden shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-white/5 flex-shrink-0">
                <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                  <Play size={14} className="text-cyan-400" /> Continue Learning
                </h3>
                {continueLearningCourses.length > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => {
                        stopLearnAutoplay();
                        setCurrentLearnIndex((prev) => (prev - 1 + continueLearningCourses.length) % continueLearningCourses.length);
                      }}
                      className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all cursor-pointer border border-white/5"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {currentLearnIndex + 1}/{continueLearningCourses.length}
                    </span>
                    <button 
                      onClick={() => {
                        stopLearnAutoplay();
                        setCurrentLearnIndex((prev) => (prev + 1) % continueLearningCourses.length);
                      }}
                      className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all cursor-pointer border border-white/5"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>

              {continueLearningCourses.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <span className="text-3xl">🎓</span>
                  <div className="text-sm font-bold">No enrolled courses in progress</div>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    Start your programming journey by subscribing to C, C++, Python, or Java.
                  </p>
                  <button 
                    onClick={() => router.push("/courses")}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 glow-btn"
                  >
                    Browse Course Catalog
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-between min-h-0 pt-3 relative">
                  {/* Slider Element with React Transition Mapping */}
                  {continueLearningCourses.map((course: CourseSlide, idx: number) => {
                    if (idx !== currentLearnIndex) return null;
                    return (
                      <div key={course.courseId} className="flex-1 flex flex-col justify-between min-h-0 space-y-3 animate-fade-in">
                        {/* Course metadata detail */}
                        <div className="flex gap-4">
                          <img 
                            src={course.courseThumbnail} 
                            alt={course.courseTitle}
                            className="w-20 h-20 rounded-2xl object-cover border border-white/10 shadow-lg flex-shrink-0"
                          />
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-cyan-300 border border-blue-500/20 font-bold uppercase">
                              {course.courseLanguage} Curricula
                            </span>
                            <h4 className="text-base font-black text-white truncate leading-tight">
                              {course.courseTitle}
                            </h4>
                            <p className="text-[11px] text-slate-300 font-bold leading-normal truncate">
                              📚 Next Up: {course.currentChapter?.title || "Starting Course Overview"}
                            </p>
                            <p className="text-[10px] text-slate-400 line-clamp-1">
                              {course.currentChapter?.description || "Master coding execution cycles, syntax declarations, and variable mappings."}
                            </p>
                          </div>
                        </div>

                        {/* Completion progress meter */}
                        <div className="space-y-1.5 bg-white/5 p-3 rounded-2xl border border-white/5">
                          <div className="flex items-center justify-between text-[10px] text-slate-300">
                            <span className="font-semibold">Course Progression Timeline</span>
                            <span className="font-mono font-bold text-cyan-300">{course.progressPercent}% Completed</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-400 rounded-full transition-all duration-500"
                              style={{ width: `${course.progressPercent}%` }}
                            />
                          </div>
                          <div className="flex justify-between items-center text-[9px] text-slate-400">
                            <span>{course.completedChaptersCount} chapters completed</span>
                            <span>{course.totalChaptersCount - course.completedChaptersCount} remaining</span>
                          </div>
                        </div>

                        {/* Carousel Footer Buttons */}
                        <div className="flex items-center gap-3 pt-1">
                          <button 
                            onClick={() => router.push(`/courses/${course.courseLanguage}/chapter/${course.currentChapter?.orderNumber ?? 1}`)}
                            className="flex-1 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 hover:opacity-95 transition-opacity text-center flex items-center justify-center gap-1.5 shadow-xl shadow-blue-500/10 cursor-pointer"
                          >
                            Continue Learning <ArrowRight size={13} />
                          </button>
                          <button 
                            onClick={() => router.push(`/courses/${course.courseLanguage}/curriculum`)}
                            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer"
                          >
                            View Curriculum
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Course Completion Carousel Slide Preview Strip */}
              {continueLearningCourses.length > 0 && (
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-400 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Up Next: {continueLearningCourses[currentLearnIndex]?.upNext?.title || "Course Final Quiz"}</span>
                  </div>
                  <ChevronRight size={12} />
                </div>
              )}
            </div>

            {/* AI Teacher Pane */}
            <div className="xl:col-span-2 glass-panel p-4 rounded-3xl border border-white/10 bg-[#0B0B13] flex flex-col justify-between overflow-hidden shadow-2xl">
              {/* Chat Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-white/5 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Bot size={13} />
                  </div>
                  <span className="text-xs font-extrabold text-white">AI Teacher Assistant</span>
                </div>
                <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
              </div>

              {/* Chat Message Logs */}
              <div className="flex-1 overflow-y-auto my-3 space-y-3 p-1 custom-scrollbar text-xs leading-relaxed min-h-0">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex gap-2 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                      msg.sender === "user" ? "bg-cyan-500/20 text-cyan-400" : "bg-purple-500/20 text-purple-400"
                    }`}>
                      {msg.sender === "user" ? "👤" : "🤖"}
                    </div>
                    <div className={`p-2.5 rounded-2xl border ${
                      msg.sender === "user" 
                        ? "bg-cyan-500/5 border-cyan-500/20 text-cyan-100" 
                        : "bg-white/5 border-white/5 text-slate-200"
                    }`}>
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex gap-2 max-w-[85%] mr-auto items-center">
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px]">
                      🤖
                    </div>
                    <div className="flex gap-1 py-2 px-3 rounded-2xl bg-white/5 border border-white/5">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input & Prompts */}
              <div className="space-y-2 flex-shrink-0">
                {/* Micro Actions Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[9px] font-bold">
                  <button 
                    onClick={() => handleSendChat("", "explain")}
                    className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-purple-500/50 hover:bg-purple-500/10 text-slate-300 hover:text-white transition-all text-center cursor-pointer"
                  >
                    📚 Explain
                  </button>
                  <button 
                    onClick={() => handleSendChat("", "quiz")}
                    className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-slate-300 hover:text-white transition-all text-center cursor-pointer"
                  >
                    🎯 Quiz Me
                  </button>
                  <button 
                    onClick={() => handleSendChat("", "debug")}
                    className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-amber-500/50 hover:bg-amber-500/10 text-slate-300 hover:text-white transition-all text-center cursor-pointer"
                  >
                    🐞 Debug Code
                  </button>
                  <button 
                    onClick={() => handleSendChat("", "summarize")}
                    className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-slate-300 hover:text-white transition-all text-center cursor-pointer"
                  >
                    📝 Summarize
                  </button>
                </div>

                {/* Main Message Form */}
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendChat(chatInput); }}
                  className="flex items-center gap-2 border border-white/10 rounded-2xl bg-white/5 px-3 py-2"
                >
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask anything about coding..." 
                    className="bg-transparent border-none outline-none text-xs text-slate-300 w-full placeholder-slate-500"
                    disabled={chatLoading}
                  />
                  <button 
                    type="submit"
                    disabled={chatLoading || !chatInput.trim()}
                    className="p-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-colors disabled:opacity-40 cursor-pointer shrink-0"
                  >
                    <Send size={12} />
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Bottom Row: Donut Chart, Goals List, Heatmap Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
            {/* Learning Progress Donut Chart */}
            <div className="glass-panel p-4 rounded-3xl border border-white/5 bg-white/5 flex flex-col justify-between relative overflow-hidden select-none">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider pb-2 border-b border-white/5">Learning Progress</h3>
              
              <div className="flex items-center gap-4 py-2">
                {/* SVG Donut */}
                <div className="relative w-20 h-20 shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="32" className="stroke-white/10 fill-none" strokeWidth="6.5" />
                    {/* Remaining */}
                    <circle cx="40" cy="40" r="32" className="stroke-slate-500 fill-none" strokeWidth="6.5" 
                      strokeDasharray={2 * Math.PI * 32}
                      strokeDashoffset={2 * Math.PI * 32 - (100 / 100) * (2 * Math.PI * 32)}
                    />
                    {/* In Progress */}
                    <circle cx="40" cy="40" r="32" className="stroke-purple-500 fill-none" strokeWidth="6.5" 
                      strokeDasharray={2 * Math.PI * 32}
                      strokeDashoffset={2 * Math.PI * 32 - ((learningProgress?.completedPercentage + learningProgress?.inProgressPercentage) / 100) * (2 * Math.PI * 32)}
                    />
                    {/* Completed */}
                    <circle cx="40" cy="40" r="32" className="stroke-blue-500 fill-none" strokeWidth="6.5" 
                      strokeDasharray={2 * Math.PI * 32}
                      strokeDashoffset={2 * Math.PI * 32 - (learningProgress?.completedPercentage / 100) * (2 * Math.PI * 32)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-black text-white font-mono leading-none">{learningProgress?.overallProgressPercent ?? 0}%</span>
                    <span className="text-[7px] text-slate-400 font-mono uppercase tracking-wider scale-90">Progress</span>
                  </div>
                </div>

                {/* Legends */}
                <div className="flex-1 space-y-1 text-[10px] text-slate-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>Completed</span>
                    </div>
                    <span className="font-mono font-bold">{learningProgress?.completedCount} ({learningProgress?.completedPercentage}%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      <span>In Progress</span>
                    </div>
                    <span className="font-mono font-bold">{learningProgress?.inProgressCount} ({learningProgress?.inProgressPercentage}%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-500" />
                      <span>Remaining</span>
                    </div>
                    <span className="font-mono font-bold">{learningProgress?.remainingCount} ({learningProgress?.remainingPercentage}%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* This Week's Goals Progress Widget */}
            <div className="glass-panel p-4 rounded-3xl border border-white/5 bg-white/5 flex flex-col justify-between relative overflow-hidden select-none">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider pb-2 border-b border-white/5">This Week&apos;s Goals</h3>
              
              <div className="space-y-2 py-1.5">
                {/* Goal 1: Chapters */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-300 font-bold">
                    <span className="flex items-center gap-1">🟢 Complete {weeklyGoals?.chapters?.target ?? 2} Chapters</span>
                    <span className="font-mono text-slate-400">{weeklyGoals?.chapters?.current ?? 0}/{weeklyGoals?.chapters?.target ?? 2}</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.min(100, ((weeklyGoals?.chapters?.current ?? 0) / (weeklyGoals?.chapters?.target ?? 2)) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Goal 2: Quizzes */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-300 font-bold">
                    <span className="flex items-center gap-1">🎯 Solve {weeklyGoals?.quizzes?.target ?? 10} Quiz Questions</span>
                    <span className="font-mono text-slate-400">{weeklyGoals?.quizzes?.current ?? 0}/{weeklyGoals?.quizzes?.target ?? 10}</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${Math.min(100, ((weeklyGoals?.quizzes?.current ?? 0) / (weeklyGoals?.quizzes?.target ?? 10)) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Goal 3: AI Chats */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-300 font-bold">
                    <span className="flex items-center gap-1">🤖 AI Practice &amp; Chats</span>
                    <span className="font-mono text-slate-400">{weeklyGoals?.aiSessions?.current ?? 0}/{weeklyGoals?.aiSessions?.target ?? 5}</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, ((weeklyGoals?.aiSessions?.current ?? 0) / (weeklyGoals?.aiSessions?.target ?? 5)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Editor Activity Heatmap Graph */}
            <div className="glass-panel p-4 rounded-3xl border border-white/5 bg-white/5 flex flex-col justify-between relative overflow-hidden select-none">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider pb-2 border-b border-white/5">Editor &amp; AI Activity</h3>
              
              <div className="flex flex-col justify-between flex-1 min-h-0 pt-2 space-y-2">
                <div className="flex gap-1.5 justify-center">
                  {heatmap.map((week: any, wIdx: number) => (
                    <div key={wIdx} className="flex flex-col gap-1">
                      {week.days.map((day: any, dIdx: number) => (
                        <div 
                          key={dIdx}
                          title={`${day.date}: ${day.count} editor activities`}
                          className={`w-2.5 h-2.5 rounded-sm transition-all duration-300 hover:scale-115 ${
                            day.intensity === 0 ? "bg-white/5" :
                            day.intensity === 1 ? "bg-blue-600/30 border border-blue-500/20" :
                            day.intensity === 2 ? "bg-purple-600/60 border border-purple-500/30" :
                            "bg-cyan-400 shadow-md shadow-cyan-400/20"
                          }`}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                {/* Heatmap Legend */}
                <div className="flex items-center justify-between text-[8px] text-slate-500 font-mono font-bold uppercase tracking-wider">
                  <span>Less Activity</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-sm bg-white/5" />
                    <div className="w-2 h-2 rounded-sm bg-blue-600/30" />
                    <div className="w-2 h-2 rounded-sm bg-purple-600/60" />
                    <div className="w-2 h-2 rounded-sm bg-cyan-400" />
                  </div>
                  <span>More Activity</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended for You Footer Row */}
          <div className="glass-panel p-4 rounded-3xl border border-white/5 bg-white/5 flex flex-col justify-between relative overflow-hidden flex-shrink-0 select-none">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider pb-2 border-b border-white/5 flex-shrink-0">Recommended for You</h3>
            
            <div className="flex items-center gap-3 overflow-x-auto py-1.5 custom-scrollbar min-h-0 flex-shrink-0">
              {recommended.length === 0 ? (
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">All courses completed or enrolled! Outstanding work!</span>
              ) : (
                recommended.map((course: any) => (
                  <div 
                    key={course.id}
                    onClick={() => {
                      if (course.badge === "Review Required") {
                        router.push(`/courses/${course.language}/curriculum`);
                      } else {
                        router.push("/courses");
                      }
                    }}
                    className="flex-shrink-0 w-64 glass-panel p-2.5 rounded-2xl border border-white/5 hover:border-cyan-500/40 bg-white/5 flex gap-2.5 items-center cursor-pointer transition-all hover:scale-101 group"
                  >
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${
                          course.badge === "Review Required" 
                            ? "bg-red-500/10 border-red-500/20 text-red-400" 
                            : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                        }`}>
                          {course.badge}
                        </span>
                        <div className="flex items-center gap-0.5 text-[9px] text-amber-400 font-bold shrink-0">
                          <Star size={10} className="fill-amber-400" />
                          <span>{course.rating}</span>
                        </div>
                      </div>
                      <h4 className="text-[11px] font-extrabold text-white truncate group-hover:text-cyan-300 transition-colors">{course.title}</h4>
                      <p className="text-[9px] text-slate-400 truncate leading-relaxed">{course.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
