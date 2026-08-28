"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  FileBadge,
  Calendar,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { SkillPassportItem, StudentSkillPassport } from "@/lib/skill-passport/types";

export default function SkillPassportPage() {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || "student@ksai.edu";

  const [passport, setPassport] = useState<StudentSkillPassport | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<SkillPassportItem | null>(null);

  useEffect(() => {
    if (!userEmail) return;

    let isMounted = true;
    setLoading(true);

    fetch(`/api/skill-passport?userEmail=${encodeURIComponent(userEmail)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && isMounted) {
          setPassport(json.data);
        }
      })
      .catch((err) => console.error("Failed to load skill passport:", err))
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
            <Award className="text-blue-600" size={32} />
            Digital Skill Passport
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Verified, evidence-backed competencies synthesized from Knowledge Graph assessments.
          </p>
        </div>

        {passport && (
          <div className="px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-2xs text-xs font-mono text-slate-600">
            Passport ID: <span className="font-bold text-blue-600">{passport.passportId}</span>
          </div>
        )}
      </div>

      {loading || !passport ? (
        <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2">
          <Sparkles className="animate-spin text-blue-600" size={24} />
          <span className="text-sm">Synthesizing verified skill passport...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                Verified Passport
              </span>
              <h3 className="text-lg font-black mt-1">{passport.studentName}</h3>
              <p className="text-xs text-blue-100 mt-2 flex items-center gap-1.5">
                <Calendar size={12} />
                Issued: {passport.issuedAt}
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Tracked Skills
              </span>
              <div className="text-3xl font-black text-slate-900 mt-1">
                {passport.overallSkillCount}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Across 4 core engineering domains</p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Verified Assessed
              </span>
              <div className="text-3xl font-black text-emerald-600 mt-1">
                {passport.verifiedSkillsCount}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Backed by assessment & checkpoints</p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Proficient Level
              </span>
              <div className="text-3xl font-black text-blue-600 mt-1">
                {passport.proficientSkillsCount}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Confidence score $\ge 85\%$</p>
            </div>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {passport.skills.map((skill) => (
              <div
                key={skill.id}
                onClick={() => setSelectedSkill(skill)}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs hover:border-blue-300 hover:shadow-xs transition cursor-pointer space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {skill.category.replace(/_/g, " ")}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1.5">{skill.name}</h4>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      skill.level === "PROFICIENT" || skill.level === "ADVANCED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : skill.level === "PRACTICED"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {skill.level}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500">Mastery Confidence</span>
                    <span className="font-bold text-slate-800">{skill.confidenceScore}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${skill.confidenceScore}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>{skill.evidenceCount} verified evidence points</span>
                  <span className="text-blue-600 font-bold hover:underline">View Proof &rarr;</span>
                </div>
              </div>
            ))}
          </div>

          {/* Evidence Modal / Details */}
          {selectedSkill && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
              <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="text-emerald-600" size={20} />
                    <h3 className="font-black text-base text-slate-900">{selectedSkill.name}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedSkill(null)}
                    className="text-slate-400 hover:text-slate-600 font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500">Verification State:</span>
                    <span className="ml-1.5 font-bold text-emerald-700">
                      {selectedSkill.verificationState}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Confidence:</span>
                    <span className="ml-1.5 font-bold text-blue-700">
                      {selectedSkill.confidenceScore}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-slate-600 tracking-wider">
                    Verified Proof & Evidence
                  </h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                    {selectedSkill.evidenceList.length > 0 ? (
                      selectedSkill.evidenceList.map((ev, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 flex items-start gap-2"
                        >
                          <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{ev}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">No formal evidence recorded yet.</p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    <span className="font-bold text-slate-700">Recommended Next Step:</span>{" "}
                    {selectedSkill.recommendedNextStep}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
