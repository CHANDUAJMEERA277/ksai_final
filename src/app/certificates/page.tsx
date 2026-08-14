"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award, ShieldCheck, CheckCircle2, Download, Printer, Share2, Eye,
  Sparkles, BookOpen, Clock, Lock, CheckCircle, ExternalLink, X
} from "lucide-react";
import { useNotification } from "@/components/ui/NotificationContext";
import { LeftSidebar } from "@/components/dashboard/LeftSidebar";

interface CertificateItem {
  certificateId: string;
  courseId: string;
  courseTitle: string;
  courseLanguage: string;
  courseLevel: string;
  instructor: string;
  studentName: string;
  studentCollege: string;
  studentDepartment: string;
  progress: number;
  completedChapters: number;
  totalChapters: number;
  isCompleted: boolean;
  issueDate: string | null;
  enrolledAt: string;
}

function CertificatesContent() {
  const router = useRouter();
  const { notify } = useNotification();
  const session = useSession();
  const sessionUser = (session?.data as any)?.user ?? null;
  const isPending = session?.isPending ?? false;

  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);
  const certPrintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPending) {
      if (sessionUser?.email) {
        fetch(`/api/certificates/my-certificates?email=${encodeURIComponent(sessionUser.email)}`)
          .then((r) => r.json())
          .then((d) => {
            setCertificates(d.certificates || []);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      } else {
        router.push("/auth");
      }
    }
  }, [isPending, sessionUser, router]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = (cert: CertificateItem) => {
    const shareUrl = `${window.location.origin}/certificates?certId=${cert.certificateId}`;
    navigator.clipboard.writeText(shareUrl);
    notify("Certificate verification link copied to clipboard!", "success");
  };

  const completedCount = certificates.filter((c) => c.isCompleted || c.progress >= 100).length;

  return (
    <div className="h-screen bg-[#F8FAFC] text-slate-800 flex overflow-hidden font-sans antialiased">
      {/* Unified Left Sidebar */}
      <LeftSidebar
        activeTab="Certificates"
        onTabChange={(tab) => {
          if (tab === "Dashboard") router.push("/dashboard");
          else if (tab === "Explore Courses") router.push("/courses/catalog");
          else if (tab === "Courses") router.push("/courses");
          else if (tab === "Leaderboard") router.push("/leaderboard");
          else if (tab === "AI Mentor") router.push("/codexai");
          else if (tab === "AI Quiz Generator") router.push("/quiz-generator");
          else if (tab === "Workspace") router.push("/workspace");
          else if (tab === "Certificates") router.push("/certificates");
          else if (tab === "Settings") router.push("/settings");
        }}
        fullHeight={true}
      />

      {/* Main Content Workspace - 100vh Viewport */}
      <main className="flex-1 h-full overflow-hidden p-4 sm:p-5 flex flex-col gap-3.5 w-full max-w-[1600px] mx-auto">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Award size={22} />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-tight">Official Certificates &amp; Verified Credentials 📜</h1>
              <p className="text-[11px] text-slate-500 font-medium">Verified Certificates of Completion issued in your name upon finishing courses.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black flex items-center gap-1.5">
              <Award size={15} className="text-amber-600" /> {completedCount} Earned Certificates
            </span>
            <button onClick={() => router.push('/dashboard')} className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-black text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer">
              Dashboard
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-xs font-mono font-bold text-slate-500">
              Loading your verified certificates...
            </div>
          ) : certificates.length === 0 ? (
            <div className="flex-1 bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <BookOpen size={32} />
              </div>
              <h3 className="text-base font-black text-slate-900">No Enrolled Courses Found</h3>
              <p className="text-xs text-slate-500 max-w-md">
                Enroll in a course from our catalog, complete all chapters, and earn your official KnowledgeStream AI Certificate of Completion!
              </p>
              <button
                onClick={() => router.push("/courses/catalog")}
                className="mt-2 px-5 py-2.5 rounded-xl bg-[#4F46E5] text-white text-xs font-black hover:bg-[#4338CA] transition cursor-pointer"
              >
                Browse Course Catalog
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {certificates.map((cert) => {
                  const isUnlocked = cert.isCompleted || cert.progress >= 100;
                  return (
                    <div
                      key={cert.courseId}
                      className={`p-5 rounded-2xl border transition duration-200 flex flex-col justify-between space-y-4 ${
                        isUnlocked
                          ? "bg-gradient-to-br from-amber-50/60 via-white to-indigo-50/40 border-amber-300 ring-1 ring-amber-100 shadow-sm"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            isUnlocked ? "bg-amber-100 text-amber-900 border border-amber-200" : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}>
                            {cert.courseLanguage.toUpperCase()} &bull; {cert.courseLevel}
                          </span>

                          <span className={`text-[11px] font-extrabold flex items-center gap-1 ${
                            isUnlocked ? "text-emerald-700" : "text-slate-500"
                          }`}>
                            {isUnlocked ? (
                              <><CheckCircle2 size={15} className="text-emerald-600" /> Verified</>
                            ) : (
                              <><Lock size={14} /> {cert.progress}% Complete</>
                            )}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-black text-slate-900 leading-snug">{cert.courseTitle}</h3>
                          <p className="text-xs font-bold text-slate-500 mt-1">Issued to: <span className="text-slate-900">{cert.studentName}</span></p>
                          <p className="text-[11px] font-medium text-slate-400">{cert.studentCollege}</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                          <span>Course Progress:</span>
                          <span className={isUnlocked ? "text-emerald-600 font-black" : "text-slate-700"}>
                            {cert.completedChapters}/{cert.totalChapters} Chapters ({cert.progress}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 rounded-full ${
                              isUnlocked ? "bg-gradient-to-r from-amber-500 to-emerald-500" : "bg-[#4F46E5]"
                            }`}
                            style={{ width: `${Math.min(100, cert.progress)}%` }}
                          />
                        </div>
                      </div>

                      {/* Certificate Actions */}
                      <div className="pt-2">
                        {isUnlocked ? (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setSelectedCert(cert)}
                              className="w-full py-2 px-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Eye size={14} /> View Certificate
                            </button>
                            <button
                              onClick={() => handleShare(cert)}
                              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Share2 size={14} /> Share
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedCert(cert)}
                            className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Award size={14} /> Claim Certificate ({cert.progress}%)
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* FULL-SCREEN LUXURY CERTIFICATE MODAL */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
              {/* Modal Top Actions */}
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
                <div className="flex items-center gap-2">
                  <Award className="text-amber-400" size={20} />
                  <span className="text-xs font-black tracking-wide">KnowledgeStream AI Verified Certificate</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer size={14} /> Print / Save PDF
                  </button>
                  <button
                    onClick={() => handleShare(selectedCert)}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Share2 size={14} /> Share Link
                  </button>
                  <button
                    onClick={() => setSelectedCert(null)}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* PRINTABLE CERTIFICATE FRAME */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-50 flex items-center justify-center">
                <div
                  ref={certPrintRef}
                  className="w-full max-w-3xl bg-white p-8 sm:p-12 rounded-2xl border-8 border-double border-amber-600/60 shadow-xl relative text-center space-y-6 text-slate-900 select-none print:shadow-none print:border-amber-600 print:w-full"
                  style={{
                    backgroundImage: "radial-gradient(circle at center, rgba(251, 191, 36, 0.05) 0%, transparent 70%)",
                  }}
                >
                  {/* Decorative Corner Seals */}
                  <div className="absolute top-4 left-4 text-xs font-mono font-bold text-amber-700/60 uppercase tracking-widest">
                    {selectedCert.certificateId}
                  </div>
                  <div className="absolute top-4 right-4 text-xs font-mono font-bold text-emerald-700/80 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck size={14} /> VERIFIED CREDENTIAL
                  </div>

                  {/* Header */}
                  <div className="space-y-2 pt-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-black border border-amber-200">
                      <Sparkles size={14} className="text-amber-600" /> KNOWLEDGESTREAM AI ACADEMY
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 font-serif">
                      Certificate of Completion
                    </h2>
                    <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-slate-400">
                      THIS OFFICIALLY CERTIFIES THAT
                    </p>
                  </div>

                  {/* Student Name */}
                  <div className="py-2 border-b-2 border-amber-500/40 inline-block px-8">
                    <h1 className="text-3xl sm:text-4xl font-black text-[#4F46E5] font-sans tracking-tight">
                      {selectedCert.studentName}
                    </h1>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-lg mx-auto leading-relaxed">
                    has successfully completed the comprehensive curriculum and practical assessments for
                  </p>

                  {/* Course Title */}
                  <div className="py-3 bg-amber-50/50 rounded-2xl border border-amber-200/80 max-w-xl mx-auto">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                      {selectedCert.courseTitle}
                    </h3>
                    <p className="text-xs font-bold text-amber-900 mt-1 uppercase tracking-wider">
                      {selectedCert.courseLanguage.toUpperCase()} &bull; {selectedCert.courseLevel} Level Mastery
                    </p>
                  </div>

                  {/* Details Footer */}
                  <div className="pt-6 grid grid-cols-3 items-end border-t border-slate-200 text-center gap-4 text-xs">
                    <div>
                      <div className="font-serif font-black text-slate-900 text-sm italic">Ajmeera Chandu</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase border-t border-slate-300 pt-1 mt-1">
                        Academic Director
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-md border-2 border-white">
                        <Award size={28} />
                      </div>
                      <div className="text-[9px] font-black text-amber-800 uppercase tracking-widest mt-1">
                        Official Seal
                      </div>
                    </div>

                    <div>
                      <div className="font-mono font-bold text-slate-900 text-xs">
                        {selectedCert.issueDate ? new Date(selectedCert.issueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase border-t border-slate-300 pt-1 mt-1">
                        Date Issued
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CertificatesPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#F8FAFC] flex items-center justify-center text-xs font-mono font-bold text-slate-500">Loading Certificates...</div>}>
      <CertificatesContent />
    </Suspense>
  );
}
