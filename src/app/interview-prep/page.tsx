"use client";

import React, { useState } from "react";
import { TopNavbar } from "@/components/dashboard/TopNavbar";
import { LeftSidebar } from "@/components/dashboard/LeftSidebar";

export default function InterviewPrepPage() {
  const [activeTab, setActiveTab] = useState("Interview Prep");

  return (
    <div className="h-screen bg-[#F8FAFC] text-[#0F172A] flex overflow-hidden font-sans antialiased">
      <LeftSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isLight={false}
        fullHeight={true}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNavbar userName="Dhanalaxmi" userRole="Pro Developer" />
        <main className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-[#09090B] p-6 text-center">
          <div className="space-y-4 max-w-md p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0C0C14] shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto text-purple-500 text-3xl">
              🎥
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Interview Prep — Coming Soon
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
              Practice real-time technical interviews with AI, get detailed feedback, and prepare for your target roles.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
