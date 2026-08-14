"use client";

import { X } from "lucide-react";

import { useTerminal } from "./TerminalContext";

export default function XTermTabs() {
  const {
    tabs,
    activeTab,
    setActiveTab,
    createTab,
    closeTab,
  } = useTerminal();

  return (
    <div className="flex border-b border-white/10">

      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() =>
            setActiveTab(tab.id)
          }
          className={`flex items-center gap-3 px-5 py-3 ${
            activeTab === tab.id
              ? "bg-[#2A2D38]"
              : "bg-[#1A1D26]"
          }`}
        >
          {tab.name}

          <X
            size={14}
            onClick={(e) => {
              e.stopPropagation();

              closeTab(tab.id);
            }}
          />
        </button>
      ))}

      <button
        onClick={createTab}
        className="px-5"
      >
        +
      </button>
    </div>
  );
}