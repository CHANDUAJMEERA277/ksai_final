"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, ChevronRight, ChevronLeft, Terminal, Cpu, Sparkles, CheckCircle2 } from "lucide-react";
import { CodeWalkthroughData, ProgrammingLanguage } from "@/types/teaching-types";

interface CodeWalkthroughVisualizerProps {
  data: CodeWalkthroughData;
  activeStepIndex?: number;
  onStepChange?: (stepIndex: number) => void;
  language?: ProgrammingLanguage;
}

export function CodeWalkthroughVisualizer({
  data,
  activeStepIndex = 0,
  onStepChange,
  language = "python",
}: CodeWalkthroughVisualizerProps) {
  const [currentStep, setCurrentStep] = useState(activeStepIndex);

  useEffect(() => {
    if (activeStepIndex !== undefined && activeStepIndex !== currentStep) {
      setCurrentStep(activeStepIndex);
    }
  }, [activeStepIndex]);

  const steps = data.steps || [];
  const activeStep = steps[currentStep] || steps[0];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      onStepChange?.(next);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      onStepChange?.(prev);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-indigo-300/80 bg-slate-950 p-4 text-slate-100 shadow-lg space-y-3 animate-fade-in font-sans">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Cpu size={13} />
          </div>
          <div>
            <h4 className="text-xs font-black tracking-wide text-cyan-300 uppercase">
              Live Code Execution Flow
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              Step {currentStep + 1} of {steps.length} • {language.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Stepper Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 text-xs font-bold transition flex items-center gap-1"
          >
            <ChevronLeft size={13} /> Prev
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={currentStep >= steps.length - 1}
            className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-xs font-bold text-white transition flex items-center gap-1 shadow-xs"
          >
            Next <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Code Editor Preview with Active Line Highlight */}
      <div className="rounded-xl bg-slate-900 border border-white/10 p-3 font-mono text-xs overflow-x-auto custom-scrollbar">
        {data.fullCode.split("\n").map((line, idx) => {
          const lineNum = idx + 1;
          const isActive = activeStep && activeStep.lineNumber === lineNum;
          return (
            <div
              key={idx}
              className={`flex items-center gap-3 py-1 px-2 rounded-md transition-all ${
                isActive
                  ? "bg-blue-600/30 border-l-4 border-cyan-400 text-white font-bold shadow-sm ring-1 ring-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="text-[10px] text-slate-600 select-none w-5 text-right font-mono">
                {lineNum}
              </span>
              <span className="text-xs tracking-tight">{line}</span>
              {isActive && (
                <span className="ml-auto text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse font-sans">
                  Executing now
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Active Step Explanation & State Inspector */}
      {activeStep && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {/* Explanation Box */}
          <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 space-y-1.5">
            <div className="text-[10px] font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Sparkles size={11} /> What this line does
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {activeStep.explanation}
            </p>
          </div>

          {/* Variable State & Live Output */}
          <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-amber-300">
              <span>Memory Snapshot</span>
              {activeStep.output && (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Terminal size={10} /> Output printed
                </span>
              )}
            </div>

            {activeStep.variables && activeStep.variables.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {activeStep.variables.map((v, vIdx) => (
                  <div
                    key={vIdx}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-mono text-xs flex items-center gap-1.5"
                  >
                    <span className="text-amber-400 font-bold">{v.name}:</span>
                    <span className="text-emerald-400 font-bold">{String(v.value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[10px] text-slate-500 font-mono">
                No new variable modifications on this step.
              </div>
            )}

            {activeStep.output && (
              <div className="mt-1 p-2 rounded-lg bg-black/60 border border-emerald-500/30 font-mono text-[11px] text-emerald-300 flex items-center gap-2">
                <span className="text-slate-500">&gt;</span>
                <span>{activeStep.output}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
