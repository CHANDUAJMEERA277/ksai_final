"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { TopNavbar } from "@/components/dashboard/TopNavbar";
import { LeftSidebar } from "@/components/dashboard/LeftSidebar";
import { RightAIPanel } from "@/components/dashboard/RightAIPanel";
import { Trophy, ArrowLeft, ArrowRight, Code2, Loader2, Zap, CheckCircle2 } from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
}

interface Contest {
  id: string;
  title: string;
  description: string;
  status: string;
  startTime: string;
  endTime: string;
  challenges: Challenge[];
}

export default function StudentContestDetailPage({
  params,
}: {
  params: Promise<{ contestId: string }>;
}) {
  const { contestId } = use(params);
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [activeTab, setActiveTab] = useState("Contests");
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending) {
      if (session?.user) {
        fetch("/api/contests")
          .then((res) => res.json())
          .then((data) => {
            if (data.success && Array.isArray(data.contests)) {
              const target = data.contests.find((c: Contest) => c.id === contestId);
              if (target) {
                setContest(target);
              }
            }
            setLoading(false);
          })
          .catch((err) => {
            console.error(err);
            setLoading(false);
          });
      } else {
        router.push("/auth");
      }
    }
  }, [session, isPending, contestId, router]);

  const getXpAward = (diff: string) => {
    const d = diff?.toUpperCase();
    if (d === "HARD") return 150;
    if (d === "MEDIUM") return 75;
    return 30;
  };

  return (
    <div className="h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col selection:bg-cyan-500 selection:text-black overflow-hidden font-sans">
      <TopNavbar
        userName={session?.user?.name || "Student"}
        userRole={(session?.user as any)?.role || "Student"}
      />

      <div className="flex-1 flex w-full overflow-hidden">
        <LeftSidebar activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />

        <main
          data-lenis-prevent
          className="flex-1 overflow-y-auto h-full p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full custom-scrollbar"
        >
          <div className="flex items-center justify-between">
            <Link
              href="/contests"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Contests
            </Link>

            {contest && (
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-700 inline-flex items-center gap-1">
                <CheckCircle2 size={13} /> {contest.status}
              </span>
            )}
          </div>

          {loading ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 size={32} className="animate-spin text-blue-600 mx-auto" />
              <p className="text-xs text-slate-400 font-semibold">Loading contest challenges...</p>
            </div>
          ) : !contest ? (
            <div className="p-8 rounded-2xl bg-rose-50 text-rose-700 text-xs font-bold text-center border border-rose-200">
              Contest not found or unavailable.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Contest Title & Info */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white space-y-3 shadow-xs">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold border border-amber-200">
                  <Trophy size={14} className="text-amber-500" /> Active Contest
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{contest.title}</h1>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{contest.description}</p>
              </div>

              {/* Challenges Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Code2 className="text-blue-600" size={20} /> Challenges ({contest.challenges.length})
                </h2>

                {contest.challenges.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-400 font-medium">
                    No challenges published in this contest yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contest.challenges.map((ch, idx) => {
                      const xp = getXpAward(ch.difficulty);
                      return (
                        <div
                          key={ch.id}
                          className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <h3 className="text-base font-extrabold text-slate-900">{ch.title}</h3>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                  ch.difficulty === "HARD"
                                    ? "bg-rose-100 text-rose-700"
                                    : ch.difficulty === "MEDIUM"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-emerald-100 text-emerald-700"
                                }`}
                              >
                                {ch.difficulty}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2 pl-8">{ch.description}</p>
                          </div>

                          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                              <Zap size={14} className="fill-amber-500" /> +{xp} XP
                            </span>

                            <button
                              onClick={() =>
                                router.push(`/contests/${contest.id}/challenges/${ch.id}`)
                              }
                              className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              Solve Problem <ArrowRight size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        <RightAIPanel />
      </div>
    </div>
  );
}
