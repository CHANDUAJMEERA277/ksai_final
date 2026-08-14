"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LeftSidebar } from "@/components/dashboard/LeftSidebar";
import {
  Code2,
  Brain,
  Briefcase,
  Video,
  Sparkles,
  Play,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Layers,
  Award,
} from "lucide-react";

type InterviewType = "technical" | "coding" | "hr" | "mock";

const interviewTypes = [
  { id: "technical" as InterviewType, title: "Technical Interview", icon: Code2, desc: "CS fundamentals & language concepts" },
  { id: "coding" as InterviewType, title: "Coding Challenge", icon: Brain, desc: "Live algorithmic problem solving" },
  { id: "hr" as InterviewType, title: "HR & Behavioral", icon: Briefcase, desc: "Soft skills & situational questions" },
  { id: "mock" as InterviewType, title: "Full AI Mock Round", icon: Video, desc: "End-to-end multi-round assessment" },
];

const roles = [
  "Software Engineer",
  "Java Developer",
  "Python Developer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "DevOps Engineer",
];

const technologies = [
  "Java",
  "Python",
  "C++",
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "SQL",
];

const experienceLevels = [
  { id: "fresher", title: "Fresher", label: "0 Years" },
  { id: "junior", title: "0–1 Years", label: "Junior" },
  { id: "mid", title: "1–3 Years", label: "Intermediate" },
  { id: "senior", title: "3+ Years", label: "Experienced" },
];

const difficulties = [
  { id: "beginner", title: "Beginner", desc: "Basic concepts" },
  { id: "intermediate", title: "Intermediate", desc: "Moderate questions" },
  { id: "advanced", title: "Advanced", desc: "Deep technical & edge cases" },
];

export default function InterviewSetupPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center font-mono text-xs">Loading Interview Configurator...</div>}>
      <InterviewSetupContent />
    </Suspense>
  );
}

function InterviewSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedType, setSelectedType] = useState<InterviewType>(
    (searchParams.get("type") as InterviewType) || "technical"
  );
  const [selectedRole, setSelectedRole] = useState("Software Engineer");
  const [selectedTech, setSelectedTech] = useState(searchParams.get("technology") || "Java");
  const [selectedExp, setSelectedExp] = useState("fresher");
  const [selectedDifficulty, setSelectedDifficulty] = useState("intermediate");
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  const handleStartSession = () => {
    const params = new URLSearchParams({
      type: selectedType,
      role: selectedRole,
      technology: selectedTech,
      experience: selectedExp,
      difficulty: selectedDifficulty,
    });
    router.push(`/interview/session?${params.toString()}`);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans antialiased">
      {/* Unified Left Sidebar */}
      <LeftSidebar
        activeTab="Interview Prep"
        onTabChange={(tab) => {
          if (tab === "Dashboard") router.push("/dashboard");
          else if (tab === "Explore Courses") router.push("/courses/catalog");
          else if (tab === "Courses") router.push("/courses");
          else if (tab === "Leaderboard") router.push("/leaderboard");
          else if (tab === "AI Quiz Generator") router.push("/quiz-generator");
          else if (tab === "Editor" || tab === "Workspace") router.push("/editor");
          else if (tab === "Certificates") router.push("/certificates");
          else if (tab === "Interview Prep") router.push("/interview");
          else if (tab === "Settings") router.push("/settings");
        }}
        fullHeight={true}
      />

      {/* Main 100vh Non-Scrollable Light Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-[#F8FAFC] p-5 lg:p-6 gap-5">
        {/* Top Header & Step Navigation Ribbon */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/interview")}
              className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-xs transition"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                Configure Your <span className="text-blue-600">AI Interview</span>
              </h1>
              <p className="text-xs text-slate-500">Customize target role, language, and difficulty level</p>
            </div>
          </div>

          {/* 3 Step Wizard Controls */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-2xl shadow-xs">
            <button
              onClick={() => setActiveStep(1)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                activeStep === 1 ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Layers size={13} /> 1. Track & Role
            </button>
            <ChevronRight size={14} className="text-slate-400" />
            <button
              onClick={() => setActiveStep(2)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                activeStep === 2 ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Code2 size={13} /> 2. Tech & Experience
            </button>
            <ChevronRight size={14} className="text-slate-400" />
            <button
              onClick={() => setActiveStep(3)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                activeStep === 3 ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Award size={13} /> 3. Difficulty & Launch
            </button>
          </div>
        </div>

        {/* Dynamic Wizard Body Card */}
        <div className="flex-1 rounded-3xl border border-slate-200 bg-white p-6 flex flex-col justify-between min-h-0 overflow-hidden shadow-xs relative">
          {activeStep === 1 && (
            <div className="flex-1 flex flex-col min-h-0 gap-6 overflow-y-auto pr-1">
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-blue-600 mb-3">Step 1: Select Interview Type</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {interviewTypes.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelectedType(item.id)}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          selectedType === item.id
                            ? "bg-blue-50 border-blue-600 text-blue-950 shadow-md"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <Icon size={20} className={selectedType === item.id ? "text-blue-600" : "text-slate-500"} />
                        <h3 className="text-xs font-black text-slate-900 mt-3">{item.title}</h3>
                        <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-blue-600 mb-3">Step 2: Select Target Role</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {roles.map((role) => (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`p-3 rounded-xl border text-xs font-bold text-center transition ${
                        selectedRole === role
                          ? "bg-indigo-50 border-indigo-600 text-indigo-950 shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="flex-1 flex flex-col min-h-0 gap-6 overflow-y-auto pr-1">
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-blue-600 mb-3">Step 1: Select Primary Technology</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {technologies.map((tech) => (
                    <button
                      key={tech}
                      onClick={() => setSelectedTech(tech)}
                      className={`p-4 rounded-2xl border text-xs font-bold text-center transition ${
                        selectedTech === tech
                          ? "bg-blue-50 border-blue-600 text-blue-950 shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {tech}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-blue-600 mb-3">Step 2: Select Experience Level</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {experienceLevels.map((exp) => (
                    <button
                      key={exp.id}
                      onClick={() => setSelectedExp(exp.id)}
                      className={`p-4 rounded-2xl border text-left transition ${
                        selectedExp === exp.id
                          ? "bg-indigo-50 border-indigo-600 text-indigo-950 shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <h3 className="text-xs font-bold text-slate-900">{exp.title}</h3>
                      <p className="text-[10px] text-slate-500 mt-1">{exp.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="flex-1 flex flex-col min-h-0 gap-6 justify-center max-w-3xl mx-auto w-full">
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-blue-600 mb-3 text-center">Select Difficulty Level</h2>
                <div className="grid grid-cols-3 gap-4">
                  {difficulties.map((diff) => (
                    <button
                      key={diff.id}
                      onClick={() => setSelectedDifficulty(diff.id)}
                      className={`p-5 rounded-2xl border text-center transition ${
                        selectedDifficulty === diff.id
                          ? "bg-blue-50 border-blue-600 text-blue-950 shadow-md"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <h3 className="text-sm font-bold text-slate-900 capitalize">{diff.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">{diff.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Config Summary */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-600 font-medium">Selected Config:</span>
                  <span className="font-black text-slate-900 ml-2">{selectedRole} • {selectedTech} • {selectedDifficulty}</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-600 font-bold">
                  <CheckCircle2 size={15} /> Ready to launch
                </div>
              </div>
            </div>
          )}

          {/* Sticky Bottom Action Ribbon */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Track: <strong className="text-slate-900 capitalize">{selectedType}</strong></span>
              <span>•</span>
              <span>Role: <strong className="text-slate-900">{selectedRole}</strong></span>
              <span>•</span>
              <span>Tech: <strong className="text-blue-600">{selectedTech}</strong></span>
            </div>

            <div className="flex items-center gap-3">
              {activeStep > 1 && (
                <button
                  onClick={() => setActiveStep((prev) => (prev - 1) as any)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  Previous Step
                </button>
              )}

              {activeStep < 3 ? (
                <button
                  onClick={() => setActiveStep((prev) => (prev + 1) as any)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition flex items-center gap-1.5 shadow-sm"
                >
                  Next Step →
                </button>
              ) : (
                <button
                  onClick={handleStartSession}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 hover:scale-105"
                >
                  <Play size={16} fill="white" /> Launch Live AI Interview
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}