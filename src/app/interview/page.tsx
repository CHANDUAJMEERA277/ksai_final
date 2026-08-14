"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LeftSidebar } from "@/components/dashboard/LeftSidebar";
import {
  Code2,
  Brain,
  Briefcase,
  Video,
  Sparkles,
  Play,
  ArrowRight,
  Target,
  BarChart3,
  Zap,
} from "lucide-react";

interface InterviewRecord {
  title: string;
  type: string;
  score: number;
  date: string;
  status: string;
}

const interviewTypes = [
  {
    id: "technical",
    title: "Technical Interview",
    description: "Deep dive into CS fundamentals, system design, and language concepts.",
    icon: Code2,
    badge: "AI Evaluated",
    bgColor: "bg-blue-50/80 hover:bg-blue-100/80 border-blue-200",
    iconBg: "bg-blue-600 text-white",
  },
  {
    id: "coding",
    title: "Coding Interview",
    description: "Solve live algorithmic challenges and data structure problems.",
    icon: Brain,
    badge: "Live Runner",
    bgColor: "bg-purple-50/80 hover:bg-purple-100/80 border-purple-200",
    iconBg: "bg-purple-600 text-white",
  },
  {
    id: "hr",
    title: "HR & Behavioral",
    description: "Practice situational questions, leadership principles, and soft skills.",
    icon: Briefcase,
    badge: "Voice & Speech",
    bgColor: "bg-emerald-50/80 hover:bg-emerald-100/80 border-emerald-200",
    iconBg: "bg-emerald-600 text-white",
  },
  {
    id: "mock",
    title: "Full AI Mock Interview",
    description: "End-to-end multi-round interview simulation with full scorecard.",
    icon: Video,
    badge: "Full Proctor",
    bgColor: "bg-amber-50/80 hover:bg-amber-100/80 border-amber-200",
    iconBg: "bg-amber-600 text-white",
  },
];

const technologies = [
  "Java",
  "Python",
  "C++",
  "JavaScript",
  "React",
  "Node.js",
  "SQL",
  "Data Structures",
];

export default function InterviewPage() {
  const router = useRouter();
  const [selectedTech, setSelectedTech] = useState("Java");
  const [history, setHistory] = useState<InterviewRecord[]>([]);
  const [readinessScore, setReadinessScore] = useState<number>(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ksai_interview_history");
      if (saved) {
        const parsed: InterviewRecord[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistory(parsed);
          const totalScore = parsed.reduce((acc, item) => acc + (item.score || 0), 0);
          setReadinessScore(Math.round(totalScore / parsed.length));
        } else {
          setHistory([]);
          setReadinessScore(0);
        }
      } else {
        setHistory([]);
        setReadinessScore(0);
      }
    } catch {
      setHistory([]);
      setReadinessScore(0);
    }
  }, []);

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
        {/* Top Header Banner */}
        <div className="relative rounded-3xl border border-slate-200 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 shrink-0 shadow-lg text-white overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-black uppercase tracking-wider backdrop-blur-md">
                <Sparkles size={13} /> CodeXAI Interview Engine v3.0
              </div>
              <h1 className="text-2xl lg:text-3xl font-black mt-2 tracking-tight">
                Prepare for your <span className="underline decoration-cyan-400 decoration-wavy">Next Tech Interview</span>
              </h1>
              <p className="text-xs text-blue-100 mt-1 max-w-2xl font-medium">
                Practice real-time technical questions with CodeXAI. Receive instant feedback on your technical depth, communication, and response relevance.
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-center backdrop-blur-md">
                <p className="text-[10px] text-blue-100 uppercase font-black tracking-wider">Readiness Score</p>
                <p className="text-xl font-black text-white">{readinessScore}%</p>
              </div>
              <button
                onClick={() => router.push("/interview/setup?type=mock")}
                className="px-6 py-3 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-black text-xs shadow-md transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                <Play size={16} className="fill-blue-700 text-blue-700" /> Start AI Mock Interview
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Dashboard Grid */}
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-5 min-h-0 overflow-hidden">
          {/* Left Column (2 Cols): Interview Selection & Technologies */}
          <div className="xl:col-span-2 flex flex-col gap-5 min-h-0 overflow-hidden">
            {/* Interview Types (2x2 Grid) */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Target size={16} className="text-blue-600" /> Choose Interview Track
                </h2>
                <span className="text-xs text-slate-400 font-bold">Select mode to begin setup</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1 min-h-0">
                {interviewTypes.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => router.push(`/interview/setup?type=${item.id}`)}
                      className={`group text-left p-4.5 rounded-2xl border ${item.bgColor} shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden`}
                    >
                      <div className="flex items-start justify-between">
                        <div className={`w-10 h-10 rounded-xl ${item.iconBg} shadow-sm flex items-center justify-center`}>
                          <Icon size={20} />
                        </div>
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs">
                          {item.badge}
                        </span>
                      </div>

                      <div className="mt-3">
                        <h3 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition flex items-center justify-between">
                          {item.title} <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 text-blue-600" />
                        </h3>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tech Stack Horizontal Selector */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shrink-0 shadow-xs">
              <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5">
                Practice By Topic & Language
              </p>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {technologies.map((tech) => (
                  <button
                    key={tech}
                    onClick={() => {
                      setSelectedTech(tech);
                      router.push(`/interview/setup?technology=${encodeURIComponent(tech)}`);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition ${
                      selectedTech === tech
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (1 Col): Dynamic History & Focus */}
          <div className="flex flex-col gap-5 min-h-0 overflow-hidden">
            {/* Dynamic Recent History */}
            <div className="flex-1 flex flex-col rounded-2xl border border-slate-200 bg-white p-4 min-h-0 overflow-hidden shadow-xs">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <BarChart3 size={15} className="text-blue-600" /> Recent Practice History
                </h3>
                <span className="text-[10px] text-slate-400 font-bold">{history.length} Completed</span>
              </div>

              <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-1">
                {history.length > 0 ? (
                  history.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">{item.type} • {item.date}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-blue-600">{item.score}%</span>
                        <p className="text-[9px] text-emerald-600 font-bold">{item.status}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <BarChart3 size={24} className="text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-700">No Interview Sessions Yet</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                      Complete your first AI practice round above to dynamically view your score history!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Next Recommended Focus Card */}
            <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 p-4 shrink-0 shadow-xs">
              <div className="flex items-center gap-2 text-indigo-700 text-xs font-black mb-1.5">
                <Zap size={14} /> Recommended Action
              </div>
              <p className="text-xs font-black text-slate-900">Master {selectedTech} Core Concepts</p>
              <p className="text-[11px] text-slate-600 mt-1">Practice interview questions for {selectedTech} to calculate your overall readiness score.</p>
              <button
                onClick={() => router.push(`/interview/setup?technology=${encodeURIComponent(selectedTech)}`)}
                className="w-full mt-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-sm transition"
              >
                Practice {selectedTech} Interview →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}