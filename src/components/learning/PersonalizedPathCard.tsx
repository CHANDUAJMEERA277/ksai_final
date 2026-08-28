"use client";

import React, { useEffect, useState } from "react";
import {
  Compass,
  ArrowRight,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Zap,
} from "lucide-react";
import { PersonalizedLearningPath } from "@/lib/learning-path/types";

interface PersonalizedPathCardProps {
  userEmail: string;
  courseSlug: string;
  onNavigateTopic?: (topic: string) => void;
  compact?: boolean;
}

export function PersonalizedPathCard({
  userEmail,
  courseSlug,
  onNavigateTopic,
  compact = false,
}: PersonalizedPathCardProps) {
  const [pathData, setPathData] = useState<PersonalizedLearningPath | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) return;

    let isMounted = true;
    const fetchPath = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/learning-path?userEmail=${encodeURIComponent(userEmail)}&courseSlug=${encodeURIComponent(courseSlug)}`
        );
        const json = await res.json();
        if (json.success && isMounted) {
          setPathData(json.data);
        }
      } catch (err) {
        console.error("Failed to load personalized path:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPath();
    return () => {
      isMounted = false;
    };
  }, [userEmail, courseSlug]);

  if (loading || !pathData) {
    return (
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
        <div className="h-3 bg-slate-100 rounded w-2/3" />
      </div>
    );
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case "RETEACH":
        return {
          bg: "bg-red-50 text-red-700 border-red-200",
          icon: <RefreshCw size={12} className="animate-spin-slow" />,
          label: "Needs Reinforcement",
        };
      case "REVIEW":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          icon: <AlertTriangle size={12} />,
          label: "Prerequisite Gap",
        };
      case "PRACTICE":
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          icon: <Zap size={12} />,
          label: "Targeted Practice",
        };
      case "ADVANCE":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <CheckCircle2 size={12} />,
          label: "Mastered • Advance",
        };
      default:
        return {
          bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
          icon: <BookOpen size={12} />,
          label: "Next Lesson",
        };
    }
  };

  const badge = getActionBadge(pathData.recommendedNextAction);

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-white to-blue-50/30 border border-blue-100 shadow-sm transition-all hover:border-blue-200">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Compass size={15} />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-slate-800">
            Personalized Learning Focus
          </span>
        </div>

        <span
          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${badge.bg}`}
        >
          {badge.icon}
          {badge.label}
        </span>
      </div>

      <div className="mt-2">
        <h4 className="text-sm font-black text-slate-900 leading-snug">
          {pathData.recommendedNextTopic}
        </h4>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
          {pathData.educationalRationale}
        </p>
      </div>

      {!compact && onNavigateTopic && (
        <button
          type="button"
          onClick={() => onNavigateTopic(pathData.recommendedNextTopic)}
          className="mt-3 w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <span>Continue with Adaptive Teacher</span>
          <ArrowRight size={13} />
        </button>
      )}
    </div>
  );
}
