"use client";

import React, { useState } from "react";
import { HelpCircle, CheckCircle2, XCircle, Sparkles, Terminal, ArrowRight, Bug, Check } from "lucide-react";
import {
  QuestionVisualData,
  CodePredictionData,
  DebuggingVisualData,
} from "@/types/teaching-types";

interface InteractiveQuestionCardProps {
  questionData?: QuestionVisualData;
  predictionData?: CodePredictionData;
  debuggingData?: DebuggingVisualData;
  onAnswerSubmit?: (isCorrect: boolean, answer: string) => void;
}

export function InteractiveQuestionCard({
  questionData,
  predictionData,
  debuggingData,
  onAnswerSubmit,
}: InteractiveQuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showTrace, setShowTrace] = useState(false);

  // 1. QUESTION INTERACTION
  if (questionData && questionData.options && questionData.options.length > 0) {
    const chosenOption = questionData.options.find((o) => o.id === selectedOption);
    const isCorrect = chosenOption?.isCorrect ?? false;

    const handleSelect = (optionId: string) => {
      if (hasSubmitted) return;
      setSelectedOption(optionId);
      setHasSubmitted(true);
      const opt = questionData.options.find((o) => o.id === optionId);
      onAnswerSubmit?.(opt?.isCorrect ?? false, opt?.text ?? "");
    };

    return (
      <div className="rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/70 p-4 text-white shadow-md space-y-3 animate-fade-in font-sans">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <HelpCircle size={13} />
            </div>
            <h4 className="text-xs font-black tracking-wide text-amber-200 uppercase">
              Quick Concept Check
            </h4>
          </div>
          <span className="text-[10px] text-amber-300 font-mono font-bold">Interactive Question</span>
        </div>

        <p className="text-xs font-bold text-slate-100 leading-relaxed">
          {questionData.questionText}
        </p>

        {questionData.codeSnippet && (
          <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-amber-300 overflow-x-auto">
            {questionData.codeSnippet}
          </div>
        )}

        {/* Options Grid */}
        <div className="space-y-2 pt-1">
          {questionData.options.map((opt) => {
            const isChosen = selectedOption === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect(opt.id)}
                disabled={hasSubmitted}
                className={`w-full text-left p-3 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-between ${
                  hasSubmitted
                    ? opt.isCorrect
                      ? "bg-emerald-950/80 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400"
                      : isChosen
                      ? "bg-rose-950/80 border-rose-400 text-rose-200"
                      : "bg-slate-900/40 border-slate-800 text-slate-500 opacity-60"
                    : "bg-slate-800/80 border-slate-700 hover:bg-slate-800 hover:border-amber-400 text-slate-200"
                }`}
              >
                <span>{opt.text}</span>
                {hasSubmitted && (
                  <span>
                    {opt.isCorrect ? (
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    ) : isChosen ? (
                      <XCircle size={16} className="text-rose-400" />
                    ) : null}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation & Trace on Submission */}
        {hasSubmitted && (
          <div className={`p-3 rounded-xl border text-xs font-medium space-y-1.5 animate-in fade-in ${
            isCorrect ? "bg-emerald-950/70 border-emerald-500/40 text-emerald-100" : "bg-amber-950/70 border-amber-500/40 text-amber-100"
          }`}>
            <div className="flex items-center gap-1.5 font-bold">
              {isCorrect ? "🎉 Great job! That's correct." : "💡 Let's review why:"}
            </div>
            <p className="leading-relaxed">
              {chosenOption?.explanation || questionData.solutionExplanation}
            </p>

            {questionData.traceSteps && (
              <div className="pt-2 space-y-1 border-t border-white/10 font-mono text-[11px]">
                <div className="text-slate-400 font-bold">Execution Steps:</div>
                {questionData.traceSteps.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-slate-400">{s.step}</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-amber-300 font-bold">{s.result}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // 2. CODE PREDICTION
  if (predictionData) {
    const isChosenCorrect = selectedOption === predictionData.expectedOutput;

    const handlePredict = (opt: string) => {
      if (hasSubmitted) return;
      setSelectedOption(opt);
      setHasSubmitted(true);
      setShowTrace(true);
      onAnswerSubmit?.(opt === predictionData.expectedOutput, opt);
    };

    return (
      <div className="rounded-2xl border-2 border-purple-300/80 bg-gradient-to-br from-slate-900 via-slate-950 to-purple-950 p-4 text-white shadow-md space-y-3 animate-fade-in font-sans">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
              <Terminal size={13} />
            </div>
            <h4 className="text-xs font-black tracking-wide text-purple-200 uppercase">
              Output Prediction Challenge
            </h4>
          </div>
          <span className="text-[10px] text-purple-300 font-mono font-bold">What will this print?</span>
        </div>

        {/* Code Snippet */}
        <div className="p-3 rounded-xl bg-slate-950 border border-white/10 font-mono text-xs text-amber-300 overflow-x-auto">
          <pre>{predictionData.code}</pre>
        </div>

        {/* Prediction Options */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {predictionData.options.map((opt, idx) => {
            const isTarget = opt === predictionData.expectedOutput;
            const isSelected = selectedOption === opt;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handlePredict(opt)}
                disabled={hasSubmitted}
                className={`p-2.5 rounded-xl border font-mono text-xs font-bold transition text-center ${
                  hasSubmitted
                    ? isTarget
                      ? "bg-emerald-950/80 border-emerald-400 text-emerald-200"
                      : isSelected
                      ? "bg-rose-950/80 border-rose-400 text-rose-200"
                      : "bg-slate-900/40 border-slate-800 text-slate-500 opacity-60"
                    : "bg-slate-800 hover:border-purple-400 text-slate-200"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* Trace Reveal */}
        {hasSubmitted && showTrace && predictionData.executionTrace && (
          <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/40 space-y-2 animate-in fade-in text-xs font-mono">
            <div className="flex items-center justify-between text-purple-200 font-bold">
              <span>Execution Trace:</span>
              <span className="text-emerald-400">Final Output: {predictionData.expectedOutput}</span>
            </div>
            <div className="space-y-1 text-[11px]">
              {predictionData.executionTrace.map((tr, idx) => (
                <div key={idx} className="flex items-center justify-between text-slate-300">
                  <span className="text-cyan-300">{tr.line}</span>
                  <span className="text-slate-400 font-sans">{tr.explanation}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. DEBUGGING VISUALIZER
  if (debuggingData) {
    return (
      <div className="rounded-2xl border-2 border-rose-300/80 bg-gradient-to-br from-slate-900 via-slate-950 to-rose-950 p-4 text-white shadow-md space-y-3 animate-fade-in font-sans">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <Bug size={13} />
            </div>
            <h4 className="text-xs font-black tracking-wide text-rose-200 uppercase">
              Debugging & Error Visualization
            </h4>
          </div>
          <span className="text-[10px] text-rose-300 font-mono font-bold uppercase">
            {debuggingData.errorType} Error
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Buggy Code */}
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 space-y-1.5 font-mono text-xs">
            <span className="text-[10px] font-bold text-rose-300 uppercase">Problematic Code</span>
            <pre className="text-rose-200 bg-black/40 p-2 rounded">{debuggingData.buggyCode}</pre>
            <p className="text-[11px] text-rose-300 font-sans">{debuggingData.errorMessage}</p>
          </div>

          {/* Fixed Code */}
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1.5 font-mono text-xs">
            <span className="text-[10px] font-bold text-emerald-300 uppercase">Corrected Code</span>
            <pre className="text-emerald-200 bg-black/40 p-2 rounded">{debuggingData.fixedCode}</pre>
            <p className="text-[11px] text-emerald-300 font-sans">{debuggingData.fixExplanation}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
