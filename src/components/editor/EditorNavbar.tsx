"use client";

import React, { useEffect, useState } from "react";
import { useEditorTheme } from "./EditorTheme";
import Image from "next/image";
import LanguageDropdown from "./LanguageDropdown";
import SettingsModal from "./SettingsModal";

import { useTabs } from "./tabs/TabContext";


import {
  useLanguage,
} from "./languages/LanguageContext";

import {
  Sun,
  Moon,
  Share2,
  Save,
  Settings,
  ChevronDown,
} from "lucide-react";



export default function EditorNavbar() {

  const { darkMode, toggleTheme } = useEditorTheme();
  const {

  language,

  setLanguage,

} = useLanguage();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { saveActiveTab } = useTabs();
  useEffect(() => {

  const handler = (e: KeyboardEvent) => {

    if ((e.ctrlKey || e.metaKey) && e.key === "s") {

      e.preventDefault();

      saveActiveTab();

    }

  };

  window.addEventListener("keydown", handler);

  return () =>
    window.removeEventListener(
      "keydown",
      handler
    );

}, [saveActiveTab]);

console.log("Settings Open:", settingsOpen);
  

  return (
  <>

    <header
      className={`h-16 border-b flex items-center justify-between px-6 transition-all duration-300 ${
        darkMode
          ? "bg-[#0B0D14] border-white/10 text-white"
          : "bg-white border-gray-200 text-gray-900 shadow-sm"
      }`}
    >
      {/* Left */}

      <div className="flex items-center gap-4">

  <Image
    src="/images/logo.png"
    alt="KnowledgeStream AI"
    width={48}
    height={48}
    className="rounded-xl object-contain"
  />

  <div>

    <h1 className="text-lg font-bold">
      KnowledgeStream AI
    </h1>

    <p
      className={`text-xs ${
        darkMode
          ? "text-slate-400"
          : "text-gray-500"
      }`}
    >
      Cursor IDE Workspace
    </p>

  </div>

  <a
    href="/dashboard"
    className={`ml-4 px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
      darkMode
        ? "bg-[#151823] border-white/10 hover:bg-[#1C2130] text-slate-200"
        : "bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-800"
    }`}
  >
    ← Dashboard
  </a>

</div>

      {/* Right */}

      <div className="flex items-center gap-3">

        {/* Theme Toggle */}

        <button
          onClick={toggleTheme}
          className={`flex items-center gap-2 px-4 h-10 rounded-xl border transition ${
            darkMode
              ? "bg-[#151823] border-white/10 hover:bg-[#1C2130]"
              : "bg-gray-100 border-gray-300 hover:bg-gray-200"
          }`}
        >
          {darkMode ? (
            <>
              <Moon size={16} />
              <span>Dark</span>
            </>
          ) : (
            <>
              <Sun size={16} />
              <span>Light</span>
            </>
          )}

          <ChevronDown size={15} />
        </button>

        {/* Language */}

        <LanguageDropdown
  value={language.name}
  onChange={setLanguage}
  darkMode={darkMode}
/>

        {/* Share */}

        <button
          className={`h-10 px-4 rounded-xl border flex items-center gap-2 transition ${
            darkMode
              ? "bg-[#151823] border-white/10 hover:bg-[#1C2130]"
              : "bg-gray-100 border-gray-300 hover:bg-gray-200"
          }`}
        >
          <Share2 size={16} />
          Share
        </button>

        {/* Save */}

        <button
  onClick={saveActiveTab}
  className={`h-10 px-4 rounded-xl border flex items-center gap-2 transition ${
    darkMode
      ? "bg-[#151823] border-white/10 hover:bg-[#1C2130]"
      : "bg-gray-100 border-gray-300 hover:bg-gray-200"
  }`}
>
  <Save size={16} />
  Save
</button>

        {/* Settings */}

        <button
  onClick={() => {
    console.log("Settings button clicked");
    setSettingsOpen(true);
  }}
  className={`h-10 px-4 rounded-xl border flex items-center gap-2 transition ${
    darkMode
      ? "bg-[#151823] border-white/10 hover:bg-[#1C2130]"
      : "bg-gray-100 border-gray-300 hover:bg-gray-200"
  }`}
>
  <Settings size={16} />
  Settings
</button>

        

       
      </div>
    </header>

    <SettingsModal
      open={settingsOpen}
      onClose={() => setSettingsOpen(false)}
    />

  </>


  );
}