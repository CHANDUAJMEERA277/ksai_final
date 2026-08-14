"use client";

import { Search } from "lucide-react";
import { useEditorTheme } from "../EditorTheme";

export default function SearchPanel() {
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
          SEARCH
        </h2>
      </div>

      <div className="p-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-3 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search files..."
            className={`w-full rounded-lg border py-2 pl-10 pr-4 outline-none ${
              darkMode
                ? "bg-[#1A1D26] border-white/10 text-white"
                : "bg-white border-gray-300"
            }`}
          />
        </div>
      </div>
    </>
  );
}