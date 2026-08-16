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
  ChevronRight,
  ChevronLeft,
  Flame,
  Zap,
  Target,
  MessageSquare,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RightAIPanelProps {
  isLight?: boolean;
}

export function RightAIPanel({ isLight = true }: RightAIPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Student Customizable Timer States
  const [initialSeconds, setInitialSeconds] = useState(1500); // Default 25 mins choice
  const [timerSeconds, setTimerSeconds] = useState(1500);
  const [timerActive, setTimerActive] = useState(false);

  const setCustomMinutes = (mins: number) => {
    const totalSec = Math.max(60, mins * 60);
    setInitialSeconds(totalSec);
    setTimerSeconds(totalSec);
    setTimerActive(false);
  };

  // Chat Stream State
  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "ai",
      text: "👋 Hi Chandu! I'm Codenthra AI. Ready to continue your Java & SQL learning path today?",
      time: "Just now"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Recommended tasks completion state
  const [tasks, setTasks] = useState([
    { id: "1", label: "Complete System Design Chapter 4", done: false, icon: BookOpen },
    { id: "2", label: "Solve 1 SQL Indexing Challenge", done: true, icon: Code2 },
    { id: "3", label: "Generate AI Practice Quiz", done: false, icon: Zap }
  ]);

  // Pomodoro countdown timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);



  const handleSend = (userText: string) => {
    if (!userText.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      text: userText,
      time: "Now"
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI Copilot Response
    setTimeout(() => {
      let responseText = `I analyzed your request for "${userText}". Here is your customized study recommendation and code breakdown.`;
      if (userText.toLowerCase().includes("sql") || userText.toLowerCase().includes("dbms")) {
        responseText = "DBMS Indexing Tip: Use B-Tree indexes for range queries and Hash indexes for exact key lookups!";
      } else if (userText.toLowerCase().includes("quiz") || userText.toLowerCase().includes("practice")) {
        responseText = "I can generate a 5-question AI Quiz for you right now! Head to the AI Quiz Generator tab.";
      } else if (userText.toLowerCase().includes("java")) {
        responseText = "In Java enterprise apps, always use try-with-resources to prevent database connection leaks!";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: responseText,
          time: "Just now"
        }
      ]);
      setIsTyping(false);
    }, 900);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  // Progress percentage for timer bar
  const progressPercent = Math.min(100, Math.max(0, ((initialSeconds - timerSeconds) / initialSeconds) * 100));

  if (!isOpen) {
    return (
      <aside className="w-12 h-screen border-l border-slate-200 bg-white py-4 flex flex-col items-center sticky top-0 right-0 z-30 hidden xl:flex select-none shadow-xs">
        <button
          onClick={() => setIsOpen(true)}
          className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-all shadow-xs cursor-pointer"
          title="Expand AI Copilot"
        >
          <ChevronLeft size={16} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-80 h-screen border-l border-slate-200 bg-white p-4 flex flex-col justify-between sticky top-0 right-0 z-30 hidden xl:flex select-none shadow-xs font-sans">
      <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
        
        {/* TOP COPILOT HEADER */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-xs">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="font-black text-xs text-slate-900 flex items-center gap-1">
                KnowledgeStream Copilot
              </h3>
              <p className="text-[10px] font-bold text-slate-400">AI Assistant v2.4</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              title="Collapse Sidebar"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* FOCUS POMODORO WIDGET - STUDENT CUSTOMIZABLE DURATION */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={14} className="text-indigo-600" /> Focus Pomodoro
            </span>
            <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-0.5">
              <Flame size={11} className="fill-amber-500" /> {Math.round(initialSeconds / 60)}m Focus Choice
            </span>
          </div>

          {/* Quick Duration Preset Pills */}
          <div className="grid grid-cols-4 gap-1 bg-white p-1 rounded-xl border border-slate-200 text-[10px] font-black">
            {[10, 25, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => setCustomMinutes(mins)}
                disabled={timerActive}
                className={`py-1 rounded-lg transition-all cursor-pointer ${
                  initialSeconds === mins * 60
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 disabled:opacity-50"
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>

          {/* Timer Display, Custom Controls & Progress Line */}
          <div className="text-center py-1.5 bg-white rounded-xl border border-slate-200 p-2 space-y-2">
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setCustomMinutes(Math.max(5, Math.round(initialSeconds / 60) - 5))}
                disabled={timerActive}
                className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center text-xs disabled:opacity-40 cursor-pointer"
                title="Decrease 5 mins"
              >
                -5m
              </button>

              <div className="text-2xl font-black font-mono text-slate-900 tracking-tight min-w-[85px]">
                {formatTimer(timerSeconds)}
              </div>

              <button
                onClick={() => setCustomMinutes(Math.min(180, Math.round(initialSeconds / 60) + 5))}
                disabled={timerActive}
                className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center text-xs disabled:opacity-40 cursor-pointer"
                title="Increase 5 mins"
              >
                +5m
              </button>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-600 to-cyan-500 h-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTimerActive(!timerActive)}
              className={`flex-1 py-2 rounded-xl text-xs font-black text-white flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                timerActive
                  ? "bg-amber-500 hover:bg-amber-600"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {timerActive ? <Pause size={13} /> : <Play size={13} />}
              {timerActive ? "Pause Focus Session" : `Start ${Math.round(initialSeconds / 60)}m Focus`}
            </button>

            <button
              onClick={() => {
                setTimerActive(false);
                setTimerSeconds(initialSeconds);
              }}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
              title="Reset Session"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        {/* SMART AI LEARNING RECOMMENDATIONS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Target size={14} className="text-indigo-600" /> Recommended Goals
            </span>
            <span className="text-[9px] font-extrabold text-slate-400">
              {tasks.filter((t) => t.done).length}/{tasks.length} Completed
            </span>
          </div>

          <div className="space-y-1.5">
            {tasks.map((task) => {
              const IconComponent = task.icon;
              return (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`p-2 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                    task.done
                      ? "bg-emerald-50/60 border-emerald-200 text-slate-400 line-through"
                      : "bg-slate-50 border-slate-200 text-slate-800 hover:border-indigo-300 font-semibold"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <IconComponent size={13} className={task.done ? "text-emerald-500" : "text-indigo-600"} />
                    <span className="truncate">{task.label}</span>
                  </div>
                  <CheckCircle2
                    size={14}
                    className={task.done ? "text-emerald-600 fill-emerald-100 shrink-0" : "text-slate-300 shrink-0"}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* AI CHAT COPILOT STREAM */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-black text-slate-900 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <MessageSquare size={13} className="text-indigo-600" /> Codenthra Chat Stream
            </span>
            <Sparkles size={13} className="text-amber-500" />
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="flex flex-wrap gap-1">
            {[
              { label: "💡 Explain SQL Index", query: "Explain SQL Indexing" },
              { label: "⚡ AI Practice Quiz", query: "Generate AI Practice Quiz" },
              { label: "🐛 Debug Tip", query: "Give me a Java Debugging Tip" }
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip.query)}
                className="px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-100 text-[#4F46E5] text-[10px] font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
            <AnimatePresence>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-2.5 rounded-2xl text-xs leading-relaxed border shadow-2xs ${
                    m.sender === "user"
                      ? "bg-indigo-600 text-white border-indigo-700 ml-4 font-semibold"
                      : "bg-slate-50 border-slate-200 text-slate-800 mr-2 font-medium"
                  }`}
                >
                  <div className="flex items-center justify-between text-[9px] mb-1 opacity-80">
                    <span className="font-black uppercase">
                      {m.sender === "user" ? "You" : "Codenthra AI"}
                    </span>
                    <span>{m.time}</span>
                  </div>
                  <p>{m.text}</p>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 animate-pulse flex items-center gap-2"
                >
                  <Bot size={14} className="text-indigo-600" /> Codenthra AI is thinking...
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* INPUT FORM AT BOTTOM */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="pt-3 border-t border-slate-100 flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Codenthra AI anything..."
          className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
        />
        <button
          type="submit"
          className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-2xs"
          title="Send Message"
        >
          <Send size={14} />
        </button>
      </form>
    </aside>
  );
}

