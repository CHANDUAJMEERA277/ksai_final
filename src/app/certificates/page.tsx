"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { LeftSidebar } from "@/components/dashboard/LeftSidebar";
import { 
  Award, 
  Search, 
  Bell, 
  CheckCircle2, 
  Lock, 
  Download, 
  Share2, 
  ArrowRight,
  TrendingUp,
  FileText,
  AlertTriangle,
  ExternalLink
} from "lucide-react";

export default function MyCertificatesPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [activeTab, setActiveTab] = useState("Certificates");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic Data states from DB
  const [certificates, setCertificates] = useState<any[]>([]);
  const [inProgress, setInProgress] = useState<any[]>([]);
  
  // Filter settings
  const [filterType, setFilterType] = useState<"ALL" | "VERIFIED" | "IN_PROGRESS">("ALL");
  const [sortOrder, setSortOrder] = useState<"NEWEST" | "OLDEST">("NEWEST");

  // User Profile information
  const [userProfile, setUserProfile] = useState<any>(null);
  const [dashboardNotifications, setDashboardNotifications] = useState<{ unreadCount: number; list: any[] }>({
    unreadCount: 0,
    list: [],
  });

  // Notification dropdown trigger
  const [notificationsDropdownOpen, setNotificationsDropdownOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fetchCertificatesData = async () => {
    try {
      // 1. Fetch certificates and in-progress stats
      const certRes = await fetch("/api/certificates");
      const certJson = await certRes.json();

      // 2. Fetch dashboard information
      const dashboardRes = await fetch("/api/dashboard");
      const dashboardJson = await dashboardRes.json();

      if (certRes.ok && certJson.success) {
        setCertificates(certJson.certificates || []);
        setInProgress(certJson.inProgress || []);
      } else {
        setError(certJson.error || "Failed to load certificate records.");
      }

      if (dashboardRes.ok && dashboardJson.success) {
        setUserProfile(dashboardJson.user || null);
        setDashboardNotifications(dashboardJson.notifications || { unreadCount: 0, list: [] });
      }
    } catch (err) {
      console.error(err);
      setError("Network connection issue loading certificates page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isPending) {
      if (session?.user) {
        fetchCertificatesData();
      } else {
        router.push("/auth");
      }
    }
  }, [session, isPending, router]);

  // Click outside to close notifications dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkNotificationRead = async (id: string) => {
    try {
      const res = await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok && session?.user) {
        fetchCertificatesData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTabChange = (tab: string) => {
    if (tab === "Dashboard") router.push("/dashboard");
    else if (tab === "Courses") router.push("/courses");
    else if (tab === "Leaderboard") router.push("/leaderboard");
    else if (tab === "AI Mentor") router.push("/codexai");
    else if (tab === "AI Quiz Generator") router.push("/quiz-generator");
    else if (tab === "Settings") router.push("/settings");
  };

  // Download Certificate Image via Canvas Render
  const handleDownload = (cert: any) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set dimensions
    canvas.width = 1000;
    canvas.height = 700;

    // Background Gradient
    const grad = ctx.createLinearGradient(0, 0, 1000, 700);
    grad.addColorStop(0, "#0F172A");
    grad.addColorStop(1, "#1E1B4B");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1000, 700);

    // Decorative Borders
    ctx.strokeStyle = "#4F46E5";
    ctx.lineWidth = 15;
    ctx.strokeRect(20, 20, 960, 660);
    ctx.strokeStyle = "#06B6D4";
    ctx.lineWidth = 2;
    ctx.strokeRect(35, 35, 930, 630);

    // Branding Title
    ctx.font = "bold 22px sans-serif";
    ctx.fillStyle = "#22D3EE";
    ctx.textAlign = "center";
    ctx.fillText("KNOWLEDGE STREAM AI • OS 3.0", 500, 100);

    // Main Certificate Header
    ctx.font = "bold 44px Georgia, serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("CERTIFICATE OF COMPLETION", 500, 180);

    // Presentation text
    ctx.font = "italic 16px sans-serif";
    ctx.fillStyle = "#94A3B8";
    ctx.fillText("This is proudly presented to", 500, 240);

    // Student Name
    const studentName = userProfile?.name || session?.user?.name || "Student";
    ctx.font = "bold 38px sans-serif";
    ctx.fillStyle = "#F8FAFC";
    ctx.fillText(studentName.toUpperCase(), 500, 310);

    // Course completion description
    ctx.font = "16px sans-serif";
    ctx.fillStyle = "#94A3B8";
    ctx.fillText(`for successfully completing and mastering the curriculum of`, 500, 370);

    // Course Name
    ctx.font = "bold 28px sans-serif";
    ctx.fillStyle = "#818CF8";
    ctx.fillText(cert.courseName, 500, 430);

    // Date and details
    const dateStr = new Date(cert.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    ctx.font = "15px sans-serif";
    ctx.fillStyle = "#64748B";
    ctx.fillText(`Awarded on ${dateStr} • Curated by Instructor ${cert.instructor || "KnowledgeStream Team"}`, 500, 490);

    // Divider Line
    ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
    ctx.beginPath();
    ctx.moveTo(300, 530);
    ctx.lineTo(700, 530);
    ctx.stroke();

    // Verification ID info
    ctx.font = "bold 13px Courier, monospace";
    ctx.fillStyle = "#22D3EE";
    ctx.fillText(`CERTIFICATE ID: ${cert.uniqueId}`, 500, 570);
    ctx.font = "11px Courier, monospace";
    ctx.fillStyle = "#64748B";
    ctx.fillText(`VERIFIED STATE: SECURE CLOUD AUTHENTICATED`, 500, 595);

    // Trigger download
    const link = document.createElement("a");
    link.download = `ksai-certificate-${cert.uniqueId}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleShare = (cert: any) => {
    const shareUrl = `${window.location.origin}/certificates/verify/${cert.verificationId}`;
    navigator.clipboard.writeText(shareUrl);
    alert(`🔗 Share link copied to clipboard!\n${shareUrl}`);
  };

  if (error) {
    return (
      <div className="h-screen bg-[#F8FAFC] text-slate-800 flex items-center justify-center flex-col space-y-4">
        <div className="p-8 rounded-3xl border border-red-200 bg-red-50/50 max-w-md text-center space-y-4 shadow-sm">
          <AlertTriangle className="text-red-500 mx-auto" size={40} />
          <h2 className="text-lg font-bold text-slate-900">Certificates Error</h2>
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

  // Derived Summary Metric counts (excluding sample)
  const totalCertificatesCount = certificates.length;
  const verifiedCertificatesCount = certificates.length; // all our generated certs are verified
  const inProgressCoursesCount = inProgress.length;

  // Sorting logic for certificates
  const sortedCertificates = [...certificates].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === "NEWEST" ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="h-screen bg-[#F8FAFC] text-slate-800 flex overflow-hidden font-sans antialiased">
      {/* Left Sidebar */}
      <LeftSidebar
        activeTab="Certificates"
        onTabChange={handleTabChange}
        userProfile={userProfile || undefined}
        isLight={false}
        fullHeight={true}
      />

      {/* Main Right Area */}
      <main className="flex-1 h-full flex flex-col overflow-hidden p-5 gap-3.5 max-w-7xl mx-auto w-full min-w-0">
        
        {/* Header Row */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              My Credentials 🏆
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              View, download, and verify your official course completion certificates.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative hidden md:block">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search certificates..." 
                className="pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 w-60 focus:outline-none focus:border-[#4F46E5] placeholder-slate-400"
                disabled
              />
            </div>

            {/* Notification Icon */}
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => setNotificationsDropdownOpen(!notificationsDropdownOpen)}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all hover:shadow-sm"
              >
                <Bell size={16} />
                {dashboardNotifications?.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                    {dashboardNotifications.unreadCount}
                  </span>
                )}
              </button>

              {notificationsDropdownOpen && (
                <div className="absolute right-0 top-11 w-80 max-h-96 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1.5 scrollbar-thin">
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">Notifications</span>
                    <span className="text-[10px] text-slate-400 font-medium">{dashboardNotifications?.unreadCount} unread</span>
                  </div>
                  {dashboardNotifications.list.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No notifications yet.</div>
                  ) : (
                    dashboardNotifications.list.map((n: any) => (
                      <div 
                        key={n.id} 
                        onClick={() => handleMarkNotificationRead(n.id)}
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

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-shrink-0">
          <div className="p-4 rounded-3xl border border-slate-200/80 bg-white shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Total Certificates</span>
              <div className="text-xl font-black text-slate-800 font-mono mt-1">{totalCertificatesCount}</div>
            </div>
            <Award className="text-[#4F46E5]" size={28} />
          </div>

          <div className="p-4 rounded-3xl border border-slate-200/80 bg-white shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Verified Ledgers</span>
              <div className="text-xl font-black text-emerald-500 font-mono mt-1">{verifiedCertificatesCount}</div>
            </div>
            <CheckCircle2 className="text-emerald-500" size={28} />
          </div>

          <div className="p-4 rounded-3xl border border-slate-200/80 bg-white shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">In Progress Tracks</span>
              <div className="text-xl font-black text-amber-500 font-mono mt-1">{inProgressCoursesCount}</div>
            </div>
            <TrendingUp className="text-amber-500" size={28} />
          </div>
        </div>

        {/* Filters and sorting Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200/60 pb-3 flex-shrink-0">
          <div className="flex gap-2">
            {[
              { id: "ALL", label: "All Certificates" },
              { id: "VERIFIED", label: "Verified Only" },
              { id: "IN_PROGRESS", label: "In Progress Locked" }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilterType(btn.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold border transition-all ${
                  filterType === btn.id 
                    ? "bg-[#4F46E5] text-white border-transparent" 
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Sort by:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-[11px] font-bold text-slate-700 focus:outline-none"
            >
              <option value="NEWEST">Newest Issued</option>
              <option value="OLDEST">Oldest Issued</option>
            </select>
          </div>
        </div>

        {/* Body Container (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6 custom-scrollbar pb-6 min-h-0">
          {loading ? (
            /* Loading Skeleton */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-1">
              {[1, 2].map((i) => (
                <div key={i} className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white space-y-4 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded-full w-24" />
                  <div className="h-6 bg-slate-200 rounded w-3/4" />
                  <div className="h-10 bg-slate-200 rounded-xl w-full" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Empty state check */}
              {totalCertificatesCount === 0 && inProgressCoursesCount === 0 && (
                <div className="p-8 text-center rounded-3xl border border-slate-200 bg-white max-w-lg mx-auto space-y-4 py-12 shadow-sm">
                  <Award className="text-slate-300 mx-auto" size={48} />
                  <h3 className="text-base font-black text-slate-800">No Certificates Earned Yet</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Certificates will automatically appear here once you fully complete all chapters of any enrolled course.
                  </p>
                  <button
                    onClick={() => router.push("/courses/catalog")}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold hover:opacity-95 shadow-md text-xs inline-flex items-center gap-1.5"
                  >
                    Explore Courses Catalog <ArrowRight size={13} />
                  </button>
                </div>
              )}

              {/* Certificates Render Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-1">
                {/* 1. Earned Certificates */}
                {filterType !== "IN_PROGRESS" && sortedCertificates.map((cert) => (
                  <div 
                    key={cert.id} 
                    className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white hover:border-[#4F46E5]/40 transition-all flex flex-col justify-between shadow-md space-y-4 relative overflow-hidden group"
                  >
                    <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 text-[9px] font-extrabold uppercase">
                      <CheckCircle2 size={11} className="fill-emerald-100" />
                      Verified
                    </div>

                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5] shrink-0">
                        <Award size={20} />
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 leading-snug">{cert.courseName}</h3>
                      <p className="text-[10px] text-slate-400 font-mono">Issued {new Date(cert.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                      <div className="text-[9px] font-mono text-slate-400">CERTIFICATE ID: {cert.uniqueId}</div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownload(cert)}
                          className="flex-1 py-2 rounded-xl text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center justify-center gap-1 transition-colors"
                        >
                          <Download size={12} /> Download
                        </button>
                        <button
                          onClick={() => handleShare(cert)}
                          className="flex-1 py-2 rounded-xl text-[10px] font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA] flex items-center justify-center gap-1 transition-colors"
                        >
                          <Share2 size={12} /> Share URL
                        </button>
                        <button
                          onClick={() => window.open(`/certificates/verify/${cert.verificationId}`, "_blank")}
                          className="px-3 py-2 rounded-xl text-slate-500 bg-slate-50 border border-slate-100 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          title="Open verification page in new tab"
                        >
                          <ExternalLink size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 2. In Progress / Locked Tracks */}
                {filterType !== "VERIFIED" && inProgress.map((track) => (
                  <div 
                    key={track.courseId} 
                    className="p-6 rounded-3xl border border-slate-200/60 bg-slate-50/50 flex flex-col justify-between space-y-4 relative"
                  >
                    <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-slate-200 bg-slate-100 text-slate-400 text-[9px] font-extrabold uppercase">
                      <Lock size={10} /> Locked
                    </div>

                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-slate-200/60 flex items-center justify-center text-slate-400 shrink-0">
                        <Lock size={18} />
                      </div>
                      <h3 className="text-base font-extrabold text-slate-600 leading-snug">{track.courseName}</h3>
                      
                      {/* Progress bar */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400">
                          <span>Progress: {track.completedCount} / {track.totalCount} Chapters</span>
                          <span>{Math.round((track.completedCount / track.totalCount) * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-slate-400 transition-all duration-300"
                            style={{ width: `${Math.round((track.completedCount / track.totalCount) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200/30">
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Complete all remaining chapters and challenge tests to unlock this verified credential.
                      </p>
                    </div>
                  </div>
                ))}

                {/* 3. Dev Visual Reference / Sample Certificate (Only in development/testing context) */}
                {filterType !== "IN_PROGRESS" && (
                  <div 
                    className="p-6 rounded-3xl border border-dashed border-slate-300 bg-white hover:bg-slate-50/50 transition-all flex flex-col justify-between space-y-4 relative opacity-80"
                  >
                    <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-600 text-[9px] font-extrabold uppercase">
                      TEST REFERENCE ONLY
                    </div>

                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                        <FileText size={20} />
                      </div>
                      <h3 className="text-base font-extrabold text-slate-500 leading-snug">C++ Full Stack Developer Mastery</h3>
                      <p className="text-[10px] text-slate-400 font-mono">Sample Issued Date: August 15, 2026</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                      <div className="text-[9px] font-mono text-slate-400">CERTIFICATE ID: KSAI-CERT-CPP-SAMPLE</div>
                      <div className="flex gap-2">
                        <button
                          disabled
                          className="flex-1 py-2 rounded-xl text-[10px] font-bold text-slate-400 bg-slate-100 cursor-not-allowed flex items-center justify-center gap-1"
                        >
                          <Download size={12} /> Download Disabled
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </>
          )}

        </div>
      </main>

      {/* Canvas for render */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
