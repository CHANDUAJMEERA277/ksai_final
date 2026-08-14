"use client";

import { useState } from "react";
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
  Flame,
  Trophy,
  Target,
  BarChart3,
  CheckCircle2,
  Zap,
} from "lucide-react";

const interviewTypes = [
  {
    id: "technical",
    title: "Technical Interview",
    description: "Deep dive into CS fundamentals, system design, and language concepts.",
    icon: Code2,
    badge: "AI Evaluated",
    gradient: "from-blue-500/20 to-cyan-500/20",
    borderColor: "hover:border-cyan-500/50",
    iconColor: "text-cyan-400",
  },
  {
    id: "coding",
    title: "Coding Interview",
    description: "Solve live algorithmic challenges and data structure problems.",
    icon: Brain,
    badge: "Live Runner",
    gradient: "from-purple-500/20 to-pink-500/20",
    borderColor: "hover:border-purple-500/50",
    iconColor: "text-purple-400",
  },
  {
    id: "hr",
    title: "HR & Behavioral",
    description: "Practice situational questions, leadership principles, and soft skills.",
    icon: Briefcase,
    badge: "Voice & Speech",
    gradient: "from-emerald-500/20 to-teal-500/20",
    borderColor: "hover:border-emerald-500/50",
    iconColor: "text-emerald-400",
  },
  {
    id: "mock",
    title: "Full AI Mock Interview",
    description: "End-to-end multi-round interview simulation with full scorecard.",
    icon: Video,
    badge: "Full Proctor",
    gradient: "from-amber-500/20 to-orange-500/20",
    borderColor: "hover:border-amber-500/50",
    iconColor: "text-amber-400",
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

const recentInterviews = [
  { title: "Java Technical Assessment", type: "Technical", score: 86, date: "Today", status: "Strong" },
  { title: "Full Stack Coding Challenge", type: "Coding", score: 92, date: "Yesterday", status: "Excellent" },
  { title: "HR Behavioral Round", type: "HR", score: 78, date: "3 days ago", status: "Good" },
];

export default function InterviewPage() {
  const router = useRouter();
  const [selectedTech, setSelectedTech] = useState("Java");

  return (
    <div className="flex h-screen bg-[#07070A] text-white overflow-hidden font-sans antialiased">
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

      {/* Main 100vh Non-Scrollable Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-[#09090D] p-5 lg:p-6 gap-5">
        {/* Top Banner Card */}
        <div className="relative rounded-3xl border border-white/10 bg-gradient-to-r from-[#121422] via-[#161329] to-[#0F1626] p-6 shrink-0 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-wider">
                <Sparkles size={13} /> CodeXAI Interview Engine v3.0
              </div>
              <h1 className="text-2xl lg:text-3xl font-black mt-2 tracking-tight">
                Prepare for your <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Next Tech Interview</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Practice real-time technical questions with CodeXAI. Receive instant feedback on your technical depth, communication, and response relevance.
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Readiness Score</p>
                <p className="text-xl font-black text-cyan-400">84%</p>
              </div>
              <button
                onClick={() => router.push("/interview/setup?type=mock")}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                <Play size={16} fill="white" /> Start AI Mock Interview
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
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Target size={16} className="text-cyan-400" /> Choose Interview Track
                </h2>
                <span className="text-xs text-slate-500 font-bold">Select mode to begin setup</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 min-h-0">
                {interviewTypes.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => router.push(`/interview/setup?type=${item.id}`)}
                      className={`group text-left p-4 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] ${item.borderColor} transition-all duration-300 flex flex-col justify-between relative overflow-hidden`}
                    >
                      <div className="flex items-start justify-between">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} border border-white/10 flex items-center justify-center`}>
                          <Icon size={20} className={item.iconColor} />
                        </div>
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 group-hover:border-cyan-500/40 transition">
                          {item.badge}
                        </span>
                      </div>

                      <div className="mt-3">
                        <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition flex items-center justify-between">
                          {item.title} <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tech Stack Horizontal Selector */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 shrink-0">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5">
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
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
                      selectedTech === tech
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-xs"
                        : "bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (1 Col): History & Focus */}
          <div className="flex flex-col gap-5 min-h-0 overflow-hidden">
            {/* Recent History */}
            <div className="flex-1 flex flex-col rounded-2xl border border-white/10 bg-white/[0.025] p-4 min-h-0 overflow-hidden">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <BarChart3 size={15} className="text-cyan-400" /> Recent Practice History
                </h3>
                <span className="text-[10px] text-cyan-400 font-bold cursor-pointer hover:underline">View All</span>
              </div>

              <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-1">
                {recentInterviews.map((item) => (
                  <div key={item.title} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.type} • {item.date}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-cyan-400">{item.score}%</span>
                      <p className="text-[9px] text-emerald-400 font-bold">{item.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Recommended Focus Card */}
            <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/20 via-blue-950/15 to-slate-900/40 p-4 shrink-0">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-black mb-2">
                <Zap size={14} /> Recommended Action
              </div>
              <p className="text-xs font-bold text-white">Master Java Multithreading & Memory Models</p>
              <p className="text-[11px] text-slate-400 mt-1">Based on your recent response metrics, strengthening concurrency concepts will boost your readiness to 90%+.</p>
              <button
                onClick={() => router.push("/interview/setup?technology=Java")}
                className="w-full mt-3 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-white font-bold text-xs transition"
              >
                Practice Java Interview →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}