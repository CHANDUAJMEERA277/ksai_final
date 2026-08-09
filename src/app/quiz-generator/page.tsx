"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { TopNavbar } from "@/components/dashboard/TopNavbar";
import { LeftSidebar } from "@/components/dashboard/LeftSidebar";
import { RightAIPanel } from "@/components/dashboard/RightAIPanel";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { Sparkles, Brain, Award, ShieldQuestion, ArrowRight } from "lucide-react";

export default function QuizGeneratorPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    if (!isPending) {
      if (session?.user) {
        setUser({
          id: (session.user as any).id,
          name: session.user.name ?? "",
          email: session.user.email ?? "",
          role: (session.user as any).role ?? "Student",
        });
      } else {
        router.push("/auth");
      }
    }
  }, [session, isPending, router]);

  const handleTabChange = (tab: string) => {
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

  return (
    <div className="h-screen bg-[#F8FAFC] text-[#0F172A] flex overflow-hidden font-sans antialiased">
      {/* Left Sidebar Menu */}
      <LeftSidebar
        activeTab="AI Quiz Generator"
        onTabChange={handleTabChange}
        userProfile={user || undefined}
        isLight={false}
        fullHeight={true}
      />

      <main className="flex-1 overflow-y-auto h-full p-4 sm:p-6 lg:p-8 space-y-6 w-full custom-scrollbar">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-2 bg-gradient-to-r from-blue-950/40 via-cyan-950/20 to-purple-950/30 shadow-2xl relative overflow-hidden">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-semibold border border-cyan-500/20">
              <Sparkles size={13} /> AI Quiz Generator &bull; Instant Knowledge Checks
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              AI Quiz Generator 🧠
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              Generate custom assessments, practice quizzes, and mock exams for any programming topic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 bg-white/5">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <ShieldQuestion size={24} />
              </div>
              <h2 className="text-lg font-bold">Custom Topic Selection</h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                Choose any technical topic, set the level of difficulty, and let our LLM engines build customized, high-quality question banks immediately.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 bg-white/5">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Award size={24} />
              </div>
              <h2 className="text-lg font-bold">Performance Insights & XP</h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                Earn XP for passing generated assessments. Analyze correct/incorrect answers, logic explanations, and track your metrics over time.
              </p>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent text-center space-y-4">
            <Brain className="mx-auto text-cyan-400 animate-bounce" size={40} />
            <h3 className="text-lg font-bold">Quiz Generator Engine is Launching Soon</h3>
            <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
              We are finalizing the integration with our AI agent vector storage databases to support parsing custom code repositories. Standby!
            </p>
          </div>

          <DashboardFooter />
        </main>

        <RightAIPanel />
    </div>
  );
}
