"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Bot,
  Send,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Code2,
  BellRing,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

export function RightAIPanel() {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Good evening, Chandu! I analyzed your recent TypeScript AST commits. Ready to refactor database indexes today?" },
  ]);
  const [input, setInput] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(1500); // 25 mins Focus Timer
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input;
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `Executing query for: "${userMsg}". AI Neural core has optimized your workspace context (0.2ms).`,
        },
      ]);
    }, 800);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!isOpen) {
    return (
      <aside className="w-12 h-[calc(100vh-4rem)] border-l border-white/10 bg-[#09090B]/90 backdrop-blur-xl py-4 flex flex-col items-center sticky top-16 right-0 z-30 hidden xl:flex select-none">
        <button
          onClick={() => setIsOpen(true)}
          className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center text-white hover:opacity-90 transition-opacity"
          title="Expand Copilot"
        >
          <ChevronLeft size={16} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-80 h-[calc(100vh-4rem)] border-l border-white/10 bg-[#09090B]/90 backdrop-blur-xl p-4 flex flex-col justify-between sticky top-16 right-0 z-30 hidden xl:flex select-none">
      <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center text-white">
              <Bot size={16} />
            </div>
            <span className="font-bold text-xs text-white">KnowledgeStream Copilot</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10 transition-all flex items-center justify-center"
              title="Collapse Panel"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Focus Timer Widget */}
        <div className="glass-panel p-3.5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-cyan-400" /> Focus Pomodoro
            </span>
            <span className="font-mono text-cyan-300">{formatTimer(timerSeconds)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTimerActive(!timerActive)}
              className="flex-1 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-xs font-bold text-white flex items-center justify-center gap-1 transition-all"
            >
              {timerActive ? <Pause size={12} /> : <Play size={12} />}
              {timerActive ? "Pause" : "Start Focus"}
            </button>
            <button
              onClick={() => {
                setTimerActive(false);
                setTimerSeconds(1500);
              }}
              className="p-1.5 rounded-lg glass-panel text-slate-400 hover:text-white"
            >
              <RotateCcw size={12} />
            </button>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Sparkles size={12} className="text-cyan-400" /> AI Recommendations
            </span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-400 font-medium">
            <li className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
              <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
              <span className="truncate">Complete System Design Chapter 4</span>
            </li>
            <li className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
              <Code2 size={12} className="text-cyan-400 shrink-0" />
              <span className="truncate">Refactor Async Event Loop in Java</span>
            </li>
          </ul>
        </div>

        {/* Live Conversation Stream */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Codenthra Chat Stream</span>
            <Sparkles size={12} className="text-purple-400" />
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-2.5 rounded-xl text-xs leading-relaxed ${
                  m.sender === "user"
                    ? "bg-blue-600/20 border border-blue-500/30 text-white ml-4"
                    : "glass-panel border border-white/10 text-slate-200 mr-2"
                }`}
              >
                {m.text}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Input Form at bottom */}
      <form onSubmit={handleSend} className="pt-3 border-t border-white/10 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Codenthra AI anything..."
          className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
        />
        <button
          type="submit"
          className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition-opacity"
        >
          <Send size={14} />
        </button>
      </form>
    </aside>
  );
}
