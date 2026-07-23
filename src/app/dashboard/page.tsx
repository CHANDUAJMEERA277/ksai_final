"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { TopNavbar } from "@/components/dashboard/TopNavbar";
import { LeftSidebar } from "@/components/dashboard/LeftSidebar";
import { RightAIPanel } from "@/components/dashboard/RightAIPanel";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { CourseDetailsModal, CourseData } from "@/components/courses/CourseDetailsModal";
import { CoursePlayerModal } from "@/components/courses/CoursePlayerModal";
import { MyCoursesWidget } from "@/components/courses/MyCoursesWidget";
import { Sparkles, Star, BookOpen, Layers } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  const [activeTab, setActiveTab] = useState("Dashboard");
  const [activeSection, setActiveSection] = useState<"catalog" | "my-courses">("catalog");
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
  const [learningCourse, setLearningCourse] = useState<CourseData | null>(null);
 const [user, setUser] = useState<{
  id: string;
  name: string;
  email: string;
  role: string;
  country?: string;
} | null>(null);

  useEffect(() => {
  // Fetch available courses
  fetch("/api/courses")
    .then((res) => res.json())
    .then((data) => {
      if (data.courses) setCourses(data.courses);
    })
    .catch(console.error);

  // Fetch logged-in user
  if (status === "authenticated" && session?.user) {
  const currentUser = {
    id: (session.user as any).id,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    role: (session.user as any).role ?? "Student",
    country: (session.user as any).country,
  };

  setUser(currentUser);

  fetch(`/api/courses/my-courses?email=${currentUser.email}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.enrollments) {
        setEnrollments(data.enrollments);
      }
    })
    .catch(console.error);
}
}, [session, status]);

  
  

  const handlePaymentSuccess = (course: CourseData) => {
    setSelectedCourse(null);
    alert(`🎉 Payment verified for ${course.title}! Unlocked in My Courses.`);

    if (!user) return;

    fetch(`/api/courses/my-courses?email=${user.email}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.enrollments) setEnrollments(data.enrollments);
        setActiveSection("my-courses");
      });
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Top Navbar */}
      <TopNavbar
  userName={user?.name || "Loading..."}
  userRole={user?.role || "Student"}
/>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex w-full">
        {/* Left Sidebar Menu */}
        <LeftSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Center Main Workspace Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full overflow-y-auto">
          {/* Welcome Greeting Header */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-2 bg-gradient-to-r from-blue-950/30 via-[#0C0C16] to-purple-950/30">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-cyan-300 text-xs font-semibold border border-blue-500/20">
              <Sparkles size={13} className="text-cyan-400" /> KnowledgeStream AI &bull; Student Portal
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Welcome Back, {user?.name || "Loading..."} 👋
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              Explore available programming courses with 90-day validity or start learning from your purchased courses.
            </p>
          </div>

          {/* CORE COURSE MARKETPLACE & MY COURSES SECTION */}
          <div className="space-y-4 pt-2">
            {/* Section Switcher Tabs */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveSection("catalog")}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeSection === "catalog"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20"
                      : "glass-panel text-slate-400 hover:text-white"
                  }`}
                >
                  <BookOpen size={15} /> Available Courses (C, C++, Python, Java)
                </button>
                <button
                  onClick={() => setActiveSection("my-courses")}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeSection === "my-courses"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20"
                      : "glass-panel text-slate-400 hover:text-white"
                  }`}
                >
                  <Layers size={15} /> My Courses ({enrollments.length})
                </button>
              </div>

              <span className="text-xs text-cyan-400 font-mono hidden sm:inline">
                90 Days Access &bull; Razorpay Enabled
              </span>
            </div>

            {/* CATALOG VIEW */}
            {activeSection === "catalog" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((c) => (
                  <div
                    key={c.id}
                    className="glass-panel p-5 rounded-3xl border border-white/10 hover:border-blue-500/50 transition-all space-y-4 group cursor-pointer shadow-xl flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 border border-blue-500/30">
                          {c.category} &bull; 90 Days Access
                        </span>
                        <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                          <Star size={13} className="fill-amber-400" />
                          <span>{c.rating}</span>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {c.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {c.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400 font-mono uppercase">Course Price</div>
                        <div className="text-xl font-black text-white font-mono">
                          ₹{c.price} <span className="text-xs font-normal text-slate-400">INR</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedCourse(c)}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 glow-btn"
                      >
                        View Syllabus &amp; Subscribe
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* MY COURSES VIEW */}
            {activeSection === "my-courses" && (
              <MyCoursesWidget
                enrollments={enrollments}
                onStartLearning={(course) => setLearningCourse(course)}
              />
            )}
          </div>

          {/* System Status Footer */}
          <DashboardFooter />
        </main>

        {/* Right Copilot Panel */}
        <RightAIPanel />
      </div>

      {/* Course Details Modal & Razorpay Trigger */}
      {selectedCourse && (
        <CourseDetailsModal
          course={selectedCourse}
          userEmail={user?.email || ""}
          onClose={() => setSelectedCourse(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Interactive Sequential Learning Player Modal */}
      {learningCourse && (
        <CoursePlayerModal
          course={learningCourse}
          onClose={() => setLearningCourse(null)}
        />
      )}
    </div>
  );
}
