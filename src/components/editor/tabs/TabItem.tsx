"use client";

import {
  X,
  Circle,
  Pin,
} from "lucide-react";

import { EditorTab } from "./TabTypes";
import { useTabs } from "./TabContext";
import { useEditorTheme } from "../EditorTheme";

interface Props {
  tab: EditorTab;
}

function getLanguageIcon(language: string) {
  switch (language.toLowerCase()) {
    case "java":
      return "☕";

    case "python":
      return "🐍";

    case "javascript":
      return "🟨";

    case "typescript":
      return "🔷";

    case "html":
      return "🌐";

    case "css":
      return "🎨";

    case "cpp":
      return "⚙";

    case "c":
      return "💻";

    default:
      return "📄";
  }
}

export default function TabItem({
  tab,
}: Props) {
  const {
    activeTabId,
    setActiveTab,
    closeTab,
  } = useTabs();

  const { darkMode } =
    useEditorTheme();

  const active =
    activeTabId === tab.id;

  return (
    <button
      onClick={() =>
        setActiveTab(tab.id)
      }
      className={`group h-full min-w-[170px] px-4 flex items-center justify-between border-r transition-all
      ${
        active
          ? darkMode
            ? "bg-[#1A1D26]"
            : "bg-gray-100"
          : darkMode
          ? "hover:bg-white/5"
          : "hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-2 overflow-hidden">

        <span>

          {getLanguageIcon(
            tab.language
          )}

        </span>

        <span className="truncate text-sm">

          {tab.name}

        </span>

        {tab.isDirty && (
          <Circle
            size={8}
            fill="currentColor"
          />
        )}

        {tab.isPinned && (
          <Pin size={12} />
        )}

      </div>

      <X
        size={15}
        onClick={(e) => {
          e.stopPropagation();
          closeTab(tab.id);
        }}
        className="opacity-0 group-hover:opacity-100 transition"
      />
    </button>
  );
}