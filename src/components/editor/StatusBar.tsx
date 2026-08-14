"use client";

import {
  GitBranch,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Globe,
} from "lucide-react";
import { useEditorTheme } from "./EditorTheme";

export default function StatusBar() {
  const { darkMode } = useEditorTheme();

  return (
    <div
      className={`h-8 flex items-center justify-between px-4 text-xs transition-all duration-300 ${
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

        <div className="flex items-center gap-1">
          <CheckCircle2 size={14} />
          <span>Build Success</span>
        </div>

        <div className="flex items-center gap-1">
          <AlertCircle size={14} />
          <span>0 Errors</span>
        </div>
      </div>

      {/* Right */}

      <div className="flex items-center gap-5">
        <span>Java</span>

        <span>UTF-8</span>

        <span>Spaces:4</span>

        <span>Ln 18, Col 22</span>

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