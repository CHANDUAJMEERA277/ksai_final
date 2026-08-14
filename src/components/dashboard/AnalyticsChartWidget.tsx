"use client";

import React from "react";
import { BarChart3, Activity, Clock, Code2, Award } from "lucide-react";

export function AnalyticsChartWidget() {
  return (
    <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-emerald-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Productivity &amp; Learning Telemetry
          </h3>
        </div>
        <span className="text-xs text-emerald-400 font-mono">98.4% Score</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
          <div className="text-[10px] text-slate-400 font-mono uppercase mb-1">Learning Hours</div>
          <div className="text-2xl font-black text-white font-mono">42.5h</div>
          <div className="text-[10px] text-emerald-400">↑ +18% this week</div>
        </div>

        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
          <div className="text-[10px] text-slate-400 font-mono uppercase mb-1">Coding Hours</div>
          <div className="text-2xl font-black text-cyan-400 font-mono">68.0h</div>
          <div className="text-[10px] text-cyan-400">↑ +24% throughput</div>
        </div>

        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
          <div className="text-[10px] text-slate-400 font-mono uppercase mb-1">Projects Built</div>
          <div className="text-2xl font-black text-purple-400 font-mono">12</div>
          <div className="text-[10px] text-purple-400">3 in progress</div>
        </div>

        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
          <div className="text-[10px] text-slate-400 font-mono uppercase mb-1">ATS Resume Score</div>
          <div className="text-2xl font-black text-amber-400 font-mono">96/100</div>
          <div className="text-[10px] text-amber-400">Top Tier Match</div>
        </div>
      </div>

      {/* Visual Chart Bars */}
      <div className="pt-2">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
          <span>Weekly Coding Velocity (LOC / Day)</span>
          <Activity size={14} className="text-blue-400" />
        </div>
        <div className="flex items-end gap-2 h-24 p-3 bg-white/5 rounded-2xl border border-white/10">
          {[
            { day: "Mon", val: 65, color: "#3B82F6" },
            { day: "Tue", val: 80, color: "#7C3AED" },
            { day: "Wed", val: 45, color: "#06B6D4" },
            { day: "Thu", val: 95, color: "#10B981" },
            { day: "Fri", val: 75, color: "#EC4899" },
            { day: "Sat", val: 90, color: "#F59E0B" },
            { day: "Sun", val: 100, color: "#60A5FA" },
          ].map((bar) => (
            <div key={bar.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <div
                className="w-full rounded-t transition-all duration-500 hover:opacity-80"
                style={{ height: `${bar.val}%`, backgroundColor: bar.color }}
              />
              <span className="text-[9px] font-mono text-slate-400">{bar.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

