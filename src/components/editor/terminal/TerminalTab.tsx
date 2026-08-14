"use client";

import { Plus, X } from "lucide-react";
import { useTerminal } from "./TerminalContext";

export default function TerminalTab() {
  const {
    tabs,
    activeTab,
    createTab,
    closeTab,
    setActiveTab,
  } = useTerminal();

  return (
    <div className="flex items-center border-b border-white/10 bg-[#11131B]">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 cursor-pointer ${
            activeTab === tab.id
              ? "bg-[#1A1D26]"
              : ""
          }`}
        >
          <span>{tab.name}</span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              closeTab(tab.id);
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}

      <button
        onClick={createTab}
        className="ml-2 p-2"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}