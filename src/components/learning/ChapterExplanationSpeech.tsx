"use client";

import React, { useState, useEffect } from "react";
import { Volume2, Play, Pause } from "lucide-react";

interface ChapterExplanationSpeechProps {
  title: string;
  explanation: string;
  onCompleteExplanation: () => void;
}

export function ChapterExplanationSpeech({
  title,
  explanation,
  onCompleteExplanation,
}: ChapterExplanationSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Reset speech synthesis on unmount
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleSpeech = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      alert("Text-to-Speech API not supported in browser.");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(explanation);
        utterance.rate = speechRate;
        utterance.pitch = 1.0;
        utterance.onend = () => {
          setIsPlaying(false);
          setIsCompleted(true);
          onCompleteExplanation();
        };
        window.speechSynthesis.speak(utterance);
      }
      setIsPlaying(true);
    }
  };

  const handleComplete = () => {
    setIsCompleted(true);
    onCompleteExplanation();
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-blue-500/30 space-y-4 shadow-xl bg-[#0C0C16]">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-cyan-400">
            <Volume2 size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Step A: AI Voice Concept Explainer</h3>
            <span className="text-[10px] text-cyan-400 font-mono">Web Speech Synthesis Engine</span>
          </div>
        </div>

        {/* Speech Controls */}
        <div className="flex items-center gap-2">
          <select
            value={speechRate}
            onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
            className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-white text-xs cursor-pointer focus:outline-none"
          >
            <option value="0.8">0.8x Speed</option>
            <option value="1.0">1.0x Speed</option>
            <option value="1.25">1.25x Speed</option>
            <option value="1.5">1.5x Speed</option>
          </select>

          <button
            onClick={toggleSpeech}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all ${
              isPlaying
                ? "bg-purple-600 text-white animate-pulse"
                : "bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-95"
            }`}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            {isPlaying ? "Pause AI Voice" : "Listen AI Voice"}
          </button>
        </div>
      </div>

      <div className="text-xs text-slate-300 leading-relaxed max-h-36 overflow-y-auto custom-scrollbar p-1 bg-black/10 rounded-2xl border border-white/5 font-mono">
        💡 <span className="font-sans italic">"Press Listen to hear the AI explanation of this chapter's key notes..."</span>
      </div>
    </div>
  );
}
