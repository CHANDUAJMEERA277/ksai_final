"use client";

import React, { useState } from "react";
import { Layers, Database, Sparkles, Box, Check, ArrowRight } from "lucide-react";
import { MemoryVisualData, VariableItem, ProgrammingLanguage } from "@/types/teaching-types";

interface MemoryVisualizerProps {
  data?: MemoryVisualData;
  variables?: VariableItem[];
  language?: ProgrammingLanguage;
  activeStep?: number;
}

export function MemoryVisualizer({
  data,
  variables,
  language = "python",
  activeStep = 0,
}: MemoryVisualizerProps) {
  const [selectedVar, setSelectedVar] = useState<string | null>(null);

  const stackVars = data?.stack || variables || [];
  const heapObjects = data?.heap || [];
  const title = data?.title || (language === "python" ? "Python Object & Memory Model" : "Stack & Heap Memory Layout");

  return (
    <div className="rounded-2xl border-2 border-indigo-200/90 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-4 text-white shadow-md animate-fade-in space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Database size={13} />
          </div>
          <div>
            <h4 className="text-xs font-black tracking-wide text-indigo-200 uppercase">
              {title}
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              {language.toUpperCase()} • {language === "python" ? "Names reference objects in memory" : "Stack (Local) & Heap (Objects)"}
            </p>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold border border-indigo-500/30 flex items-center gap-1">
          <Sparkles size={10} /> Live State
        </span>
      </div>

      {/* Memory Visualization Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* STACK / VARIABLES SECTION */}
        <div className="space-y-2 rounded-xl bg-white/5 p-3 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Box size={12} /> {language === "python" ? "Variables / Names" : "Call Stack (Local)"}
            </span>
            <span className="text-[9px] text-slate-400 font-mono">
              {stackVars.length} allocated
            </span>
          </div>

          {stackVars.length === 0 ? (
            <div className="py-6 text-center text-[11px] text-slate-400 font-mono">
              No active local variables in this frame.
            </div>
          ) : (
            <div className="space-y-2">
              {stackVars.map((v, idx) => {
                const isSelected = selectedVar === v.name;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedVar(isSelected ? null : v.name)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      v.isHighlighted || isSelected
                        ? "bg-indigo-600/30 border-indigo-400 shadow-sm shadow-indigo-500/20 ring-1 ring-indigo-400"
                        : "bg-slate-800/80 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-300">
                        {v.name}
                      </span>
                      {v.type && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-900/50 text-cyan-300 font-mono border border-cyan-800/40">
                          {v.type}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-slate-400 text-xs">→</span>
                      <div className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold text-xs shadow-inner">
                        {String(v.value)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* HEAP / OBJECTS SECTION (For Java, Python, C++) */}
        <div className="space-y-2 rounded-xl bg-white/5 p-3 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Layers size={12} /> {language === "python" ? "Python Objects" : "Heap Space"}
            </span>
            <span className="text-[9px] text-slate-400 font-mono">
              {heapObjects.length > 0 ? `${heapObjects.length} object(s)` : "Managed Runtime"}
            </span>
          </div>

          {heapObjects.length === 0 ? (
            <div className="py-4 text-center text-[10px] text-slate-400 font-mono space-y-1">
              <p className="text-slate-300">Primitive values directly stored</p>
              <p className="text-[9px] text-slate-500">
                {language === "python"
                  ? "Integers and strings point to immutable object instances"
                  : "Heap allocated for dynamic arrays and class objects"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {heapObjects.map((obj, oIdx) => (
                <div
                  key={oIdx}
                  className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs font-mono space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-purple-300">
                    <span>{obj.type}</span>
                    {obj.address && (
                      <span className="text-[9px] text-slate-400">{obj.address}</span>
                    )}
                  </div>
                  {obj.fields && (
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-300 pt-1 border-t border-purple-800/30">
                      {Object.entries(obj.fields).map(([k, val]) => (
                        <div key={k} className="flex items-center gap-1">
                          <span className="text-slate-400">{k}:</span>
                          <span className="text-amber-300 font-bold">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Explanation Banner */}
      {data?.explanation && (
        <div className="p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-xs text-indigo-100 font-medium flex items-center gap-2">
          <Sparkles size={13} className="text-indigo-400 shrink-0" />
          <span>{data.explanation}</span>
        </div>
      )}
    </div>
  );
}
