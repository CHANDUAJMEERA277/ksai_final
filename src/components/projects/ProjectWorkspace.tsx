"use client";

import React, { useState } from "react";
import {
  Code,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Bug,
  Sparkles,
  Play,
  FileCode,
  Layers,
  HelpCircle,
  Zap,
} from "lucide-react";
import {
  CoachAssistanceMode,
  ProjectDefinition,
  ProjectKnowledgeGapAnalysis,
  ProjectMilestone,
} from "@/lib/projects/types";

interface ProjectWorkspaceProps {
  project: ProjectDefinition & { gapAnalysis?: ProjectKnowledgeGapAnalysis };
  userEmail: string;
}

export function ProjectWorkspace({ project, userEmail }: ProjectWorkspaceProps) {
  const [activeMilestoneId, setActiveMilestoneId] = useState(project.milestones[0]?.id);
  const [coachMode, setCoachMode] = useState<CoachAssistanceMode>("HINT");
  const [code, setCode] = useState(project.starterCode || "");
  const [coachQuery, setCoachQuery] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachResponse, setCoachResponse] = useState<string | null>(null);
  const [completedMilestones, setCompletedMilestones] = useState<string[]>([]);

  const activeMilestone =
    project.milestones.find((m) => m.id === activeMilestoneId) || project.milestones[0];

  const handleAskCoach = async (modeToUse?: CoachAssistanceMode) => {
    const effectiveMode = modeToUse || coachMode;
    setCoachLoading(true);
    setCoachResponse(null);

    try {
      const res = await fetch("/api/projects/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail,
          projectId: project.id,
          milestoneId: activeMilestone.id,
          mode: effectiveMode,
          userQuery: coachQuery || `Provide ${effectiveMode} for ${activeMilestone.title}`,
          submittedCode: code,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setCoachResponse(json.data.feedback);
      } else {
        throw new Error(json.error || "Failed to get advice.");
      }
    } catch (err) {
      console.error("Coach query error:", err);
      setCoachResponse("Coach is currently unavailable. Please try again in a moment.");
    } finally {
      setCoachLoading(false);
    }
  };

  const handleCompleteMilestone = async (mId: string) => {
    try {
      await fetch("/api/projects/milestones/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail,
          projectId: project.id,
          milestoneId: mId,
        }),
      });
      setCompletedMilestones((prev) => [...prev, mId]);
    } catch (err) {
      console.error("Failed to complete milestone:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase">
                {project.course.toUpperCase()}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
                {project.difficulty}
              </span>
            </div>
            <h1 className="text-2xl font-black">{project.title}</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">{project.description}</p>
          </div>

          <div className="flex items-center gap-2">
            {project.technologies.map((tech, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-xl bg-white/10 text-slate-200 text-xs font-semibold border border-white/10"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Knowledge Gap Banner */}
        {project.gapAnalysis && (
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              {project.gapAnalysis.isReady ? (
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 size={16} />
                  <span>Knowledge Graph Readiness: {project.gapAnalysis.readinessScore}% (Ready to Build)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <AlertTriangle size={16} />
                  <span>{project.gapAnalysis.recommendation}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Milestones vs Code Editor & Coach */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Milestones */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Layers size={16} className="text-blue-600" />
            Project Milestones
          </h3>

          <div className="space-y-3">
            {project.milestones.map((m) => {
              const isCompleted = completedMilestones.includes(m.id);
              const isActive = activeMilestoneId === m.id;

              return (
                <div
                  key={m.id}
                  onClick={() => setActiveMilestoneId(m.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    isActive
                      ? "bg-blue-50/50 border-blue-400 shadow-xs"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-slate-900">{m.title}</h4>
                    {isCompleted ? (
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
                        ✓
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">Step {m.order}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{m.description}</p>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-500">
                      {m.tasks.length} sub-tasks
                    </span>

                    {!isCompleted && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteMilestone(m.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition shadow-2xs"
                      >
                        Mark Done
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Code & AI Project Coach */}
        <div className="lg:col-span-8 space-y-4">
          {/* Code Workspace */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <FileCode size={15} className="text-blue-400" />
                <span>main.{project.course === "cpp" ? "cpp" : project.course === "c" ? "c" : project.course === "python" ? "py" : "java"}</span>
              </div>

              <span className="text-[10px] text-slate-400 font-mono">
                {activeMilestone.title}
              </span>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your project code here..."
              rows={12}
              className="w-full p-4 font-mono text-xs text-slate-800 bg-slate-950/5 focus:outline-none resize-y"
            />
          </div>

          {/* AI Project Coach Panel */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/40 border border-indigo-100 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">AI Project Coach</h4>
                  <p className="text-[11px] text-slate-500">
                    Pedagogical guidance, code reviews, and debugging
                  </p>
                </div>
              </div>

              {/* Mode Chips */}
              <div className="flex items-center gap-1.5">
                {(
                  [
                    { mode: "HINT", label: "💡 Hint" },
                    { mode: "CODE_REVIEW", label: "🔍 Review Code" },
                    { mode: "DEBUG", label: "🐞 Debug" },
                    { mode: "TESTING", label: "🧪 Tests" },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.mode}
                    type="button"
                    onClick={() => {
                      setCoachMode(m.mode);
                      handleAskCoach(m.mode);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      coachMode === m.mode
                        ? "bg-indigo-600 text-white shadow-2xs"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Coach Output */}
            {coachLoading ? (
              <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <Sparkles size={14} className="text-indigo-600 animate-spin" />
                <span>Coach is analyzing your project milestone...</span>
              </div>
            ) : coachResponse ? (
              <div className="p-4 rounded-xl bg-white border border-indigo-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap shadow-2xs">
                {coachResponse}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Click any mode above or ask a question to receive real-time coaching for this milestone.
              </p>
            )}

            {/* Prompt input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={coachQuery}
                onChange={(e) => setCoachQuery(e.target.value)}
                placeholder="Ask coach for architectural advice or specific help..."
                className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => handleAskCoach()}
                disabled={coachLoading}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
              >
                Ask Coach
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
