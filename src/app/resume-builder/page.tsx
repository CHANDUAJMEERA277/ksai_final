"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { LeftSidebar } from "@/components/dashboard/LeftSidebar";
import {
  Sparkles,
  FileText,
  Download,
  Printer,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Code2,
  Briefcase,
  User,
  Globe,
  Mail,
  Phone,
  MapPin,
  Wand2,
  Zap,
  LayoutTemplate,
  CheckCircle2
} from "lucide-react";

// Pre-packaged Professional Resume Profiles
const PRESET_PROFILES = {
  fullstack: {
    personalInfo: {
      fullName: "Ajmeera Chandu",
      jobTitle: "Senior Full-Stack AI Engineer",
      email: "chandu@knowledgestream.ai",
      phone: "+91 98765 43210",
      location: "Hyderabad, India",
      portfolioUrl: "https://chandu.dev",
      githubUrl: "github.com/CHANDUAJMEERA277",
      linkedinUrl: "linkedin.com/in/chandu-ajmeera",
    },
    summary:
      "Results-driven Full-Stack AI Engineer with 4+ years of experience architecting high-throughput web applications, real-time code execution environments, and generative AI features. Specialist in React, Next.js 16, Java Spring Boot, and cloud microservices.",
    skills: [
      "TypeScript / JavaScript",
      "React / Next.js 16",
      "Java Enterprise (Spring Boot)",
      "Python / Fast API / AI",
      "C++ / System Programming",
      "Node.js & Express",
      "SQLite / PostgreSQL / Prisma",
      "TailwindCSS & Framer Motion",
      "Docker & Cloud CI/CD",
    ],
    experience: [
      {
        id: "exp-1",
        company: "KnowledgeStream AI",
        role: "Lead Full-Stack AI Developer",
        startDate: "2025 - Present",
        endDate: "Current",
        location: "Hyderabad, IN",
        description:
          "Leading technical architecture for AI-driven CS learning platform serving 15,000+ active coders.",
        bullets: [
          "Architected real-time browser sandbox code editor and automated execution pipeline with 99.9% uptime.",
          "Integrated Gemini Flash AI engine for speech-to-code dictation and automated guided debugging.",
          "Decreased page bundle size by 38% and API response latency by 45% utilizing Next.js Turbopack SSR.",
        ],
      },
      {
        id: "exp-2",
        company: "Nexus Cloud Labs",
        role: "Full-Stack Software Engineer",
        startDate: "2024",
        endDate: "2025",
        location: "Remote",
        description:
          "Engineered multi-tenant SaaS dashboards and payment processing pipelines.",
        bullets: [
          "Developed 30+ reusable accessible React components with automated Jest unit test suites.",
          "Integrated Razorpay & Stripe webhooks handling $150K+ monthly subscription transactions seamlessly.",
        ],
      },
    ],
    education: [
      {
        id: "edu-1",
        institution: "State Technological University",
        degree: "B.Tech in Computer Science & Artificial Intelligence",
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
        link: "github.com/CHANDUAJMEERA277/ksai_final",
        description:
          "Comprehensive CS learning OS featuring live sandboxed code editor, interactive AI mentor, gamified XP mastery matrix, and automated quiz evaluation.",
        bullets: [
          "Engineered LeetCode-style green activity matrix tracking daily streak activity and submission logs.",
          "Implemented weekly goal locks and automated weekend target notification alerts to boost retention by 35%.",
        ],
      },
      {
        id: "proj-2",
        title: "Real-Time Multi-Language Voice Code Dictator",
        techStack: "Python, Web Speech API, Fast API, PyTorch",
        link: "github.com/CHANDUAJMEERA277/voice-coder",
        description:
          "Hands-free programming speech engine converting natural audio commands into clean C, C++, and Java syntax.",
        bullets: [
          "Reduced code drafting time by 60% with instant voice error checking and automated syntax correction.",
        ],
      },
    ],
  },

  backend: {
    personalInfo: {
      fullName: "Ajmeera Chandu",
      jobTitle: "Backend Systems & Java Specialist",
      email: "chandu.backend@knowledgestream.ai",
      phone: "+91 98765 43210",
      location: "Hyderabad, India",
      portfolioUrl: "https://chandu.dev",
      githubUrl: "github.com/CHANDUAJMEERA277",
      linkedinUrl: "linkedin.com/in/chandu-ajmeera",
    },
    summary:
      "High-performance Backend Engineer specializing in Java Enterprise (Spring Boot), distributed systems, database query optimization, and REST API design. Experienced in building resilient microservice pipelines.",
    skills: [
      "Core Java / Multithreading",
      "Spring Boot / Microservices",
      "C++ / Memory Management",
      "PostgreSQL / MySQL / Redis",
      "Kafka / Event-Driven Messaging",
      "RESTful API & GraphQL",
      "Docker / Kubernetes",
      "Linux System Programming",
    ],
    experience: [
      {
        id: "exp-1",
        company: "Apex Enterprise Systems",
        role: "Backend Java Engineer",
        startDate: "2024",
        endDate: "Present",
        location: "Hyderabad, IN",
        description: "Designing high-concurrency microservice APIs for financial transaction routing.",
        bullets: [
          "Implemented Redis caching layer reducing database read load by 60% during peak user traffic.",
          "Refactored legacy monolith into Spring Boot microservices, improving deployment frequency by 4x.",
        ],
      },
    ],
    education: [
      {
        id: "edu-1",
        institution: "State Technological University",
        degree: "B.Tech in Computer Science Engineering",
        startDate: "2022",
        endDate: "2026",
        gpa: "8.9 / 10.0",
        location: "Hyderabad, India",
      },
    ],
    projects: [
      {
        id: "proj-1",
        title: "Distributed Transaction Router",
        techStack: "Java 21, Spring Boot, Redis, PostgreSQL, Kafka",
        link: "github.com/CHANDUAJMEERA277/java-router",
        description: "Low-latency financial message broker capable of handling 5,000+ requests per second with ACID compliance.",
        bullets: [
          "Zero transaction loss guaranteed via double-entry ledger verification and dead-letter queues.",
        ],
      },
    ],
  },
};

