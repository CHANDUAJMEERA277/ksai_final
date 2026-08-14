"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PracticeResultsAnalytics } from "@/components/practice/PracticeResultsAnalytics";
import { LeftSidebar } from "@/components/dashboard/LeftSidebar";

export default function PracticeResultsPage() {
  const params = useParams<{ sessionId: string }>();
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.sessionId) return;
    fetch(`/api/practice/session/${params.sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        setSessionData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params?.sessionId]);

  if (loading) {
    return (
      <div className="h-screen bg-[#F8FAFC] text-slate-800 flex overflow-hidden font-sans">
        <LeftSidebar
          activeTab="AI Quiz Generator"
          onTabChange={() => {}}
          fullHeight={true}
        />
        <main className="flex-1 h-full flex items-center justify-center text-xs font-mono font-bold text-slate-500">
          Loading Evaluation Report...
        </main>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="h-screen bg-[#F8FAFC] text-slate-800 flex overflow-hidden font-sans">
        <LeftSidebar
          activeTab="AI Quiz Generator"
          onTabChange={() => {}}
          fullHeight={true}
        />
        <main className="flex-1 h-full flex items-center justify-center text-xs font-mono font-bold text-slate-500">
          No results evaluation report available for this session ID.
        </main>
      </div>
    );
  }

  return <PracticeResultsAnalytics sessionData={sessionData} />;
}
