"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { LeftSidebar } from "@/components/dashboard/LeftSidebar";
import { CourseDetailsModal, CourseData } from "@/components/courses/CourseDetailsModal";
import { ArrowRight, Sparkles, Star, Search, Bell, AlertTriangle } from "lucide-react";

export default function CourseCatalogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const enrollParam = searchParams.get("enroll");
  const { data: session, isPending } = useSession();

  const [activeTab, setActiveTab] = useState("Explore Courses");
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    level: number;
    xp: number;
    targetXp: number;
    image?: string | null;
  } | null>(null);

  // Notifications State (matching Dashboard)
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<{ unreadCount: number; list: any[] }>({
    unreadCount: 0,
    list: [],
  });
  const notificationsRef = useRef<HTMLDivElement>(null);

  const fetchCatalogData = async (currentUserEmail: string) => {
    try {
      // 1. Fetch all courses
      const coursesRes = await fetch("/api/courses");
      const coursesJson = await coursesRes.json();

      // 2. Fetch enrollments
      const enrollmentsRes = await fetch(`/api/courses/my-courses?email=${currentUserEmail}`);
      const enrollmentsJson = await enrollmentsRes.json();

      // 3. Fetch user dashboard stats (for notifications, user profile with Level/XP)
      const dashboardRes = await fetch("/api/dashboard");
      const dashboardJson = await dashboardRes.json();

      if (coursesJson.success && enrollmentsJson.success) {
        setCourses(coursesJson.courses || []);
        setEnrollments(enrollmentsJson.enrollments || []);
        
        if (dashboardJson.success) {
          setUser(dashboardJson.user || null);
          setNotifications(dashboardJson.notifications || { unreadCount: 0, list: [] });
        }
      } else {
        setError("Failed to load catalog data.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error loading course catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isPending) {
      if (session?.user) {
        fetchCatalogData(session.user.email ?? "");
      } else {
        router.push("/auth");
      }
    }
  }, [session, isPending, router]);

  // Click outside to close notifications dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle auto-open enrollment modal if query param is set
  useEffect(() => {
    if (!loading && courses.length > 0 && enrollParam) {
      const matchedCourse = courses.find(
        (c) => c.language === enrollParam.toLowerCase()
      );
      if (matchedCourse) {
        const isAlreadyEnrolled = enrollments.some(
          (e) => e.courseId === matchedCourse.id || e.course?.id === matchedCourse.id
        );
        if (!isAlreadyEnrolled) {
          setSelectedCourse(matchedCourse);
        }
      }
    }
  }, [loading, courses, enrollParam, enrollments]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const res = await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notificationId })
      });
      if (res.ok && session?.user) {
        // Refresh notifications
        fetchCatalogData(session.user.email ?? "");
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

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
    }
  };

  const handlePaymentSuccess = (course: CourseData) => {
    // Add new enrollment to local state to reflect purchase immediately
    setEnrollments((prev) => [...prev, { courseId: course.id, course }]);
    setSelectedCourse(null);
    alert(`🎉 Success! You have enrolled in ${course.title}.`);
    if (session?.user) {
      fetchCatalogData(session.user.email ?? "");
    }
  };

  const handleStartLearning = (course: CourseData) => {
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

  if (error) {
    return (
      <div className="h-screen bg-[#F8FAFC] text-slate-800 flex items-center justify-center flex-col space-y-4">
        <div className="p-8 rounded-3xl border border-red-200 bg-red-50/50 max-w-md text-center space-y-4 shadow-sm">
          <AlertTriangle className="text-red-500 mx-auto" size={40} />
          <h2 className="text-lg font-bold text-slate-900">Catalog Error</h2>
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

  return (
    <div className="h-screen bg-[#F8FAFC] text-slate-800 flex overflow-hidden font-sans antialiased">
      {/* Left Sidebar Menu */}
      <LeftSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        userProfile={user || undefined}
        isLight={false}
        fullHeight={true}
      />

      {/* Main Right Workspace Content Area */}
      <main className="flex-1 h-full flex flex-col overflow-hidden p-5 gap-3.5 max-w-7xl mx-auto w-full min-w-0">
        {/* Header Row */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Explore Available Courses 🎓
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              Discover industry-grade curricula. Subscribe via Razorpay or start learning.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative hidden md:block">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search courses, topics..." 
                className="pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 w-60 focus:outline-none focus:border-[#4F46E5] placeholder-slate-400"
                disabled
              />
            </div>

            {/* Notification Icon */}
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all hover:shadow-sm"
              >
                <Bell size={16} />
                {notifications?.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                    {notifications.unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-11 w-80 max-h-96 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1.5 scrollbar-thin">
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
                        className={`p-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer border ${
                          n.read ? "bg-white border-transparent text-slate-500" : "bg-blue-50/40 border-slate-100 text-slate-800 hover:bg-blue-50/70"
                        }`}
                      >
                        {n.message}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable grid area */}
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar pb-6 min-h-0">
          {loading ? (
            /* Loading Skeleton */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-1">
              {[1, 2, 3, 4].map((i) => (
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
          ) : (
            /* Courses Catalog Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-1">
              {courses.map((c) => {
                const isPurchased = enrollments.some((e) => e.courseId === c.id || e.course?.id === c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      if (isPurchased) {
                        handleStartLearning(c);
                      } else {
                        setSelectedCourse(c);
                      }
                    }}
                    className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white hover:border-blue-500/50 hover:bg-slate-50/50 transition-all space-y-4 shadow-md flex flex-col justify-between cursor-pointer group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                          {c.category} &bull; 90 Days Access
                        </span>
                        <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                          <Star size={13} className="fill-amber-400" />
                          <span>{c.rating}</span>
                        </div>
                      </div>

                      <h3 className="text-lg font-extrabold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                        {c.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {c.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400 font-mono uppercase leading-none">Course Price</div>
                        <div className="text-lg font-black text-slate-800 font-mono mt-1">
                          ₹{c.price} <span className="text-xs font-normal text-slate-400">INR</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isPurchased) {
                            handleStartLearning(c);
                          } else {
                            setSelectedCourse(c);
                          }
                        }}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 hover:opacity-95 shadow-md transition-all flex items-center gap-1.5"
                      >
                        {isPurchased ? "Start Learning" : "View Syllabus & Subscribe"} <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Course Details Modal */}
      {selectedCourse && (
        <CourseDetailsModal
          course={selectedCourse}
          userEmail={user?.email || session?.user?.email || ""}
          onClose={() => setSelectedCourse(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
