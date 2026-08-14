"use client";

import { useEffect, useState } from "react";

import {
  X,
  House,
  Palette,
  Code2,
  Bot,
  TerminalSquare,
  Keyboard,
  User,
  Info,
  RotateCcw,
  Save,
} from "lucide-react";

import { useEditorTheme } from "./EditorTheme";

import GeneralSettings from "./settings/GeneralSettings";
import AppearanceSettings from "./settings/AppearanceSettings";
import EditorSettings from "./settings/EditorSettings";
import AISettings from "./settings/AISettings";
import TerminalSettings from "./settings/TerminalSettings";
import KeyboardSettings from "./settings/KeyboardSettings";
import AccountSettings from "./settings/AccountSettings";
import AboutSettings from "./settings/AboutSettings";

interface Props {
  open: boolean;
  onClose: () => void;
}

const MENUS = [
  {
    id: "general",
    label: "General",
    icon: House,
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: Palette,
  },
  {
    id: "editor",
    label: "Editor",
    icon: Code2,
  },
  {
    id: "ai",
    label: "AI",
    icon: Bot,
  },
  {
    id: "terminal",
    label: "Terminal",
    icon: TerminalSquare,
  },
  {
    id: "keyboard",
    label: "Keyboard",
    icon: Keyboard,
  },
  {
    id: "account",
    label: "Account",
    icon: User,
  },
  {
    id: "about",
    label: "About",
    icon: Info,
  },
];

export default function SettingsModal({
  open,
  onClose,
}: Props) {

  const { darkMode } = useEditorTheme();

  const [activeTab, setActiveTab] =
    useState("general");

  useEffect(() => {

    const handleKey = (e: KeyboardEvent) => {

      if (e.key === "Escape") {

        onClose();

      }

    };

    window.addEventListener("keydown", handleKey);

    return () =>
      window.removeEventListener(
        "keydown",
        handleKey
      );

  }, [onClose]);

  function renderContent() {

  switch (activeTab) {

    case "general":
      return <GeneralSettings />;

    case "appearance":
      return <AppearanceSettings />;

    case "editor":
      return <EditorSettings />;

    case "ai":
      return <AISettings />;

    case "terminal":
      return <TerminalSettings />;

    case "keyboard":
      return <KeyboardSettings />;

    case "account":
      return <AccountSettings />;

    case "about":
      return <AboutSettings />;

    default:
      return <GeneralSettings />;

  }

}

  if (!open) return null;

  return (

    <div className="fixed inset-0 z-[999] flex items-center justify-center">

      {/* Overlay */}

      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal */}

      <div
        className={`relative w-[1100px] h-[720px] rounded-2xl shadow-2xl overflow-hidden border flex
        ${
          darkMode
            ? "bg-[#111827] border-white/10"
            : "bg-white border-gray-200"
        }`}
      >

        {/* Sidebar */}

        <div
          className={`w-72 border-r
          ${
            darkMode
              ? "bg-[#0F172A] border-white/10"
              : "bg-gray-50 border-gray-200"
          }`}
        >

          <div className="h-16 flex items-center px-6 border-b border-inherit">

            <h2 className="font-bold text-lg">

              ⚙ Settings

            </h2>

          </div>

          <div className="p-3">

            {MENUS.map((menu) => {

              const Icon = menu.icon;

              const active =
                activeTab === menu.id;

              return (

                <button
                  key={menu.id}
                  onClick={() =>
                    setActiveTab(menu.id)
                  }
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition mb-1
                  ${
                    active
                      ? "bg-blue-600 text-white"
                      : darkMode
                      ? "hover:bg-white/5"
                      : "hover:bg-gray-100"
                  }`}
                >

                  <Icon size={18} />

                  {menu.label}

                </button>

              );

            })}

          </div>

        </div>

        {/* Content */}

        <div className="flex-1 flex flex-col">

          {/* Header */}

          <div
            className={`h-16 border-b flex items-center justify-between px-6
            ${
              darkMode
                ? "border-white/10"
                : "border-gray-200"
            }`}
          >

            <div>

              <h1 className="text-xl font-bold">

                {MENUS.find(
                  (m) => m.id === activeTab
                )?.label}

              </h1>

              <p className="text-sm opacity-70">

                Configure your IDE preferences.

              </p>

            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl hover:bg-black/10 flex items-center justify-center"
            >

              <X size={18} />

            </button>

          </div>

          {/* Dynamic Content */}

          <div className="flex-1 overflow-y-auto">

  {renderContent()}

</div>

          {/* Footer */}

          <div
            className={`h-20 border-t flex items-center justify-between px-6
            ${
              darkMode
                ? "border-white/10"
                : "border-gray-200"
            }`}
          >

            <button
              className="flex items-center gap-2 px-5 py-3 rounded-xl border"
            >

              <RotateCcw size={17} />

              Restore Defaults

            </button>

            <div className="flex gap-3">

              <button
                onClick={onClose}
                className="px-5 py-3 rounded-xl border"
              >

                Cancel

              </button>

              <button
                className="px-6 py-3 rounded-xl bg-blue-600 text-white flex items-center gap-2"
              >

                <Save size={16} />

                Save Changes

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}