"use client";

import {
  GitBranch,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Globe,
  Terminal,
} from "lucide-react";
import { useEditorTheme } from "./EditorTheme";
import { useTerminal } from "./terminal/TerminalContext";
import { useEditor } from "./EditorContext";
import { useLanguage } from "./languages/LanguageContext";

export default function StatusBar() {
  const { darkMode } = useEditorTheme();
  const { showTerminal, setShowTerminal, setActivePanel } = useTerminal();
  const { diagnostics } = useEditor();
  const { language } = useLanguage();

  const errorCount = diagnostics.filter((d) => d.severity === "error").length;

  return (
    <div
      className={`h-8 flex items-center justify-between px-4 text-xs transition-all duration-300 select-none ${
        darkMode
          ? "bg-[#007ACC] text-white"
          : "bg-[#E8F3FF] text-[#005A9E] border-t border-gray-300"
      }`}
    >
      {/* Left */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1">
          <GitBranch size={14} />
          <span>main</span>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowTerminal(true);
            setActivePanel("output");
          }}
          className="flex items-center gap-1 hover:underline cursor-pointer"
        >
          <CheckCircle2 size={14} />
          <span>Build Ready</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setShowTerminal(true);
            setActivePanel("problems");
          }}
          className="flex items-center gap-1 hover:underline cursor-pointer"
        >
          <AlertCircle size={14} className={errorCount > 0 ? "text-red-300 animate-pulse" : ""} />
          <span>{errorCount} {errorCount === 1 ? "Error" : "Errors"}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setShowTerminal(!showTerminal);
            if (!showTerminal) setActivePanel("terminal");
          }}
          className="flex items-center gap-1 hover:underline cursor-pointer opacity-90 hover:opacity-100"
          title="Toggle Terminal Panel"
        >
          <Terminal size={14} />
          <span>Terminal</span>
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-5">
        <span>{language?.name || "Java"}</span>

        <span>UTF-8</span>

        <span>Spaces:4</span>

        <div className="flex items-center gap-1">
          <Cpu size={14} />
          <span>AI Ready</span>
        </div>

        <div className="flex items-center gap-1">
          <Globe size={14} />
          <span>KnowledgeStream AI</span>
        </div>
      </div>
    </div>
  );
}