export default function ResumeBuilderPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [activeSidebarTab, setActiveSidebarTab] = useState("Resume Builder");
  const [resumeData, setResumeData] = useState(PRESET_PROFILES.fullstack);
  const [template, setTemplate] = useState<"modern" | "executive" | "creative" | "classic">("modern");
  const [activeAccordion, setActiveAccordion] = useState<string>("personal");

  // AI State
  const [isEnhancingSummary, setIsEnhancingSummary] = useState(false);
  const [enhancingBulletId, setEnhancingBulletId] = useState<string | null>(null);
  const [isScoringATS, setIsScoringATS] = useState(false);
  const [atsModalOpen, setAtsModalOpen] = useState(false);
  const [atsResult, setAtsResult] = useState<any>(null);

  // Skill Input
  const [newSkillInput, setNewSkillInput] = useState("");

  // User Session
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

        // Pre-fill user name/email if present
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

  const handlePersonalInfoChange = (field: string, val: string) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: val,
      },
    }));
  };

  // AI Polish Summary
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

  // AI Polish Bullet
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

  // Add Skill
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

  const handleAddExperience = () => {
    const newExp = {
      id: `exp-${Date.now()}`,
      company: "Innovate Tech",
      role: "Software Engineer",
      startDate: "2025",
      endDate: "Present",
      location: "Remote",
      description: "Developing scalable cloud web applications.",
      bullets: ["Architected microservices improving throughput by 30%."],
    };
    setResumeData((prev) => ({ ...prev, experience: [...prev.experience, newExp] }));
  };

  const handleRemoveExperience = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((e) => e.id !== id),
    }));
  };

  const handleAddProject = () => {
    const newProj = {
      id: `proj-${Date.now()}`,
      title: "New AI App",
      techStack: "Next.js, Python, Tailwind",
      link: "github.com/myusername/project",
      description: "Building an awesome developer tool.",
      bullets: ["Engineered responsive UI and backend integration."],
    };
    setResumeData((prev) => ({ ...prev, projects: [...prev.projects, newProj] }));
  };

  const handleRemoveProject = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  };

  const handlePrint = () => {
    window.print();
  };

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
    <div className="h-screen bg-[#F8FAFC] text-slate-800 flex overflow-hidden font-sans antialiased selection:bg-blue-500 selection:text-white">
      {/* Printable Media Shield */}
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

      {/* Center Workspace (Clean Light Theme) */}
      <main data-lenis-prevent className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-[#F8FAFC]">
        {/* Top Control Header Bar */}
        <div className="glass-panel px-6 py-3.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-xs no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-sm">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                  Codenthra AI Resume Studio <Sparkles size={14} className="text-blue-600" />
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-mono font-bold">
                  ATS Score 98+
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Professional FAANG-grade AI Resume Architect & Instant PDF Generator
              </p>
            </div>
          </div>

          {/* Preset Profiles & Toolbar Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Presets */}
            <div className="hidden xl:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-2">Presets:</span>
              <button
                onClick={() => setResumeData(PRESET_PROFILES.fullstack)}
                className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] transition-all cursor-pointer border border-blue-200"
              >
                Full-Stack
              </button>
              <button
                onClick={() => setResumeData(PRESET_PROFILES.backend as any)}
                className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-[11px] transition-all cursor-pointer border border-purple-200"
              >
                Java / Backend
              </button>
            </div>

            {/* Template Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
              <LayoutTemplate size={14} className="text-blue-600" />
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-slate-900 outline-none cursor-pointer pr-1"
              >
                <option value="modern">Modern Tech (ATS Standard)</option>
                <option value="executive">Executive Modern</option>
                <option value="creative">Creative AI Accent</option>
                <option value="classic">Silicon Valley Classic</option>
              </select>
            </div>

            {/* Run ATS Audit Button */}
            <button
              onClick={handleRunAtsAudit}
              className="px-3.5 py-2 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Zap size={14} className="text-yellow-300 fill-yellow-300" /> ✨ Run ATS Audit
            </button>

            {/* Export JSON */}
            <button
              onClick={handleExportJSON}
              title="Export Resume Data as JSON"
              className="px-3.5 py-2 rounded-xl text-xs font-extrabold text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={14} /> Export JSON
            </button>

            {/* Download PDF / Print */}
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 hover:opacity-95 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer size={14} /> Download PDF
            </button>
          </div>
        </div>

        {/* Split Screen Workspace Area */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          {/* Left Form Builder Panel (Clean White / Light Slate) */}
          <div className="w-full lg:w-1/2 h-full overflow-y-auto p-4 sm:p-6 border-r border-slate-200 bg-slate-50/70 space-y-4 custom-scrollbar no-print">
            {/* Accordion 1: Personal Info */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <button
                onClick={() => setActiveAccordion(activeAccordion === "personal" ? "" : "personal")}
                className="w-full p-4 flex items-center justify-between bg-slate-50/60 hover:bg-slate-100/80 transition-colors font-black text-slate-900 text-sm"
              >
                <span className="flex items-center gap-2.5">
                  <User size={18} className="text-blue-600" /> Personal Details & Header
                </span>
                {activeAccordion === "personal" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {activeAccordion === "personal" && (
                <div className="p-4 space-y-3.5 border-t border-slate-100 bg-white">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.fullName}
                        onChange={(e) => handlePersonalInfoChange("fullName", e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                        placeholder="Ajmeera Chandu"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                        Target Job Title
                      </label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.jobTitle}
                        onChange={(e) => handlePersonalInfoChange("jobTitle", e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                        placeholder="Full-Stack Developer"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={resumeData.personalInfo.email}
                        onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                        placeholder="chandu@knowledgestream.ai"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.phone}
                        onChange={(e) => handlePersonalInfoChange("phone", e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.location}
                        onChange={(e) => handlePersonalInfoChange("location", e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                        placeholder="Hyderabad, India"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                        GitHub Profile
                      </label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.githubUrl}
                        onChange={(e) => handlePersonalInfoChange("githubUrl", e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                        placeholder="github.com/CHANDUAJMEERA277"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 2: Professional Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <button
                onClick={() => setActiveAccordion(activeAccordion === "summary" ? "" : "summary")}
                className="w-full p-4 flex items-center justify-between bg-slate-50/60 hover:bg-slate-100/80 transition-colors font-black text-slate-900 text-sm"
              >
                <span className="flex items-center gap-2.5">
                  <Sparkles size={18} className="text-purple-600" /> Professional Summary
                </span>
                {activeAccordion === "summary" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {activeAccordion === "summary" && (
                <div className="p-4 space-y-3 border-t border-slate-100 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                      Summary Text
                    </span>
                    <button
                      type="button"
                      onClick={handleEnhanceSummary}
                      disabled={isEnhancingSummary}
                      className="px-3 py-1 rounded-xl text-xs font-extrabold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Wand2 size={13} className={isEnhancingSummary ? "animate-spin" : ""} />
                      {isEnhancingSummary ? "Optimizing with Codenthra..." : "✨ AI Polish Summary"}
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={resumeData.summary}
                    onChange={(e) => setResumeData((prev) => ({ ...prev, summary: e.target.value }))}
                    className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white leading-relaxed"
                    placeholder="Write a brief summary of your tech experience..."
                  />
                </div>
              )}
            </div>

            {/* Accordion 3: Technical Skills */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <button
                onClick={() => setActiveAccordion(activeAccordion === "skills" ? "" : "skills")}
                className="w-full p-4 flex items-center justify-between bg-slate-50/60 hover:bg-slate-100/80 transition-colors font-black text-slate-900 text-sm"
              >
                <span className="flex items-center gap-2.5">
                  <Code2 size={18} className="text-cyan-600" /> Skills & Tech Stack
                </span>
                {activeAccordion === "skills" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {activeAccordion === "skills" && (
                <div className="p-4 space-y-3 border-t border-slate-100 bg-white">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddSkill(newSkillInput)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white"
                      placeholder="e.g. Next.js, Docker, Java, PostgreSQL..."
                    />
                    <button
                      onClick={() => handleAddSkill(newSkillInput)}
                      className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 transition-colors cursor-pointer"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Skill Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {resumeData.skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-extrabold text-blue-700"
                      >
                        {s}
                        <button
                          onClick={() => handleRemoveSkill(s)}
                          className="hover:text-rose-600 transition-colors cursor-pointer font-extrabold text-sm"
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
                className="w-full p-4 flex items-center justify-between bg-slate-50/60 hover:bg-slate-100/80 transition-colors font-black text-slate-900 text-sm"
              >
                <span className="flex items-center gap-2.5">
                  <Briefcase size={18} className="text-emerald-600" /> Work Experience
                </span>
                {activeAccordion === "experience" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {activeAccordion === "experience" && (
                <div className="p-4 space-y-4 border-t border-slate-100 bg-white">
                  {resumeData.experience.map((exp) => (
                    <div key={exp.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 relative">
                      <button
                        onClick={() => handleRemoveExperience(exp.id)}
                        className="absolute top-3.5 right-3.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete Experience"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Company</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) =>
                              setResumeData((prev) => ({
                                ...prev,
                                experience: prev.experience.map((i) => (i.id === exp.id ? { ...i, company: e.target.value } : i)),
                              }))
                            }
                            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Role Title</label>
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) =>
                              setResumeData((prev) => ({
                                ...prev,
                                experience: prev.experience.map((i) => (i.id === exp.id ? { ...i, role: e.target.value } : i)),
                              }))
                            }
                            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-900"
                          />
                        </div>
                      </div>

                      {/* Bullet points */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                          Accomplishment Bullets
                        </span>
                        {exp.bullets.map((b, bIdx) => (
                          <div key={bIdx} className="flex items-start gap-2">
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
                              className="flex-1 p-2.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 leading-relaxed"
                            />
                            <button
                              type="button"
                              onClick={() => handleEnhanceBullet("exp", exp.id, bIdx)}
                              disabled={enhancingBulletId === `${exp.id}-${bIdx}`}
                              className="px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                              title="Enhance with AI"
                            >
                              <Wand2 size={12} className={enhancingBulletId === `${exp.id}-${bIdx}` ? "animate-spin" : ""} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={handleAddExperience}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={15} /> Add Work Experience
                  </button>
                </div>
              )}
            </div>

            {/* Accordion 5: Key Projects */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <button
                onClick={() => setActiveAccordion(activeAccordion === "projects" ? "" : "projects")}
                className="w-full p-4 flex items-center justify-between bg-slate-50/60 hover:bg-slate-100/80 transition-colors font-black text-slate-900 text-sm"
              >
                <span className="flex items-center gap-2.5">
                  <Globe size={18} className="text-blue-600" /> Featured Projects
                </span>
                {activeAccordion === "projects" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {activeAccordion === "projects" && (
                <div className="p-4 space-y-4 border-t border-slate-100 bg-white">
                  {resumeData.projects.map((proj) => (
                    <div key={proj.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 relative">
                      <button
                        onClick={() => handleRemoveProject(proj.id)}
                        className="absolute top-3.5 right-3.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 size={16} />
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
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-900"
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
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-blue-600"
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
                        className="w-full p-2.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 leading-relaxed"
                        placeholder="Project summary and architecture details..."
                      />
                    </div>
                  ))}

                  <button
                    onClick={handleAddProject}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={15} /> Add Portfolio Project
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Live Document Preview Studio Pane */}
          <div className="w-full lg:w-1/2 h-full overflow-y-auto p-4 sm:p-8 bg-slate-200/60 flex flex-col items-center custom-scrollbar print-area relative">
            {/* Live Vector A4 Sheet Rendering */}
            <div
              className={`w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-xl rounded-sm p-8 sm:p-12 transition-all duration-300 ${
                template === "classic" ? "font-serif" : "font-sans"
              }`}
            >
              {/* Template Style 1: Modern Tech */}
              {template === "modern" && (
                <div>
                  <div className="border-b-2 border-blue-600 pb-4 mb-5">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight uppercase">
                      {resumeData.personalInfo.fullName}
                    </h1>
                    <p className="text-xs font-extrabold text-blue-600 uppercase tracking-widest mt-1">
                      {resumeData.personalInfo.jobTitle}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-600 font-semibold mt-3">
                      {resumeData.personalInfo.email && (
                        <span className="flex items-center gap-1"><Mail size={11} className="text-blue-500" /> {resumeData.personalInfo.email}</span>
                      )}
                      {resumeData.personalInfo.phone && (
                        <span className="flex items-center gap-1"><Phone size={11} className="text-blue-500" /> {resumeData.personalInfo.phone}</span>
                      )}
                      {resumeData.personalInfo.location && (
                        <span className="flex items-center gap-1"><MapPin size={11} className="text-blue-500" /> {resumeData.personalInfo.location}</span>
                      )}
                      {resumeData.personalInfo.githubUrl && (
                        <span className="flex items-center gap-1"><Globe size={11} className="text-blue-500" /> {resumeData.personalInfo.githubUrl}</span>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  {resumeData.summary && (
                    <div className="mb-5 space-y-1">
                      <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 text-blue-700">
                        Professional Summary
                      </h2>
                      <p className="text-[11px] text-slate-700 leading-relaxed font-medium pt-1">
                        {resumeData.summary}
                      </p>
                    </div>
                  )}

                  {/* Skills Grid */}
                  {resumeData.skills.length > 0 && (
                    <div className="mb-5 space-y-1.5">
                      <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 text-blue-700">
                        Core Technical Skills & Stack
                      </h2>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {resumeData.skills.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-900 text-[10.5px] font-extrabold border border-blue-200"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {resumeData.experience.length > 0 && (
                    <div className="mb-5 space-y-3.5">
                      <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 text-blue-700">
                        Professional Experience
                      </h2>
                      {resumeData.experience.map((exp) => (
                        <div key={exp.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-black text-slate-950">
                            <span>{exp.role} &bull; <span className="text-blue-600">{exp.company}</span></span>
                            <span className="text-[10px] text-slate-500 font-mono font-bold">{exp.startDate} - {exp.endDate}</span>
                          </div>
                          <p className="text-[10.5px] text-slate-600 italic font-medium">{exp.description}</p>
                          <ul className="list-disc list-inside text-[10.5px] text-slate-800 space-y-1 pt-1 font-medium leading-relaxed">
                            {exp.bullets.map((b, idx) => (
                              <li key={idx} className="pl-1">{b}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Projects */}
                  {resumeData.projects.length > 0 && (
                    <div className="mb-5 space-y-3.5">
                      <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 text-blue-700">
                        Featured Software Projects
                      </h2>
                      {resumeData.projects.map((proj) => (
                        <div key={proj.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-black text-slate-950">
                            <span>{proj.title}</span>
                            <span className="text-[10px] text-blue-600 font-mono font-bold">{proj.techStack}</span>
                          </div>
                          <p className="text-[10.5px] text-slate-700 leading-relaxed font-medium">{proj.description}</p>
                          {proj.bullets && (
                            <ul className="list-disc list-inside text-[10.5px] text-slate-800 space-y-1 font-medium">
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
                      <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 text-blue-700">
                        Education & Academic Credentials
                      </h2>
                      {resumeData.education.map((edu) => (
                        <div key={edu.id} className="flex items-center justify-between text-xs font-black text-slate-950">
                          <div>
                            <span>{edu.degree}</span>
                            <p className="text-[10px] text-slate-600 font-medium">{edu.institution} &bull; GPA: {edu.gpa}</p>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono font-bold">{edu.startDate} - {edu.endDate}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Template Style 2: Creative AI Accent */}
              {template === "creative" && (
                <div>
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white mb-6 space-y-2 shadow-lg">
                    <h1 className="text-2xl font-black tracking-tight">{resumeData.personalInfo.fullName}</h1>
                    <p className="text-xs font-bold text-cyan-300 uppercase tracking-widest">{resumeData.personalInfo.jobTitle}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-300 font-medium pt-1">
                      {resumeData.personalInfo.email && <span className="flex items-center gap-1"><Mail size={10} /> {resumeData.personalInfo.email}</span>}
                      {resumeData.personalInfo.phone && <span className="flex items-center gap-1"><Phone size={10} /> {resumeData.personalInfo.phone}</span>}
                      {resumeData.personalInfo.location && <span className="flex items-center gap-1"><MapPin size={10} /> {resumeData.personalInfo.location}</span>}
                      {resumeData.personalInfo.githubUrl && <span className="flex items-center gap-1"><Globe size={10} /> {resumeData.personalInfo.githubUrl}</span>}
                    </div>
                  </div>

                  {resumeData.summary && (
                    <div className="mb-5 space-y-1">
                      <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b-2 border-cyan-500 pb-1">
                        Professional Summary
                      </h2>
                      <p className="text-[11px] text-slate-700 leading-relaxed font-medium pt-1">
                        {resumeData.summary}
                      </p>
                    </div>
                  )}

                  {resumeData.skills.length > 0 && (
                    <div className="mb-5 space-y-1.5">
                      <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b-2 border-cyan-500 pb-1">
                        Skills & Technologies
                      </h2>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {resumeData.skills.map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold border border-slate-300">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {resumeData.experience.length > 0 && (
                    <div className="mb-5 space-y-3">
                      <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b-2 border-cyan-500 pb-1">
                        Experience
                      </h2>
                      {resumeData.experience.map((exp) => (
                        <div key={exp.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                            <span>{exp.role} &bull; <span className="text-cyan-700 font-extrabold">{exp.company}</span></span>
                            <span className="text-[10px] text-slate-500 font-mono">{exp.startDate} - {exp.endDate}</span>
                          </div>
                          <ul className="list-disc list-inside text-[10.5px] text-slate-700 space-y-1 font-medium">
                            {exp.bullets.map((b, idx) => (
                              <li key={idx}>{b}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Template Style 3 & 4 Fallbacks */}
              {(template === "executive" || template === "classic") && (
                <div>
                  <div className={`pb-3 mb-5 ${template === "classic" ? "text-center border-b-2 border-slate-900" : "border-b border-slate-300"}`}>
                    <h1 className="text-2xl font-black text-slate-950 tracking-tight uppercase">
                      {resumeData.personalInfo.fullName}
                    </h1>
                    <p className="text-xs font-extrabold text-slate-700 uppercase tracking-widest mt-0.5">
                      {resumeData.personalInfo.jobTitle}
                    </p>
                    <div className={`flex flex-wrap items-center gap-3 text-[11px] text-slate-600 font-semibold mt-2 ${template === "classic" ? "justify-center" : ""}`}>
                      <span>{resumeData.personalInfo.email}</span> &bull;
                      <span>{resumeData.personalInfo.phone}</span> &bull;
                      <span>{resumeData.personalInfo.location}</span>
                    </div>
                  </div>

                  {resumeData.summary && (
                    <div className="mb-4 space-y-1">
                      <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1">
                        Summary
                      </h2>
                      <p className="text-[11px] text-slate-800 leading-relaxed font-medium">{resumeData.summary}</p>
                    </div>
                  )}

                  {resumeData.skills.length > 0 && (
                    <div className="mb-4 space-y-1">
                      <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1">
                        Skills
                      </h2>
                      <p className="text-[11px] text-slate-800 font-semibold">{resumeData.skills.join(" • ")}</p>
                    </div>
                  )}

                  {resumeData.experience.length > 0 && (
                    <div className="mb-4 space-y-3">
                      <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1">
                        Experience
                      </h2>
                      {resumeData.experience.map((exp) => (
                        <div key={exp.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span>{exp.role}, {exp.company}</span>
                            <span className="text-[10px] text-slate-600">{exp.startDate} - {exp.endDate}</span>
                          </div>
                          <ul className="list-disc list-inside text-[10.5px] text-slate-800 space-y-0.5">
                            {exp.bullets.map((b, idx) => (
                              <li key={idx}>{b}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ATS Score Audit Modal */}
      {atsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center font-bold">
                  <Zap size={22} className="fill-purple-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-950 text-base">Codenthra ATS Score Audit</h3>
                  <p className="text-[11px] text-slate-500 font-medium">AI parsing compatibility evaluation</p>
                </div>
              </div>
              <button onClick={() => setAtsModalOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold text-xl cursor-pointer">
                &times;
              </button>
            </div>

            {isScoringATS ? (
              <div className="py-12 text-center space-y-3">
                <RefreshCw size={32} className="animate-spin text-purple-600 mx-auto" />
                <p className="text-xs font-bold text-slate-700">Codenthra AI is scanning your resume structure...</p>
              </div>
            ) : atsResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-purple-50 p-4 rounded-2xl border border-purple-100">
                  <div>
                    <p className="text-3xl font-black text-purple-700">{atsResult.score || 94}%</p>
                    <p className="text-[10px] text-purple-600 font-mono font-bold uppercase tracking-wider">ATS Score</p>
                  </div>
                  <div className="text-xs text-slate-700 font-medium max-w-xs leading-relaxed">
                    Your resume aligns excellently with standard corporate Applicant Tracking Systems (ATS).
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Key Recommendations</p>
                  <ul className="space-y-2 text-xs text-slate-700 font-medium">
                    {atsResult.feedback?.map((f: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
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
                        <button
                          key={i}
                          onClick={() => handleAddSkill(k)}
                          className="px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-bold transition-all cursor-pointer"
                        >
                          + {k}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            <div className="pt-2 flex justify-end border-t border-slate-100">
              <button
                onClick={() => setAtsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer shadow-md"
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
