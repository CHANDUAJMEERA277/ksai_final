"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PracticeResultsAnalytics } from "@/components/practice/PracticeResultsAnalytics";

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
    return <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">Loading results…</div>;
  }

  if (!sessionData) {
    return <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">No results available for this session.</div>;
  }

  return <PracticeResultsAnalytics sessionData={sessionData} />;
}
