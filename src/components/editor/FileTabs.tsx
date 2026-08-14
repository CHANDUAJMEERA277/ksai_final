"use client";

import {
  FileCode2,
  X,
  Circle,
} from "lucide-react";

const files = [
  {
    name: "Main.java",
    active: true,
    modified: false,
  },
  {
    name: "Student.java",
    active: false,
    modified: true,
  },
  {
    name: "index.html",
    active: false,
    modified: false,
  },
  {
    name: "style.css",
    active: false,
    modified: false,
  },
];

export default function FileTabs() {
  return (
    <div className="h-12 bg-[#11131B] border-b border-white/10 flex items-center overflow-x-auto">

      {files.map((file) => (

        <button
          key={file.name}
          className={`group h-full px-5 flex items-center gap-3 border-r border-white/10 transition-all whitespace-nowrap ${
            file.active
              ? "bg-[#1A1D26] text-white border-t-2 border-t-cyan-400"
              : "text-slate-400 hover:bg-[#181B23] hover:text-white"
          }`}
        >

          <FileCode2
            size={16}
            className={
              file.active
                ? "text-cyan-400"
                : "text-slate-500"
            }
          />

          <span className="text-sm">

            {file.name}

          </span>

          {file.modified ? (
            <Circle
              size={8}
              fill="currentColor"
              className="text-yellow-400"
            />
          ) : (
            <X
              size={14}
              className="opacity-0 group-hover:opacity-100 transition"
            />
          )}

        </button>

      ))}

    </div>
  );
}