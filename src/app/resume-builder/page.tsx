"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { LeftSidebar } from "@/components/dashboard/LeftSidebar";
import { RightAIPanel } from "@/components/dashboard/RightAIPanel";
import {
  Sparkles,
  FileText,
  Download,
  Printer,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ExternalLink,
  Code2,
  GraduationCap,
  Briefcase,
  Award,
  User,
  Globe,
  Mail,
  Phone,
  MapPin,
  ZoomIn,
  ZoomOut,
  Wand2,
  ShieldCheck,
  Zap,
  LayoutTemplate
} from "lucide-react";

// Initial Sample Resume Profile
const SAMPLE_RESUME_DATA = {
  personalInfo: {
    fullName: "Ajmeera Chandu",
    jobTitle: "Full-Stack AI Software Engineer",
    email: "chandu@knowledgestream.ai",
    phone: "+91 98765 43210",
    location: "Hyderabad, India",
    portfolioUrl: "https://chandu.dev",
    githubUrl: "https://github.com/CHANDUAJMEERA277",
    linkedinUrl: "https://linkedin.com/in/chandu-ajmeera",
  },
  summary:
    "Results-driven Full-Stack AI Engineer with expertise in React, Next.js 16, Java Enterprise, Python AI architectures, and high-performance Web APIs. Skilled in designing scalable cloud microservices, integrating Gemini AI models, and optimizing developer workflows.",
  skills: [
    "TypeScript / JavaScript",
    "React / Next.js 16",
    "Java Enterprise (Spring Boot)",
    "Python / Fast API / AI",
    "C++ / Data Structures & DSA",
    "Node.js & Express",
    "SQLite / PostgreSQL / Prisma ORM",
    "TailwindCSS & Framer Motion",
    "Git & GitHub Actions CI/CD",
    "Docker & Cloud Deployment",
  ],
  experience: [
    {
      id: "exp-1",
      company: "KnowledgeStream AI",
      role: "Lead Full-Stack Developer",
      startDate: "2025-06",
      endDate: "Present",
      location: "Hyderabad, IN",
      description:
        "Architected and deployed an AI-driven learning platform serving thousands of computer science students.",
      bullets: [
        "Engineered real-time interactive code editor and automated execution pipeline with 99.8% uptime.",
        "Integrated Gemini 1.5 Flash AI API to power real-time speech dictation, guided debugging, and voice code generation.",
        "Optimized database queries and API routing using Next.js Turbopack, improving page load speeds by 42%.",
      ],
    },
    {
      id: "exp-2",
      company: "Nexus Technologies",
      role: "Software Engineering Intern",
      startDate: "2024-05",
      endDate: "2025-04",
      location: "Remote",
      description:
        "Developed responsive frontend UI components and backend REST microservices.",
      bullets: [
        "Built 25+ reusable accessible React UI components with custom design tokens and dark mode themes.",
        "Collaborated with senior engineers to implement Razorpay payment gateway integration and user session auth.",
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
      gpa: "8.9 / 10.0",
      location: "Hyderabad, India",
    },
  ],
  projects: [
    {
      id: "proj-1",
      title: "Codenthra AI Coding Workspace",
      techStack: "Next.js 16, TypeScript, Prisma, Gemini AI, TailwindCSS",
      link: "https://github.com/CHANDUAJMEERA277/ksai_final",
      description:
        "Comprehensive CS learning OS featuring live sandboxed code editor, interactive AI mentor, gamified XP mastery, and automated quiz evaluation.",
      bullets: [
        "Implemented real-time LeetCode-style activity heatmap tracking daily practice streaks and submission history.",
        "Designed weekly goal locking mechanisms and weekend target alerts to boost student retention by 35%.",
      ],
    },
    {
      id: "proj-2",
      title: "Multi-Language Speech & Code Tutor",
      techStack: "Python, Web Speech API, Fast API, PyTorch",
      link: "https://github.com/CHANDUAJMEERA277/speech-tutor",
      description:
        "Voice-controlled programming tutor that listens to audio prompts and auto-generates executable C, C++, and Java code.",
      bullets: [
        "Reduced code drafting time by 60% with hands-free dictation checking and syntax error auto-fixes.",
      ],
    },
  ],
  certifications: [
    {
      id: "cert-1",
      title: "Java Enterprise & Object-Oriented Architecture",
      issuer: "KnowledgeStream AI",
      date: "2026",
    },
    {
      id: "cert-2",
      title: "Python AI & Data Structures Mastery",
      issuer: "KnowledgeStream AI",
      date: "2026",
    },
  ],
};

export default function ResumeBuilderPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [activeSidebarTab, setActiveSidebarTab] = useState("Resume Builder");
  const [resumeData, setResumeData] = useState(SAMPLE_RESUME_DATA);
  const [template, setTemplate] = useState<"modern" | "executive" | "creative" | "classic">("modern");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeAccordion, setActiveAccordion] = useState<string>("personal");

  // AI Enhancements State
  const [isEnhancingSummary, setIsEnhancingSummary] = useState(false);
  const [enhancingBulletId, setEnhancingBulletId] = useState<string | null>(null);
  const [isScoringATS, setIsScoringATS] = useState(false);
  const [atsModalOpen, setAtsModalOpen] = useState(false);
  const [atsResult, setAtsResult] = useState<any>(null);

  // Skill Input state
  const [newSkillInput, setNewSkillInput] = useState("");

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

        // Pre-fill user name and email if default sample
        setResumeData((prev) => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            fullName: currentUser.name || prev.personalInfo.fullName,
            email: currentUser.email || prev.personalInfo.email,
          },
        }));
      } else {
        router.push("/auth");
      }
    }
  }, [session, isPending, router]);

  const handleSidebarTabChange = (tab: string) => {
    setActiveSidebarTab(tab);
    if (tab === "Dashboard") router.push("/dashboard");
    else if (tab === "Courses") router.push("/courses");
    else if (tab === "Leaderboard") router.push("/leaderboard");
    else if (tab === "AI Mentor") router.push("/codexai");
    else if (tab === "AI Quiz Generator") router.push("/quiz-generator");
  };

  // Helper for updating deep personal fields
  const handlePersonalInfoChange = (field: string, val: string) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: val,
      },
    }));
  };

  // AI Summary Enhancer
  const handleEnhanceSummary = async () => {
    setIsEnhancingSummary(true);
    try {
      const res = await fetch("/api/ai/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "optimize_summary",
          text: resumeData.summary,
          targetRole: resumeData.personalInfo.jobTitle || "Software Engineer",
        }),
      });
      const data = await res.json();
      if (data.result) {
        setResumeData((prev) => ({ ...prev, summary: data.result }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsEnhancingSummary(false);
    }
  };

  // AI Bullet Enhancer
  const handleEnhanceBullet = async (type: "exp" | "proj", itemId: string, bulletIdx: number) => {
    const key = type === "exp" ? "experience" : "projects";
    const item = (resumeData[key] as any[]).find((i) => i.id === itemId);
    if (!item || !item.bullets[bulletIdx]) return;

    const targetBulletId = `${itemId}-${bulletIdx}`;
    setEnhancingBulletId(targetBulletId);

    try {
      const res = await fetch("/api/ai/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "optimize_bullet",
          text: item.bullets[bulletIdx],
        }),
      });
      const data = await res.json();
      if (data.result) {
        setResumeData((prev) => ({
          ...prev,
          [key]: (prev[key] as any[]).map((i) => {
            if (i.id === itemId) {
              const updatedBullets = [...i.bullets];
              updatedBullets[bulletIdx] = data.result;
              return { ...i, bullets: updatedBullets };
            }
            return i;
          }),
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEnhancingBulletId(null);
    }
  };

  // Run ATS Audit
  const handleRunAtsAudit = async () => {
    setIsScoringATS(true);
    setAtsModalOpen(true);
    try {
      const res = await fetch("/api/ai/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ats_score",
          resumeData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAtsResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsScoringATS(false);
    }
  };

  // Add Skill Pill
  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !resumeData.skills.includes(trimmed)) {
      setResumeData((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmed],
      }));
      setNewSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  // Add Experience
  const handleAddExperience = () => {
    const newExp = {
      id: `exp-${Date.now()}`,
      company: "Tech Company",
      role: "Software Developer",
      startDate: "2025-01",
      endDate: "Present",
      location: "Remote",
      description: "Developed modern web applications and managed cloud databases.",
      bullets: ["Architected responsive UI modules and API integration."],
    };
    setResumeData((prev) => ({ ...prev, experience: [...prev.experience, newExp] }));
  };

  // Remove Experience
  const handleRemoveExperience = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((e) => e.id !== id),
    }));
  };

  // Add Project
  const handleAddProject = () => {
    const newProj = {
      id: `proj-${Date.now()}`,
      title: "New Portfolio Project",
      techStack: "React, Node.js, SQLite",
      link: "https://github.com",
      description: "Building an awesome full-stack web application.",
      bullets: ["Designed scalable backend API handlers."],
    };
    setResumeData((prev) => ({ ...prev, projects: [...prev.projects, newProj] }));
  };

  // Remove Project
  const handleRemoveProject = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  };

  // Print Action
  const handlePrint = () => {
    window.print();
  };

  // Export JSON
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(resumeData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resumeData.personalInfo.fullName.replace(/\s+/g, "_")}_Resume.json`;
    a.click();
  };

  return (
    <div className="h-screen bg-[#F8FAFC] text-slate-800 flex overflow-hidden font-sans antialiased selection:bg-cyan-500 selection:text-black">
      {/* Printable CSS Media Shield */}
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
          }
        }
      `}</style>

      {/* Left Navigation Sidebar */}
      <LeftSidebar
        activeTab="Resume Builder"
        onTabChange={handleSidebarTabChange}
        userProfile={user || undefined}
        isLight={false}
        fullHeight={true}
      />

      {/* Center Main Workspace Content Area */}
      <main data-lenis-prevent className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Control Bar & Toolbar */}
        <div className="glass-panel px-4 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-xs no-print">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-slate-900 tracking-tight">
                  Codenthra AI Resume Studio
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-mono font-bold">
                  ATS Ready v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Build & AI-optimize your tech resume for FAANG & top tech companies.
              </p>
            </div>
          </div>

          {/* Template Selector & Toolbar Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Template Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
              <LayoutTemplate size={14} className="text-blue-600 ml-1" />
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer pr-1"
              >
                <option value="modern">Modern Tech (ATS Standard)</option>
                <option value="executive">Executive Minimalist</option>
                <option value="creative">Creative Developer</option>
                <option value="classic">Harvard Classic</option>
              </select>
            </div>

            {/* ATS Score Audit Button */}
            <button
              onClick={handleRunAtsAudit}
              className="px-3 py-1.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Zap size={13} className="text-yellow-300" /> ✨ Run ATS Audit
            </button>

            {/* Export JSON */}
            <button
              onClick={handleExportJSON}
              title="Export Resume Data as JSON"
              className="px-3 py-1.5 rounded-xl text-xs font-extrabold text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Download size={13} /> Export JSON
            </button>

            {/* Download PDF / Print */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-95 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer size={13} /> Download PDF
            </button>
          </div>
        </div>

        {/* Split Screen Workspace Area */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          {/* Left Form Builder Panel */}
          <div className="w-full lg:w-1/2 h-full overflow-y-auto p-4 sm:p-6 border-r border-slate-200 bg-slate-50/70 space-y-4 custom-scrollbar no-print">
            {/* Accordion 1: Personal Info */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <button
                onClick={() => setActiveAccordion(activeAccordion === "personal" ? "" : "personal")}
                className="w-full p-4 flex items-center justify-between bg-slate-50/50 hover:bg-slate-100/60 transition-colors font-extrabold text-slate-900 text-sm"
              >
                <span className="flex items-center gap-2">
                  <User size={16} className="text-blue-600" /> Personal Information
                </span>
                {activeAccordion === "personal" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {activeAccordion === "personal" && (
                <div className="p-4 space-y-3.5 border-t border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.fullName}
                        onChange={(e) => handlePersonalInfoChange("fullName", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                        Target Job Title
                      </label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.jobTitle}
                        onChange={(e) => handlePersonalInfoChange("jobTitle", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                        placeholder="Full-Stack Developer"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={resumeData.personalInfo.email}
                        onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.phone}
                        onChange={(e) => handlePersonalInfoChange("phone", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                        placeholder="+91 9876543210"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.location}
                        onChange={(e) => handlePersonalInfoChange("location", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                        placeholder="Hyderabad, India"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                        GitHub Profile URL
                      </label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.githubUrl}
                        onChange={(e) => handlePersonalInfoChange("githubUrl", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                        placeholder="https://github.com/username"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 2: Professional Summary & AI Enhancer */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <button
                onClick={() => setActiveAccordion(activeAccordion === "summary" ? "" : "summary")}
                className="w-full p-4 flex items-center justify-between bg-slate-50/50 hover:bg-slate-100/60 transition-colors font-extrabold text-slate-900 text-sm"
              >
                <span className="flex items-center gap-2">
                  <Sparkles size={16} className="text-purple-600" /> Professional Summary
                </span>
                {activeAccordion === "summary" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {activeAccordion === "summary" && (
                <div className="p-4 space-y-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      Summary Text
                    </span>
                    <button
                      type="button"
                      onClick={handleEnhanceSummary}
                      disabled={isEnhancingSummary}
                      className="px-2.5 py-1 rounded-lg text-xs font-extrabold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Wand2 size={12} className={isEnhancingSummary ? "animate-spin" : ""} />
                      {isEnhancingSummary ? "Enhancing..." : "✨ AI Polish Summary"}
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={resumeData.summary}
                    onChange={(e) => setResumeData((prev) => ({ ...prev, summary: e.target.value }))}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-purple-500 leading-relaxed"
                    placeholder="Write a brief pitch summarizing your skills and background..."
                  />
                </div>
              )}
            </div>

            {/* Accordion 3: Technical Skills */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <button
                onClick={() => setActiveAccordion(activeAccordion === "skills" ? "" : "skills")}
                className="w-full p-4 flex items-center justify-between bg-slate-50/50 hover:bg-slate-100/60 transition-colors font-extrabold text-slate-900 text-sm"
              >
                <span className="flex items-center gap-2">
                  <Code2 size={16} className="text-cyan-600" /> Skills & Tech Stack
                </span>
                {activeAccordion === "skills" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {activeAccordion === "skills" && (
                <div className="p-4 space-y-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddSkill(newSkillInput)}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-cyan-500"
                      placeholder="e.g. Next.js, Docker, Java, PostgreSQL..."
                    />
                    <button
                      onClick={() => handleAddSkill(newSkillInput)}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 transition-colors cursor-pointer"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Skill Pills List */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {resumeData.skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700"
                      >
                        {s}
                        <button
                          onClick={() => handleRemoveSkill(s)}
                          className="hover:text-rose-500 transition-colors cursor-pointer"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 4: Work Experience */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <button
                onClick={() => setActiveAccordion(activeAccordion === "experience" ? "" : "experience")}
                className="w-full p-4 flex items-center justify-between bg-slate-50/50 hover:bg-slate-100/60 transition-colors font-extrabold text-slate-900 text-sm"
              >
                <span className="flex items-center gap-2">
                  <Briefcase size={16} className="text-emerald-600" /> Work Experience
                </span>
                {activeAccordion === "experience" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {activeAccordion === "experience" && (
                <div className="p-4 space-y-4 border-t border-slate-100">
                  {resumeData.experience.map((exp, expIdx) => (
                    <div key={exp.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 relative">
                      <button
                        onClick={() => handleRemoveExperience(exp.id)}
                        className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Delete Experience"
                      >
                        <Trash2 size={15} />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) =>
                            setResumeData((prev) => ({
                              ...prev,
                              experience: prev.experience.map((i) => (i.id === exp.id ? { ...i, company: e.target.value } : i)),
                            }))
                          }
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-900"
                          placeholder="Company Name"
                        />
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) =>
                            setResumeData((prev) => ({
                              ...prev,
                              experience: prev.experience.map((i) => (i.id === exp.id ? { ...i, role: e.target.value } : i)),
                            }))
                          }
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-900"
                          placeholder="Job Title"
                        />
                      </div>

                      {/* Bullet points list */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Achievement Bullet Points
                        </span>
                        {exp.bullets.map((b, bIdx) => (
                          <div key={bIdx} className="flex items-start gap-1.5">
                            <textarea
                              rows={2}
                              value={b}
                              onChange={(e) => {
                                const newBullets = [...exp.bullets];
                                newBullets[bIdx] = e.target.value;
                                setResumeData((prev) => ({
                                  ...prev,
                                  experience: prev.experience.map((i) => (i.id === exp.id ? { ...i, bullets: newBullets } : i)),
                                }));
                              }}
                              className="flex-1 p-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 leading-normal"
                            />
                            <button
                              type="button"
                              onClick={() => handleEnhanceBullet("exp", exp.id, bIdx)}
                              disabled={enhancingBulletId === `${exp.id}-${bIdx}`}
                              className="px-2 py-1 rounded-lg text-[10px] font-extrabold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                              title="Enhance with AI"
                            >
                              <Wand2 size={11} className={enhancingBulletId === `${exp.id}-${bIdx}` ? "animate-spin" : ""} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={handleAddExperience}
                    className="w-full py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} /> Add Experience Section
                  </button>
                </div>
              )}
            </div>

            {/* Accordion 5: Key Projects */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <button
                onClick={() => setActiveAccordion(activeAccordion === "projects" ? "" : "projects")}
                className="w-full p-4 flex items-center justify-between bg-slate-50/50 hover:bg-slate-100/60 transition-colors font-extrabold text-slate-900 text-sm"
              >
                <span className="flex items-center gap-2">
                  <Globe size={16} className="text-blue-600" /> Portfolio Projects
                </span>
                {activeAccordion === "projects" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {activeAccordion === "projects" && (
                <div className="p-4 space-y-4 border-t border-slate-100">
                  {resumeData.projects.map((proj) => (
                    <div key={proj.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 relative">
                      <button
                        onClick={() => handleRemoveProject(proj.id)}
                        className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 size={15} />
                      </button>

                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) =>
                          setResumeData((prev) => ({
                            ...prev,
                            projects: prev.projects.map((i) => (i.id === proj.id ? { ...i, title: e.target.value } : i)),
                          }))
                        }
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-900"
                        placeholder="Project Title"
                      />
                      <input
                        type="text"
                        value={proj.techStack}
                        onChange={(e) =>
                          setResumeData((prev) => ({
                            ...prev,
                            projects: prev.projects.map((i) => (i.id === proj.id ? { ...i, techStack: e.target.value } : i)),
                          }))
                        }
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800"
                        placeholder="Tech Stack (e.g. Next.js, Python, PostgreSQL)"
                      />
                      <textarea
                        rows={2}
                        value={proj.description}
                        onChange={(e) =>
                          setResumeData((prev) => ({
                            ...prev,
                            projects: prev.projects.map((i) => (i.id === proj.id ? { ...i, description: e.target.value } : i)),
                          }))
                        }
                        className="w-full p-2.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 leading-normal"
                        placeholder="Project summary and architecture details..."
                      />
                    </div>
                  ))}

                  <button
                    onClick={handleAddProject}
                    className="w-full py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} /> Add Portfolio Project
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Live Document Preview Panel */}
          <div className="w-full lg:w-1/2 h-full overflow-y-auto p-4 sm:p-8 bg-slate-200/80 flex flex-col items-center custom-scrollbar print-area">
            {/* Live Paper Document Canvas */}
            <div
              className={`w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-2xl rounded-sm p-8 sm:p-10 font-sans transition-all duration-300 ${
                template === "classic" ? "font-serif" : "font-sans"
              }`}
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
            >
              {/* Document Header */}
              {template === "creative" ? (
                <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white mb-6 space-y-2 shadow-md">
                  <h1 className="text-2xl font-black tracking-tight">{resumeData.personalInfo.fullName}</h1>
                  <p className="text-xs font-bold text-cyan-300 uppercase tracking-widest">{resumeData.personalInfo.jobTitle}</p>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-300 font-medium pt-1">
                    {resumeData.personalInfo.email && <span className="flex items-center gap-1"><Mail size={10} /> {resumeData.personalInfo.email}</span>}
                    {resumeData.personalInfo.phone && <span className="flex items-center gap-1"><Phone size={10} /> {resumeData.personalInfo.phone}</span>}
                    {resumeData.personalInfo.location && <span className="flex items-center gap-1"><MapPin size={10} /> {resumeData.personalInfo.location}</span>}
                    {resumeData.personalInfo.githubUrl && <span className="flex items-center gap-1"><Globe size={10} /> GitHub</span>}
                  </div>
                </div>
              ) : (
                <div className={`pb-4 mb-5 ${template === "classic" ? "text-center border-b border-slate-900" : "border-b border-slate-200"}`}>
                  <h1 className="text-2xl font-black text-slate-950 tracking-tight uppercase">
                    {resumeData.personalInfo.fullName}
                  </h1>
                  <p className="text-xs font-extrabold text-blue-700 uppercase tracking-wider mt-0.5">
                    {resumeData.personalInfo.jobTitle}
                  </p>

                  <div className={`flex flex-wrap items-center gap-3 text-[11px] text-slate-600 font-medium mt-2.5 ${template === "classic" ? "justify-center" : ""}`}>
                    {resumeData.personalInfo.email && <span className="flex items-center gap-1"><Mail size={11} className="text-slate-400" /> {resumeData.personalInfo.email}</span>}
                    {resumeData.personalInfo.phone && <span className="flex items-center gap-1"><Phone size={11} className="text-slate-400" /> {resumeData.personalInfo.phone}</span>}
                    {resumeData.personalInfo.location && <span className="flex items-center gap-1"><MapPin size={11} className="text-slate-400" /> {resumeData.personalInfo.location}</span>}
                    {resumeData.personalInfo.githubUrl && <span className="flex items-center gap-1"><Globe size={11} className="text-slate-400" /> {resumeData.personalInfo.githubUrl.replace("https://", "")}</span>}
                  </div>
                </div>
              )}

              {/* Summary Section */}
              {resumeData.summary && (
                <div className="mb-5 space-y-1">
                  <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 flex items-center gap-1.5">
                    Professional Summary
                  </h2>
                  <p className="text-[11px] text-slate-700 leading-relaxed font-medium pt-1">
                    {resumeData.summary}
                  </p>
                </div>
              )}

              {/* Technical Skills */}
              {resumeData.skills.length > 0 && (
                <div className="mb-5 space-y-1.5">
                  <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1">
                    Technical Skills & Core Competencies
                  </h2>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {resumeData.skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-bold border border-slate-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Experience */}
              {resumeData.experience.length > 0 && (
                <div className="mb-5 space-y-3">
                  <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1">
                    Work Experience
                  </h2>
                  {resumeData.experience.map((exp) => (
                    <div key={exp.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                        <span>{exp.role} &bull; <span className="text-blue-700 font-extrabold">{exp.company}</span></span>
                        <span className="text-[10px] text-slate-500 font-mono">{exp.startDate} - {exp.endDate}</span>
                      </div>
                      <p className="text-[10.5px] text-slate-600 italic font-medium">{exp.description}</p>
                      <ul className="list-disc list-inside text-[10.5px] text-slate-700 space-y-1 pt-1 font-medium leading-relaxed">
                        {exp.bullets.map((b, idx) => (
                          <li key={idx} className="pl-1">{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Key Projects */}
              {resumeData.projects.length > 0 && (
                <div className="mb-5 space-y-3">
                  <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1">
                    Featured Portfolio Projects
                  </h2>
                  {resumeData.projects.map((proj) => (
                    <div key={proj.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                        <span>{proj.title}</span>
                        <span className="text-[10px] text-blue-600 font-mono font-bold">{proj.techStack}</span>
                      </div>
                      <p className="text-[10.5px] text-slate-700 leading-relaxed font-medium">{proj.description}</p>
                      {proj.bullets && (
                        <ul className="list-disc list-inside text-[10.5px] text-slate-700 space-y-1 font-medium">
                          {proj.bullets.map((b, idx) => (
                            <li key={idx}>{b}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Education */}
              {resumeData.education.length > 0 && (
                <div className="mb-5 space-y-2">
                  <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1">
                    Education & Credentials
                  </h2>
                  {resumeData.education.map((edu) => (
                    <div key={edu.id} className="flex items-center justify-between text-xs font-bold text-slate-900">
                      <div>
                        <span>{edu.degree}</span>
                        <p className="text-[10px] text-slate-500 font-medium">{edu.institution} &bull; GPA: {edu.gpa}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{edu.startDate} - {edu.endDate}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Right AI Panel */}
      <RightAIPanel />

      {/* ATS Score Audit Modal */}
      {atsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Zap size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Codenthra ATS Score Audit</h3>
                  <p className="text-[11px] text-slate-500 font-medium">AI parsing compatibility evaluation</p>
                </div>
              </div>
              <button onClick={() => setAtsModalOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer">
                &times;
              </button>
            </div>

            {isScoringATS ? (
              <div className="py-10 text-center space-y-3">
                <RefreshCw size={28} className="animate-spin text-purple-600 mx-auto" />
                <p className="text-xs font-bold text-slate-700">Codenthra AI is scanning your resume structure...</p>
              </div>
            ) : atsResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4 bg-purple-50 p-4 rounded-2xl border border-purple-100">
                  <div className="text-center">
                    <p className="text-3xl font-black text-purple-700">{atsResult.score || 92}%</p>
                    <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">ATS Match Score</p>
                  </div>
                  <div className="text-xs text-slate-700 font-medium max-w-xs leading-snug">
                    Your resume aligns excellently with standard corporate Applicant Tracking Systems (ATS).
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Key Recommendations</p>
                  <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                    {atsResult.feedback?.map((f: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {atsResult.missingKeywords && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Suggested Keywords</p>
                    <div className="flex flex-wrap gap-1.5">
                      {atsResult.missingKeywords.map((k: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                          + {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setAtsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Audit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
