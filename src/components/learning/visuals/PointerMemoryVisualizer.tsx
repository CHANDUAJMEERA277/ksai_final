"use client";

import React, { useState } from "react";
import { Binary, Sparkles, ArrowRight, Target, Key } from "lucide-react";
import { PointerMemoryVisualData } from "@/types/teaching-types";

interface PointerMemoryVisualizerProps {
  data: PointerMemoryVisualData;
}

export function PointerMemoryVisualizer({ data }: PointerMemoryVisualizerProps) {
  const [selectedPointer, setSelectedPointer] = useState<string | null>(null);

  const variables = data.variables || [];
  const pointers = data.pointers || [];

  return (
    <div className="rounded-2xl border-2 border-emerald-300/80 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 p-4 text-white shadow-md space-y-3 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Binary size={13} />
          </div>
          <div>
            <h4 className="text-xs font-black tracking-wide text-emerald-200 uppercase">
              C / C++ Pointer & Memory Address Visualizer
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              Memory addresses, pointers, and dereferencing (*p, &amp;var)
            </p>
          </div>
        </div>
        <span className="text-[10px] text-emerald-300 font-mono font-bold">Direct Memory</span>
      </div>

      {/* Memory Map Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* Target Variables */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1">
            <Target size={11} /> Variables in Memory
          </span>

          <div className="space-y-2 font-mono text-xs">
            {variables.map((v, idx) => {
              const isTargeted = pointers.some(
                (p) =>
                  p.targetVariableName === v.name ||
                  (p.pointsToAddress && p.pointsToAddress === v.address)
              );

              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isTargeted
                      ? "bg-cyan-950/60 border-cyan-400 shadow-sm shadow-cyan-500/20 ring-1 ring-cyan-400"
                      : "bg-slate-800 border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">{v.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Address: <span className="text-amber-300">{v.address || "0x7ffd58a0"}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-700/50 mt-1">
                    <span className="text-[10px] text-slate-400">Stored Value:</span>
                    <span className="font-bold text-emerald-300 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40">
                      {String(v.value)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pointers */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1">
            <Key size={11} /> Pointers (Hold Addresses)
          </span>

          <div className="space-y-2 font-mono text-xs">
            {pointers.map((p, idx) => (
              <div
                key={idx}
                onClick={() =>
                  setSelectedPointer(selectedPointer === p.pointerName ? null : p.pointerName)
                }
                className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-1.5 cursor-pointer hover:border-emerald-400 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300">{p.pointerName}</span>
                  <span className="text-[10px] text-slate-400">
                    Pointer Address: {p.pointerAddress}
                  </span>
                </div>

                <div className="p-1.5 rounded bg-slate-900/90 border border-slate-700 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Points to address:</span>
                  <span className="text-cyan-300 font-bold">{p.pointsToAddress}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-emerald-200">
                  <span>Dereferenced (*{p.pointerName}):</span>
                  <span className="font-bold text-emerald-300">
                    {String(p.dereferencedValue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {data.explanation && (
        <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-xs text-emerald-100 font-medium">
          💡 {data.explanation}
        </div>
      )}
    </div>
  );
}
