"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { LeftSidebar } from "@/components/dashboard/LeftSidebar";
import { RightAIPanel } from "@/components/dashboard/RightAIPanel";
import { Sparkles, BookOpen, Star, Clock, Compass, ShieldCheck, CheckCircle } from "lucide-react";

interface CourseCatalogItem {
  id: string;
  title: string;
  description: string;
  language: string;
  price: number;
  level: string;
  category: string;
  thumbnail: string;
  duration: string;
  lessons: number;
  rating: number;
  instructor: string;
}

interface EnrollmentItem {
  id: string;
  courseId: string;
}

export default function ExploreCoursesCatalogPage() {
  const router = useRouter();
  const sessionData = useSession();
  const session = (sessionData?.data as any) ?? null;
  const isPending = sessionData?.isPending ?? false;

  const [activeTab, setActiveTab] = useState("Explore Courses");
  const [courses, setCourses] = useState<CourseCatalogItem[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingCourseId, setBuyingCourseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
  } | null>(null);

  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successCourseLanguage, setSuccessCourseLanguage] = useState("");

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const fetchCatalogAndEnrollments = async (email: string) => {
    try {
      const [coursesRes, enrollmentsRes] = await Promise.all([
        fetch("/api/courses"),
        fetch(`/api/courses/my-courses?email=${email}`)
      ]);

      const coursesData = await coursesRes.json();
      const enrollmentsData = await enrollmentsRes.json();

      if (Array.isArray(coursesData)) {
        setCourses(coursesData);
      } else if (coursesData.success && Array.isArray(coursesData.courses)) {
        setCourses(coursesData.courses);
      }

      if (enrollmentsData.enrollments) {
        setEnrollments(enrollmentsData.enrollments);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Unable to load course catalog details.");
    } finally {
      setLoading(false);
    }
  };

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
        fetchCatalogAndEnrollments(currentUser.email);
      } else {
        router.push("/auth");
      }
    }
  }, [session, isPending, router]);

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

  const handleBuyCourse = async (course: CourseCatalogItem) => {
    if (!user) return;
    setBuyingCourseId(course.id);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load Razorpay SDK. Please check your internet connection.");
        setBuyingCourseId(null);
        return;
      }

      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: course.price,
          currency: "INR",
          courseId: course.id,
          userEmail: user.email,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Order creation failed.");
        setBuyingCourseId(null);
        return;
      }

      const { isMock } = data;

      if (isMock) {
        alert("🔧 Local Dev Mode: Simulating Razorpay Payment Gateway. Click OK to confirm purchase.");
        
        const enrollRes = await fetch("/api/courses/enroll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail: user.email,
            courseId: course.id,
            paidAmount: course.price,
            paymentId: `pay_mock_${Date.now()}`,
          }),
        });

        const enrollData = await enrollRes.json();
        if (enrollData.success) {
          setSuccessCourseLanguage(course.language.toLowerCase());
          setShowSuccessModal(true);
          // Refresh enrollments list
          fetchCatalogAndEnrollments(user.email);
        } else {
          alert(enrollData.error || "Enrollment failed.");
        }
      } else {
        const options = {
          key: data.key,
          amount: data.order.amount,
          currency: data.order.currency,
          name: "KnowledgeStream AI",
          description: course.title,
          order_id: data.order.id,
          handler: async function (response: any) {
            const enrollRes = await fetch("/api/courses/enroll", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userEmail: user.email,
                courseId: course.id,
                paidAmount: course.price,
                paymentId: response.razorpay_payment_id,
              }),
            });
            const enrollData = await enrollRes.json();
            if (enrollData.success) {
              setSuccessCourseLanguage(course.language.toLowerCase());
              setShowSuccessModal(true);
              fetchCatalogAndEnrollments(user.email);
            } else {
              alert(enrollData.error || "Enrollment failed.");
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to complete checkout order.");
    } finally {
      setBuyingCourseId(null);
    }
  };

  return (
    <div className="h-screen bg-[#F8FAFC] text-[#0F172A] flex overflow-hidden font-sans antialiased">
      {/* Left Sidebar Menu */}
      <LeftSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        userProfile={user || undefined}
        isLight={false}
        fullHeight={true}
      />

      {/* Center Main Workspace Content Area */}
      <main data-lenis-prevent className="flex-1 overflow-y-auto h-full p-4 sm:p-6 lg:p-8 space-y-6 w-full custom-scrollbar bg-slate-50">
        
        {/* Welcome Header */}
        <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1 flex-shrink-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-semibold border border-blue-100">
            <Sparkles size={12} /> Professional Paths &bull; Browse Catalog
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Explore Available Courses 🚀
          </h1>
          <p className="text-slate-500 text-xs font-medium">
            Unlock access to interactive curricula, Sandbox coding workspaces, speech modules, and AI Mentor tutoring.
          </p>
        </div>

        {loading ? (
          /* Loading Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 py-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-panel p-4 rounded-2xl border border-slate-200 bg-white space-y-3 animate-pulse">
                <div className="h-24 bg-slate-200 rounded-xl w-full" />
                <div className="h-3 bg-slate-200 rounded w-1/4" />
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-5/6" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-slate-500 text-xs font-medium">{error}</div>
        ) : (
          /* Courses Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {courses.map((course) => {
              const isEnrolled = enrollments.some((e) => e.courseId === course.id);
              const isBuying = buyingCourseId === course.id;

              return (
                <div
                  key={course.id}
                  className="glass-panel rounded-2xl border border-slate-200/90 bg-white hover:border-[#4F46E5]/50 transition-all duration-300 shadow-xs flex flex-col justify-between overflow-hidden group hover:shadow-md"
                >
                  <div
                    onClick={() => {
                      if (isEnrolled) {
                        router.push(`/courses/${course.language.toLowerCase()}`);
                      } else {
                        router.push(`/courses/${course.language.toLowerCase()}/curriculum`);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    {/* Thumbnail Banner */}
                    <div className="relative h-28 w-full overflow-hidden">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20 uppercase">
                          {course.level}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-amber-400 font-extrabold bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full">
                          <Star size={11} className="fill-amber-400 text-amber-400" />
                          <span>{course.rating}</span>
                        </div>
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-3.5 space-y-1">
                      <span className="text-[9px] font-mono font-black text-[#4F46E5] uppercase tracking-wider block">
                        {course.category}
                      </span>
                      <h3 className="text-sm font-extrabold text-slate-900 leading-snug group-hover:text-[#4F46E5] transition-colors truncate">
                        {course.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-snug font-medium">
                        {course.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer specs & purchase triggers */}
                  <div className="px-3.5 py-2 border-t border-slate-100 flex items-center justify-between bg-slate-50/60">
                    <div className="flex flex-col text-[9px] text-slate-500 font-mono leading-tight">
                      <span className="flex items-center gap-1 font-bold">
                        <Clock size={11} className="text-slate-400" /> {course.lessons} Lessons
                      </span>
                      <span className="truncate max-w-[120px]">By {course.instructor}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-black text-slate-900">
                        ₹{course.price}
                      </span>
                      
                      {isEnrolled ? (
                        <button
                          onClick={() => router.push(`/courses/${course.language.toLowerCase()}`)}
                          className="px-3 py-1.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 shadow-xs flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <CheckCircle size={12} />
                          Learn Now
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBuyCourse(course);
                          }}
                          disabled={isBuying}
                          className="px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 hover:opacity-95 disabled:opacity-50 shadow-md shadow-blue-500/15 flex items-center gap-1"
                        >
                          <Sparkles size={12} className="animate-pulse" />
                          {isBuying ? "Connecting..." : "Subscribe"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Right Copilot Panel */}
      <RightAIPanel />

      {/* Subscription Success Modal Overlay */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 text-center space-y-6 shadow-2xl animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 mx-auto animate-bounce">
              <ShieldCheck size={36} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Subscription Confirmed! 🎉
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Subscribed! You now have access to this course. Your sandbox workspace, notes, chatbot, and exams are fully unlocked.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push(`/courses/${successCourseLanguage}`);
                }}
                className="w-full py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 hover:opacity-95 transition-opacity shadow-md"
              >
                Go directly to the course
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
              >
                Return to Explore Courses
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
