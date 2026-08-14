"use client";

import React, { useState } from "react";
import { useEditorTheme } from "./EditorTheme";

import ExplorerTree from "./explorer/ExplorerTree";

import { useExplorer } from "./explorer/ExplorerContext";

import ExplorerPanel from "./panels/ExplorerPanel";
import SearchPanel from "./panels/SearchPanel";
import GitPanel from "./panels/GitPanel";
import RunPanel from "./panels/RunPanel";
import ExtensionsPanel from "./panels/ExtensionsPanel";



import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  FileCode2,
  FileText,
  File,
  Search,
  GitBranch,
  Play,
  Boxes,
  FlaskConical,
} from "lucide-react";

export default function ExplorerSidebar() {
    const { workspace } = useExplorer();
  
  const { darkMode } = useEditorTheme();

  const [activePanel, setActivePanel] = useState<
  "explorer" |
  "search" |
  "git" |
  "run" |
  "extensions" |
  null
>("explorer");

  

  return (
  <div
    className={`flex h-full ${
      darkMode ? "bg-[#09090B]" : "bg-gray-100"
    }`}
  >
    {/* Activity Bar */}
    <div
      className={`w-14 border-r flex flex-col items-center py-4 gap-6 ${
        darkMode
          ? "bg-[#0B0D14] border-white/10"
          : "bg-gray-100 border-gray-300"
      }`}
    >
      <button
        onClick={() =>
          setActivePanel((prev) =>
            prev === "explorer" ? null : "explorer"
          )
        }
        className={
          activePanel === "explorer"
            ? "text-cyan-400"
            : "text-slate-500 hover:text-white"
        }
      >
        <FileCode2 size={22} />
      </button>

      <button
        onClick={() =>
          setActivePanel((prev) =>
            prev === "search" ? null : "search"
          )
        }
        className={
          activePanel === "search"
            ? "text-cyan-400"
            : "text-slate-500 hover:text-white"
        }
      >
        <Search size={20} />
      </button>

      <button
        onClick={() =>
          setActivePanel((prev) =>
            prev === "git" ? null : "git"
          )
        }
        className={
          activePanel === "git"
            ? "text-cyan-400"
            : "text-slate-500 hover:text-white"
        }
      >
        <GitBranch size={20} />
      </button>

      <button
        onClick={() =>
          setActivePanel((prev) =>
            prev === "run" ? null : "run"
          )
        }
        className={
          activePanel === "run"
            ? "text-cyan-400"
            : "text-slate-500 hover:text-white"
        }
      >
        <Play size={20} />
      </button>

      <button
        onClick={() =>
          setActivePanel((prev) =>
            prev === "extensions" ? null : "extensions"
          )
        }
        className={
          activePanel === "extensions"
            ? "text-cyan-400"
            : "text-slate-500 hover:text-white"
        }
      >
        <Boxes size={20} />
      </button>

      <button className="text-slate-500 hover:text-white mt-auto">
        <FlaskConical size={20} />
      </button>
    </div>

    {/* Sidebar */}
    {activePanel && (
  <div
    className={`w-72 border-r flex flex-col transition-all ${
      darkMode
        ? "bg-[#11131B] border-white/10"
        : "bg-white border-gray-300"
    }`}
  >
    {activePanel === "explorer" && (
      <ExplorerPanel />
    )}

    {activePanel === "search" && (
      <SearchPanel />
    )}

    {activePanel === "git" && (
      <GitPanel />
    )}

    {activePanel === "run" && (
      <RunPanel />
    )}

    {activePanel === "extensions" && (
      <ExtensionsPanel />
    )}
  </div>
)}
  </div>
);
}