"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import {
  School,
  Users,
  BookOpen,
  TrendingUp,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Layers,
  Award,
} from "lucide-react";
import { CollegeAnalyticsData } from "@/lib/college/types";

export default function CollegePage() {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || "student@ksai.edu";

  const [analytics, setAnalytics] = useState<CollegeAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) return;

    let isMounted = true;
    setLoading(true);

    fetch(`/api/college/analytics?userEmail=${encodeURIComponent(userEmail)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && isMounted) {
          setAnalytics(json.data);
        }
      })
      .catch((err) => console.error("Failed to load college analytics:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userEmail]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <School className="text-blue-600" size={32} />
            College & Institutional Intelligence
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Authorized aggregate curriculum health, concept bottlenecks, and pedagogical insights.
          </p>
        </div>

        {analytics && (
          <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-2xl text-xs font-bold text-blue-700">
            {analytics.overview.collegeName}
          </div>
        )}
      </div>

      {loading || !analytics ? (
        <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2">
          <Sparkles className="animate-spin text-blue-600" size={24} />
          <span className="text-sm">Aggregating institutional learning health metrics...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Institutional Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Enrolled Students
              </span>
              <div className="text-3xl font-black text-slate-900 mt-1">
                {analytics.overview.totalStudents}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Active engineering batches</p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Avg Concept Mastery
              </span>
              <div className="text-3xl font-black text-blue-600 mt-1">
                {analytics.overview.averageMasteryRate}%
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Across all 4 core language tracks</p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Assessment Pass Rate
              </span>
              <div className="text-3xl font-black text-emerald-600 mt-1">
                {analytics.overview.assessmentPassRate}%
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Checkpoints & Adaptive Tests</p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Support Queued
              </span>
              <div className="text-3xl font-black text-amber-600 mt-1">
                {analytics.studentsNeedingSupportCount}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Targeted study plans assigned</p>
            </div>
          </div>

          {/* Course Health & Common Bottlenecks */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <BookOpen size={16} className="text-blue-600" />
                Course Tracks & Conceptual Bottlenecks
              </h3>

              <div className="space-y-3">
                {analytics.courseHealth.map((ch) => (
                  <div
                    key={ch.courseSlug}
                    className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{ch.courseTitle}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {ch.enrolledCount} active students • {ch.completionRate}% completion rate
                        </p>
                      </div>

                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {ch.averageMastery}% Mastery
                      </span>
                    </div>

                    {ch.commonWeakConcepts.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Primary Concept Friction Points:
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          {ch.commonWeakConcepts.map((cw, idx) => (
                            <span
                              key={idx}
                              className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1"
                            >
                              <AlertCircle size={12} className="text-amber-600" />
                              {cw.name} ({cw.struggleRate}% struggle rate)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Faculty Actionable Insights */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-600" />
                Actionable Faculty Insights
              </h3>

              <div className="space-y-3">
                {analytics.insights.map((ins) => (
                  <div
                    key={ins.id}
                    className={`p-4 rounded-3xl border shadow-2xs space-y-2 ${
                      ins.severity === "HIGH"
                        ? "bg-amber-50/40 border-amber-200"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                        {ins.title}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ins.severity === "HIGH"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {ins.category.replace(/_/g, " ")}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">{ins.insight}</p>

                    <div className="pt-2 border-t border-slate-200/60">
                      <p className="text-[11px] text-indigo-700 font-semibold">
                        💡 <span className="font-bold">Recommended Action:</span>{" "}
                        {ins.recommendedFacultyAction}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
