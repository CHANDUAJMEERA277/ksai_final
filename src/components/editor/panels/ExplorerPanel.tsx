"use client";

import { FolderOpen } from "lucide-react";

import ExplorerTree from "../explorer/ExplorerTree";
import { useExplorer } from "../explorer/ExplorerContext";
import { useEditorTheme } from "../EditorTheme";

export default function ExplorerPanel() {
  const { workspace } = useExplorer();
  const { darkMode } = useEditorTheme();

  return (
    <>
      <div className="px-5 py-4 border-b border-white/10">
        <h2
          className={`text-sm font-semibold tracking-widest ${
            darkMode
              ? "text-slate-300"
              : "text-gray-700"
          }`}
        >
          EXPLORER
        </h2>
      </div>

      <div className="px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <FolderOpen
            size={18}
            className="text-yellow-400"
          />

          {workspace.name}
        </div>

        <div className="mt-4">
          <ExplorerTree items={workspace.items} />
        </div>
      </div>

      <div className="mt-auto border-t border-white/10">
        <div className="px-5 py-4 text-sm text-slate-500">
          OUTLINE
        </div>

        <div className="px-5 py-4 text-sm text-slate-500">
          TIMELINE
        </div>
      </div>
    </>
  );
}