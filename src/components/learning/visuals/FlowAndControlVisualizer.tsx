"use client";

import React, { useState } from "react";
import { GitBranch, Repeat, Activity, Sparkles, CheckCircle2, ArrowDown, ArrowRight } from "lucide-react";
import { FlowDiagramData, LoopVisualData, ConditionalVisualData } from "@/types/teaching-types";

interface FlowVisualizerProps {
  flowData?: FlowDiagramData;
  loopData?: LoopVisualData;
  conditionalData?: ConditionalVisualData;
  activeStep?: number;
}

export function FlowAndControlVisualizer({
  flowData,
  loopData,
  conditionalData,
  activeStep = 0,
}: FlowVisualizerProps) {
  const [activeIteration, setActiveIteration] = useState(0);

  // 1. FLOW DIAGRAM RENDERER
  if (flowData && flowData.nodes && flowData.nodes.length > 0) {
    return (
      <div className="rounded-2xl border-2 border-cyan-300/80 bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950 p-4 text-white shadow-md space-y-3 animate-fade-in">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Activity size={13} />
            </div>
            <h4 className="text-xs font-black tracking-wide text-cyan-200 uppercase">
              {flowData.title}
            </h4>
          </div>
          <span className="text-[10px] text-cyan-300 font-mono font-bold">Execution Flow</span>
        </div>

        {/* Nodes Grid / Flow */}
        <div className="flex flex-wrap items-center justify-start gap-2 py-2">
          {flowData.nodes.map((node, idx) => {
            const isNodeActive = node.isActive || idx === activeStep;
            return (
              <div key={node.id || idx} className="flex items-center gap-2">
                <div
                  className={`px-3 py-2 rounded-xl border font-mono text-xs font-bold transition-all shadow-sm ${
                    isNodeActive
                      ? "bg-cyan-500 text-slate-950 border-cyan-300 shadow-md shadow-cyan-500/30 scale-105"
                      : "bg-slate-800/90 text-slate-200 border-slate-700 hover:border-slate-500"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {isNodeActive && <Sparkles size={11} className="animate-spin" />}
                    <span>{node.label}</span>
                  </div>
                  {node.annotation && (
                    <div className="text-[9px] font-normal text-slate-400 font-sans mt-0.5">
                      {node.annotation}
                    </div>
                  )}
                </div>

                {idx < flowData.nodes.length - 1 && (
                  <span className="text-cyan-400 font-bold text-sm select-none">→</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. LOOP VISUALIZER RENDERER
  if (loopData && loopData.iterations && loopData.iterations.length > 0) {
    const currentIter = loopData.iterations[activeIteration] || loopData.iterations[0];

    return (
      <div className="rounded-2xl border-2 border-purple-300/80 bg-gradient-to-br from-slate-900 via-slate-950 to-purple-950 p-4 text-white shadow-md space-y-3 animate-fade-in">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Repeat size={13} />
            </div>
            <div>
              <h4 className="text-xs font-black tracking-wide text-purple-200 uppercase">
                {loopData.loopType.toUpperCase()} Loop Execution
              </h4>
              <p className="text-[10px] text-slate-400 font-mono">
                Condition: <span className="text-amber-300 font-bold">{loopData.condition}</span>
              </p>
            </div>
          </div>

          {/* Iteration Selector Pills */}
          <div className="flex items-center gap-1">
            {loopData.iterations.map((it, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIteration(idx)}
                className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold transition ${
                  activeIteration === idx
                    ? "bg-purple-500 text-white shadow-sm"
                    : "bg-white/10 text-slate-400 hover:text-white"
                }`}
              >
                #{it.iterationNumber}
              </button>
            ))}
          </div>
        </div>

        {/* Current Iteration Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-2">
            <div className="text-[10px] font-black uppercase text-purple-300 flex items-center justify-between">
              <span>Iteration #{currentIter.iterationNumber} State</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                  currentIter.conditionMet
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                }`}
              >
                {currentIter.conditionMet ? "Condition: TRUE" : "Condition: FALSE (Loop Ends)"}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1 font-mono text-xs">
              {Object.entries(currentIter.variables || {}).map(([k, val]) => (
                <div
                  key={k}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-1.5"
                >
                  <span className="text-purple-300 font-bold">{k}:</span>
                  <span className="text-amber-300 font-bold">{String(val)}</span>
                </div>
              ))}
            </div>

            {currentIter.explanation && (
              <p className="text-xs text-slate-300 pt-1 font-sans">
                {currentIter.explanation}
              </p>
            )}
          </div>

          {currentIter.output && (
            <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1.5">
              <span className="text-[10px] font-black uppercase text-emerald-400">
                Live Console Output
              </span>
              <div className="p-2 rounded-lg bg-black/60 font-mono text-xs text-emerald-300 border border-emerald-500/30">
                &gt; {currentIter.output}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. CONDITIONAL FLOW RENDERER
  if (conditionalData && conditionalData.branches && conditionalData.branches.length > 0) {
    return (
      <div className="rounded-2xl border-2 border-emerald-300/80 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 p-4 text-white shadow-md space-y-3 animate-fade-in">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <GitBranch size={13} />
            </div>
            <h4 className="text-xs font-black tracking-wide text-emerald-200 uppercase">
              Conditional Decision Flow
            </h4>
          </div>
          <span className="text-[10px] text-emerald-300 font-mono font-bold">Branching</span>
        </div>

        <div className="space-y-2 pt-1">
          {conditionalData.branches.map((branch, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border transition-all ${
                branch.isTaken
                  ? "bg-emerald-950/60 border-emerald-400 ring-1 ring-emerald-400 shadow-md shadow-emerald-500/20"
                  : "bg-slate-900/60 border-slate-800 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-amber-300">{branch.condition}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    branch.isTaken
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {branch.isTaken ? "✓ BRANCH TAKEN" : "SKIPPED"}
                </span>
              </div>
              <div className="mt-1 text-[11px] text-slate-300 font-mono bg-black/40 p-1.5 rounded">
                {branch.branchBody}
              </div>
            </div>
          ))}
        </div>

        {conditionalData.explanation && (
          <p className="text-xs text-emerald-200/90 font-medium">
            💡 {conditionalData.explanation}
          </p>
        )}
      </div>
    );
  }

  return null;
}
