"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ArrowRight,
  Zap,
  Target,
  Compass,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { MentorActionSuggestion, MentorContext, MentorMessage } from "@/lib/mentor/types";

interface AIMentorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  initialCourse?: string;
  onNavigateTopic?: (topic: string, courseSlug?: string) => void;
}

export function AIMentorDrawer({
  isOpen,
  onClose,
  userEmail,
  initialCourse = "python",
  onNavigateTopic,
}: AIMentorDrawerProps) {
  const [activeCourse, setActiveCourse] = useState(initialCourse.toLowerCase());
  const [context, setContext] = useState<MentorContext | null>(null);
  const [loadingContext, setLoadingContext] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch Mentor Context when opened
  useEffect(() => {
    if (!isOpen || !userEmail) return;

    let isMounted = true;
    const fetchContext = async () => {
      setLoadingContext(true);
      try {
        const res = await fetch(
          `/api/mentor?userEmail=${encodeURIComponent(userEmail)}&course=${encodeURIComponent(activeCourse)}`
        );
        const data = await res.json();
        if (data.success && isMounted) {
          setContext(data.data);

          const summary = data.data.knowledgeSummaries.find(
            (s: any) => s.course === activeCourse
          );

          if (messages.length === 0) {
            setMessages([
              {
                id: "welcome",
                sender: "mentor",
                text: `Hello ${data.data.student.name || "Student"}! 👋 I'm your AI Mentor. I track your overall learning progress, strengths, and areas to review across your courses.\n\nCurrently, your focus in **${summary?.courseTitle || "your course"}** is **${summary?.focusTopic || "Introduction"}** (${summary?.overallMastery || 0}% mastery).\n\nHow can I help guide your study today?`,
                timestamp: new Date().toISOString(),
                actions: summary
                  ? [
                      {
                        type: "NAVIGATE_TOPIC",
                        label: `Focus on ${summary.focusTopic}`,
                        topic: summary.focusTopic,
                        courseSlug: summary.course,
                        reason: summary.educationalRationale,
                      },
                    ]
                  : [],
              },
            ]);
          }
        }
      } catch (err) {
        console.error("Failed to load mentor context:", err);
      } finally {
        if (isMounted) setLoadingContext(false);
      }
    };

    fetchContext();
    return () => {
      isMounted = false;
    };
  }, [isOpen, userEmail, activeCourse]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input.trim();
    if (!query || sending) return;

    const userMsg: MentorMessage = {
      id: `u_${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/mentor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail,
          message: query,
          course: activeCourse,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const mentorMsg: MentorMessage = {
          id: `m_${Date.now()}`,
          sender: "mentor",
          text: json.data.text,
          timestamp: json.data.timestamp,
          actions: json.data.actions,
        };
        setMessages((prev) => [...prev, mentorMsg]);
      } else {
        throw new Error(json.error || "Failed to get guidance.");
      }
    } catch (err) {
      console.error("Mentor chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: "mentor",
          text: "I ran into a temporary connection issue. Please feel free to ask again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleActionClick = (action: MentorActionSuggestion) => {
    if (action.topic && onNavigateTopic) {
      onNavigateTopic(action.topic, action.courseSlug || activeCourse);
      onClose();
    }
  };

  if (!isOpen) return null;

  const currentSummary = context?.knowledgeSummaries.find((s) => s.course === activeCourse);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-xs">
              <Bot size={22} className="text-white" />
            </div>
            <div>
              <h3 className="font-black text-base flex items-center gap-2">
                Personal AI Mentor
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-white/20 rounded-full border border-white/30">
                  Adaptive
                </span>
              </h3>
              <p className="text-xs text-blue-100">
                Long-term guidance, learning strategy & progress analysis
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Course Filter Tabs */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
          {(["python", "c", "cpp", "java"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActiveCourse(c)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeCourse === c
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {c === "cpp" ? "C++" : c.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Live Mastery Bar */}
        {currentSummary && (
          <div className="px-4 py-2 bg-blue-50/60 border-b border-blue-100 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <Target size={14} className="text-blue-600" />
              <span>{currentSummary.courseTitle}:</span>
              <span className="font-bold text-blue-700">{currentSummary.overallMastery}% Mastery</span>
            </div>

            <span className="text-[11px] text-slate-500 font-medium">
              Focus: {currentSummary.focusTopic}
            </span>
          </div>
        )}

        {/* Conversation Body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "mentor" && (
                <div className="w-7 h-7 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0 mt-0.5">
                  <Bot size={15} />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-xs"
                    : "bg-slate-100 text-slate-800 border border-slate-200/80 rounded-bl-xs whitespace-pre-wrap"
                }`}
              >
                {msg.text}

                {/* Structured Action Cards */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-3 space-y-2 pt-2 border-t border-slate-200/60">
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                      Recommended Next Step:
                    </p>
                    {msg.actions.map((act, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleActionClick(act)}
                        className="w-full text-left p-2.5 rounded-xl bg-white border border-blue-200 shadow-2xs hover:border-blue-400 hover:shadow-xs transition group cursor-pointer"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-blue-700">
                          <span className="flex items-center gap-1.5">
                            <Compass size={13} />
                            {act.label}
                          </span>
                          <ArrowRight
                            size={12}
                            className="group-hover:translate-x-0.5 transition-transform"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          {act.reason}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === "user" && (
                <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User size={14} />
                </div>
              )}
            </div>
          ))}

          {sending && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-3 w-fit">
              <Sparkles size={14} className="text-blue-600 animate-spin" />
              <span>Mentor is analyzing your progress...</span>
            </div>
          )}
        </div>

        {/* Quick Question Chips */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex gap-2 overflow-x-auto custom-scrollbar shrink-0">
          {[
            "What should I learn next?",
            "What are my weak areas?",
            "Can you make me a study plan?",
            "Which skills have I mastered?",
          ].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              disabled={sending}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-700 hover:border-blue-300 text-xs whitespace-nowrap transition cursor-pointer disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 bg-white shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for guidance, study plan, or progress review..."
              className="flex-1 min-w-0 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
              disabled={sending}
            />

            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition shadow-xs shrink-0 disabled:opacity-50 cursor-pointer"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
