import React from "react";
import Link from "next/link";
import { requireAdminPage } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Users, Trophy, Code2, CheckCircle2, ArrowRight, PlusCircle, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const admin = await requireAdminPage();

  const totalStudents = await db.user.count();
  const activeContests = await db.contest.count({ where: { status: "PUBLISHED" } });
  const totalContests = await db.contest.count();
  const totalChallenges = await db.challenge.count();
  const totalSubmissions = await db.submission.count();
  const passedSubmissions = await db.submission.count({ where: { status: "PASSED" } });

  const recentContests = await db.contest.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      _count: { select: { challenges: true } },
    },
  });

  const recentSubmissions = await db.submission.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      user: { select: { name: true, email: true } },
      challenge: { select: { title: true, difficulty: true } },
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <AdminHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md">
              <ShieldCheck size={14} /> System Administrator Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {admin.name} 👋
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm max-w-xl">
              Manage contests, create challenges, inspect live student submissions, and verify the full XP & leaderboard pipeline.
            </p>
          </div>
          <Link
            href="/admin/contests"
            className="px-5 py-2.5 rounded-xl bg-white text-blue-600 font-bold text-xs shadow-md hover:bg-blue-50 transition-all inline-flex items-center gap-2 shrink-0"
          >
            <PlusCircle size={14} /> Create New Contest
          </Link>
        </div>

        {/* 4 Overview Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Users size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Users</p>
              <h3 className="text-2xl font-black text-slate-900">{totalStudents}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <Trophy size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Contests</p>
              <h3 className="text-2xl font-black text-slate-900">
                {activeContests} <span className="text-xs font-normal text-slate-400">/ {totalContests}</span>
              </h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <Code2 size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Challenges</p>
              <h3 className="text-2xl font-black text-slate-900">{totalChallenges}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Submissions</p>
              <h3 className="text-2xl font-black text-slate-900">
                {totalSubmissions} <span className="text-xs font-normal text-emerald-600">({passedSubmissions} passed)</span>
              </h3>
            </div>
          </div>
        </div>

        {/* Quick Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Contests Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Trophy size={18} className="text-amber-500" /> Recent Contests
              </h2>
              <Link href="/admin/contests" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                View All <ArrowRight size={12} />
              </Link>
            </div>

            {recentContests.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No contests created yet. Click above to create one.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentContests.map((c) => (
                  <div key={c.id} className="py-3 flex items-center justify-between">
                    <div>
                      <Link href={`/admin/contests/${c.id}`} className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors">
                        {c.title}
                      </Link>
                      <p className="text-xs text-slate-500">{c._count.challenges} Challenges</p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        c.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Submissions Activity */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Code2 size={18} className="text-blue-500" /> Recent Student Submissions
              </h2>
              <Link href="/admin/submissions" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                View All <ArrowRight size={12} />
              </Link>
            </div>

            {recentSubmissions.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No student submissions recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentSubmissions.map((s) => (
                  <div key={s.id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-slate-900">{s.user.name}</span>
                      <p className="text-xs text-slate-500">{s.challenge.title}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === "PASSED" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {s.status}
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">+{s.xpAwarded} XP</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
