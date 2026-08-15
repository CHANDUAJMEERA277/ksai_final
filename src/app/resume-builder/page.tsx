"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { LeftSidebar } from "@/components/dashboard/LeftSidebar";
import {
  FileText,
  Upload,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Printer,
  Download,
  Plus,
  Trash2,
  RefreshCw,
  Zap,
  Globe,
  Mail,
  Phone,
  MapPin,
  User,
  Briefcase,
  Code2,
  GraduationCap,
  ArrowLeft,
  FileCheck,
  Check
} from "lucide-react";

// Initial Candidate Data
const DEFAULT_CANDIDATE = {
  fullName: "Ajmeera Chandu",
  jobTitle: "Senior Full-Stack AI Engineer",
  email: "chandu@knowledgestream.ai",
  phone: "+91 98765 43210",
  location: "Hyderabad, India",
  githubUrl: "github.com/CHANDUAJMEERA277",
  summary:
    "Full-Stack AI Engineer with 4+ years of experience architecting high-performance web applications, real-time code execution engines, and generative AI microservices.",
  skills: [
    "TypeScript / JavaScript",
    "React / Next.js 16",
    "Java Enterprise (Spring Boot)",
    "Python / FastAPI / AI",
    "SQLite / PostgreSQL / Prisma",
    "TailwindCSS & Framer Motion",
    "Docker & Cloud CI/CD",
  ],
  experience: [
    {
      id: "exp-1",
      company: "KnowledgeStream AI",
      role: "Lead Full-Stack AI Developer",
      startDate: "2025",
      endDate: "Present",
      bullets: [
        "Architected real-time browser sandbox code editor and execution pipeline with 99.9% uptime.",
        "Integrated Gemini Flash AI engine for speech-to-code dictation and automated guided debugging.",
        "Decreased page bundle size by 38% utilizing Next.js Turbopack SSR.",
      ],
    },
  ],
  projects: [
    {
      id: "proj-1",
      title: "Codenthra AI Coding Workspace",
      techStack: "Next.js 16, TypeScript, Prisma, Gemini AI",
      bullets: [
        "Engineered LeetCode-style green activity matrix tracking daily streak activity.",
        "Implemented weekly goal locks and automated target alerts boosting retention by 35%.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "State Technological University",
      degree: "B.Tech in Computer Science & AI",
      startDate: "2022",
      endDate: "2026",
    },
  ],
};

// Sample JDs for quick testing
const SAMPLE_JDS = [
  {
    title: "Google - Senior Full-Stack AI Engineer",
    text: `Looking for a Senior Full-Stack AI Engineer to build cloud developer tools using Next.js 16, React, TypeScript, and TailwindCSS. Integrate Gemini AI models for real-time code execution, speech dictation, and automated debugging. Experience in Java Spring Boot or Python FastAPI microservices required.`,
  },
  {
    title: "Amazon AWS - Backend Java Specialist",
    text: `Seeking Backend Java Engineer to design high-concurrency microservices using Java 21, Spring Boot, Kafka, Redis, and PostgreSQL. Implement unit testing, CI/CD pipelines, and sub-10ms API routing.`,
  },
];

export default function SimpleResumeBuilder() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  // 3-Step Wizard: 1 = Upload JD, 2 = Candidate Info, 3 = AI Resume Preview
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1 State: Job Description
  const [jdText, setJdText] = useState(SAMPLE_JDS[0].text);
  const [jdFileName, setJdFileName] = useState<string | null>(null);

  // Step 2 State: Candidate Info
  const [candidate, setCandidate] = useState(DEFAULT_CANDIDATE);
  const [newSkill, setNewSkill] = useState("");

  // Step 3 State: Generated Resume & AI Output
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [atsScore, setAtsScore] = useState(96);
  const [extractedKeywords, setExtractedKeywords] = useState<string[]>([]);
  const [aiSummary, setAiSummary] = useState("");

  // User Profile
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
        setCandidate((prev) => ({
          ...prev,
          fullName: currentUser.name || prev.fullName,
          email: currentUser.email || prev.email,
        }));
      } else {
        router.push("/auth");
      }
    }
  }, [session, isPending, router]);

  const handleSidebarTabChange = (tab: string) => {
    if (tab === "Dashboard") router.push("/dashboard");
    else if (tab === "Courses") router.push("/courses");
    else if (tab === "Leaderboard") router.push("/leaderboard");
    else if (tab === "AI Mentor") router.push("/codexai");
    else if (tab === "AI Quiz Generator") router.push("/quiz-generator");
  };

  // Handle PDF / Text File Upload for JD
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setJdFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setJdText(content);
        }
      };
      reader.readAsText(file);
    }
  };

  // Step 2 -> 3: AI Resume Generation
  const handleGenerateAIResume = async () => {
    setIsGeneratingAI(true);
    setCurrentStep(3);

    try {
      const res = await fetch("/api/ai/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "align_with_jd",
          jobDescription: jdText,
          targetRole: candidate.jobTitle,
          company: "Target Employer",
          resumeData: candidate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAtsScore(data.score || 96);
        setAiSummary(data.tailoredSummary || candidate.summary);
        setExtractedKeywords(data.missingKeywords || ["CI/CD Pipelines", "System Architecture", "Docker", "REST APIs"]);

        // Auto add missing JD keywords to candidate skills
        if (data.missingKeywords) {
          setCandidate((prev) => {
            const updated = [...prev.skills];
            data.missingKeywords.forEach((k: string) => {
              if (!updated.includes(k)) updated.push(k);
            });
            return {
              ...prev,
              summary: data.tailoredSummary || prev.summary,
              skills: updated,
            };
          });
        }
      }
    } catch (e) {
      console.error("AI Generation Error:", e);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-screen bg-[#F8FAFC] text-slate-800 flex overflow-hidden font-sans antialiased">
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          aside, nav, .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            overflow: visible !important;
          }
          .print-area {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            transform: none !important;
            padding: 0 !important;
            background: white !important;
          }
        }
      `}</style>

      {/* Left Sidebar */}
      <LeftSidebar
        activeTab="Resume Builder"
        onTabChange={handleSidebarTabChange}
        userProfile={user || undefined}
        isLight={false}
        fullHeight={true}
      />

      {/* Main Container */}
      <main data-lenis-prevent className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-[#F8FAFC]">
        {/* Top Header & Simple 3-Step Bar */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-xs no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-sm">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 tracking-tight">
                Codenthra AI Resume Builder
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Upload JD PDF ➔ Enter Details ➔ Instant ATS Resume PDF
              </p>
            </div>
          </div>

          {/* Simple 3-Step Wizard Navigation Pills */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setCurrentStep(1)}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                currentStep === 1
                  ? "bg-blue-600 text-white shadow-sm font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Upload size={14} /> 1. Upload JD
            </button>
            <span className="text-slate-300">➔</span>
            <button
              onClick={() => setCurrentStep(2)}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                currentStep === 2
                  ? "bg-blue-600 text-white shadow-sm font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <User size={14} /> 2. Your Details
            </button>
            <span className="text-slate-300">➔</span>
            <button
              onClick={() => setCurrentStep(3)}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                currentStep === 3
                  ? "bg-blue-600 text-white shadow-sm font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileCheck size={14} /> 3. AI Generated Resume
            </button>
          </div>
        </div>

        {/* Workspace Body by Step */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
          {/* STEP 1: UPLOAD / PASTE JOB DESCRIPTION (JD) */}
          {currentStep === 1 && (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in zoom-in-95">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-extrabold">
                  <Upload size={14} /> Step 1 of 3
                </div>
                <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                  Add Target Job Description (JD)
                </h2>
                <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
                  Upload job description PDF/Text file or paste text below. Codenthra AI will extract keywords & align your resume 100%!
                </p>
              </div>

              {/* PDF Drag & Drop Upload Zone */}
              <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 hover:border-blue-500 transition-all p-8 text-center space-y-4 shadow-xs relative">
                <input
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
                  <Upload size={28} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    {jdFileName ? `Uploaded: ${jdFileName}` : "Click to Upload Job Description PDF / TXT"}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    Supports .pdf, .txt, .docx files
                  </p>
                </div>
              </div>

              {/* Quick Sample Presets */}
              <div className="space-y-2">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                  Or select a sample job description:
                </span>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_JDS.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setJdText(s.text);
                        setJdFileName(null);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 text-blue-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs"
                    >
                      <CheckCircle2 size={14} className="text-blue-600" /> {s.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* JD Text Area */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-2 shadow-xs">
                <label className="text-xs font-black text-slate-900 block">
                  Job Description Requirements Text
                </label>
                <textarea
                  rows={6}
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white leading-relaxed custom-scrollbar"
                  placeholder="Paste the target job description requirements here..."
                />
              </div>

              {/* Next Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 rounded-2xl text-xs font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  Continue to Enter Your Details <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CANDIDATE DETAILS */}
          {currentStep === 2 && (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in zoom-in-95">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-extrabold">
                  <User size={14} /> Step 2 of 3
                </div>
                <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                  Enter Your Candidate Details
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Provide your basic info. Codenthra AI will format and match keywords automatically!
                </p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-xs">
                <h3 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                  <User size={16} className="text-blue-600" /> Personal Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-600 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={candidate.fullName}
                      onChange={(e) => setCandidate({ ...candidate, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-600 block mb-1">Target Role Title</label>
                    <input
                      type="text"
                      value={candidate.jobTitle}
                      onChange={(e) => setCandidate({ ...candidate, jobTitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-600 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={candidate.email}
                      onChange={(e) => setCandidate({ ...candidate, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-600 block mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={candidate.phone}
                      onChange={(e) => setCandidate({ ...candidate, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-black text-slate-900 block flex items-center gap-2">
                    <Code2 size={16} className="text-cyan-600" /> Core Skills & Technologies
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills.map((s, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-2.5 rounded-2xl text-xs font-extrabold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={16} /> Back to JD
                </button>
                <button
                  onClick={handleGenerateAIResume}
                  className="px-6 py-3 rounded-2xl text-xs font-extrabold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-95 shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Zap size={16} className="text-yellow-300 fill-yellow-300" /> ✨ Generate AI Resume
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: AI GENERATED RESUME & PDF PREVIEW */}
          {currentStep === 3 && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95">
              {isGeneratingAI ? (
                <div className="py-20 text-center space-y-4 bg-white rounded-3xl border border-slate-200 shadow-xs">
                  <RefreshCw size={36} className="animate-spin text-blue-600 mx-auto" />
                  <h3 className="text-base font-black text-slate-900">
                    Codenthra AI is matching your resume with the Job Description...
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">Injecting JD keywords & optimizing formatting for 95%+ ATS Score</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Top Result Banner */}
                  <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white flex flex-wrap items-center justify-between gap-4 shadow-lg no-print">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-0.5 rounded-full bg-white/20 text-white text-xs font-black">
                          {atsScore}% ATS Match Score
                        </span>
                        <span className="text-xs font-bold text-cyan-200">✨ Optimized for Target JD</span>
                      </div>
                      <h3 className="text-lg font-black tracking-tight">{candidate.fullName} - {candidate.jobTitle}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        Edit Details
                      </button>
                      <button
                        onClick={handlePrint}
                        className="px-5 py-2 rounded-xl text-xs font-extrabold text-slate-900 bg-cyan-300 hover:bg-cyan-200 shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Printer size={15} /> Download PDF
                      </button>
                    </div>
                  </div>

                  {/* High Resolution A4 Document Paper */}
                  <div className="bg-slate-200/60 p-6 sm:p-10 rounded-3xl flex justify-center custom-scrollbar print-area">
                    <div className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-2xl rounded-sm p-8 sm:p-12 font-sans space-y-5">
                      {/* Header */}
                      <div className="border-b-2 border-blue-600 pb-4 mb-4">
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight uppercase">
                          {candidate.fullName}
                        </h1>
                        <p className="text-xs font-extrabold text-blue-600 uppercase tracking-widest mt-1">
                          {candidate.jobTitle}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-600 font-semibold mt-3">
                          <span>📧 {candidate.email}</span> &bull;
                          <span>📞 {candidate.phone}</span> &bull;
                          <span>📍 {candidate.location}</span> &bull;
                          <span>🌐 {candidate.githubUrl}</span>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="space-y-1">
                        <h2 className="text-xs font-black text-blue-700 uppercase tracking-widest border-b border-slate-200 pb-1">
                          Professional Summary (JD Tailored)
                        </h2>
                        <p className="text-[11px] text-slate-700 leading-relaxed font-medium pt-1">
                          {aiSummary || candidate.summary}
                        </p>
                      </div>

                      {/* Core Skills */}
                      <div className="space-y-1.5">
                        <h2 className="text-xs font-black text-blue-700 uppercase tracking-widest border-b border-slate-200 pb-1">
                          Core Technical Skills & Stack
                        </h2>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {candidate.skills.map((s, idx) => (
                            <span key={idx} className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-900 text-[10.5px] font-extrabold border border-blue-200">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Experience */}
                      <div className="space-y-3">
                        <h2 className="text-xs font-black text-blue-700 uppercase tracking-widest border-b border-slate-200 pb-1">
                          Work Experience
                        </h2>
                        {candidate.experience.map((exp) => (
                          <div key={exp.id} className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-black text-slate-950">
                              <span>{exp.role} &bull; <span className="text-blue-600">{exp.company}</span></span>
                              <span className="text-[10px] text-slate-500 font-mono font-bold">{exp.startDate} - {exp.endDate}</span>
                            </div>
                            <ul className="list-disc list-inside text-[10.5px] text-slate-800 space-y-1 pt-1 font-medium leading-relaxed">
                              {exp.bullets.map((b, idx) => (
                                <li key={idx}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      {/* Projects */}
                      <div className="space-y-3">
                        <h2 className="text-xs font-black text-blue-700 uppercase tracking-widest border-b border-slate-200 pb-1">
                          Featured Projects
                        </h2>
                        {candidate.projects.map((proj) => (
                          <div key={proj.id} className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-black text-slate-950">
                              <span>{proj.title}</span>
                              <span className="text-[10px] text-blue-600 font-mono font-bold">{proj.techStack}</span>
                            </div>
                            <ul className="list-disc list-inside text-[10.5px] text-slate-800 space-y-1 font-medium">
                              {proj.bullets.map((b, idx) => (
                                <li key={idx}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
