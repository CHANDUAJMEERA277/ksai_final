"use client";

import React from "react";
import { Sparkles, Globe, Share2, MessageSquare, Code } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#060608] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-purple-600 to-cyan-400 p-[1px] shadow-lg flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="KnowledgeStream AI Logo" className="w-full h-full object-cover rounded-[10px]" />
              </div>
              <span className="font-bold text-lg text-white">
                Knowledge<span className="text-blue-500">Stream</span> AI
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              The next-generation AI operating system for learning, coding, productivity, hiring, and workforce management.
            </p>
          </div>

          {/* Column 1 */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-4">
              Products
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#products" className="hover:text-cyan-400 transition-colors">KnowledgeStream Learn</a></li>
              <li><a href="#products" className="hover:text-cyan-400 transition-colors">KnowledgeStream Workspace</a></li>
              <li><a href="#products" className="hover:text-cyan-400 transition-colors">KnowledgeStream Recruit</a></li>
              <li><a href="#products" className="hover:text-cyan-400 transition-colors">AI Code Mentor</a></li>
              <li><a href="#products" className="hover:text-cyan-400 transition-colors">Smart Telemetry</a></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-4">
              Ecosystem
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#journey" className="hover:text-cyan-400 transition-colors">Interactive Journey</a></li>
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">AI Swarm Agents</a></li>
              <li><a href="#demo" className="hover:text-cyan-400 transition-colors">Live OS Demo</a></li>
              <li><a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing Plans</a></li>
            </ul>
          </div>

          {/* Column 3 - Socials */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-4">
              Connect
            </h4>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-xl glass-panel border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500/40 transition-all">
                <Code size={18} />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl glass-panel border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500/40 transition-all">
                <Globe size={18} />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl glass-panel border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500/40 transition-all">
                <Share2 size={18} />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl glass-panel border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500/40 transition-all">
                <MessageSquare size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            &copy; {new Date().getFullYear()} KnowledgeStream AI Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
