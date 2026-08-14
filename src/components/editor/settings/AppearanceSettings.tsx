"use client";

import { Palette, Monitor, Moon, Sun } from "lucide-react";

import { useEditorSettings } from "../EditorSettingsContext";

export default function AppearanceSettings() {

  const {
    settings,
    updateAppearance,
    updateEditor,
  } = useEditorSettings();

  const appearance = settings.appearance;
  const editor = settings.editor;

  const colors = [
    "#2563EB",
    "#7C3AED",
    "#059669",
    "#EA580C",
    "#DC2626",
    "#0EA5E9",
    "#F59E0B",
  ];

  return (

    <div className="p-8 space-y-10">

      {/* Heading */}

      <div>

        <h2 className="text-2xl font-bold">

          Appearance

        </h2>

        <p className="text-sm opacity-70 mt-2">

          Customize the look and feel of your IDE.

        </p>

      </div>

      {/* Theme */}

      <section>

        <h3 className="font-semibold mb-4">

          Theme

        </h3>

        <div className="grid grid-cols-3 gap-4">

          <button
            onClick={() =>
              updateAppearance({
                theme: "light",
              })
            }
            className={`rounded-xl border p-5 transition ${
              appearance.theme === "light"
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-gray-300"
            }`}
          >

            <Sun className="mb-3" />

            Light

          </button>

          <button
            onClick={() =>
              updateAppearance({
                theme: "dark",
              })
            }
            className={`rounded-xl border p-5 transition ${
              appearance.theme === "dark"
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-gray-300"
            }`}
          >

            <Moon className="mb-3" />

            Dark

          </button>

          <button
            onClick={() =>
              updateAppearance({
                theme: "system",
              })
            }
            className={`rounded-xl border p-5 transition ${
              appearance.theme === "system"
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-gray-300"
            }`}
          >

            <Monitor className="mb-3" />

            System

          </button>

        </div>

      </section>

      {/* Accent */}

      <section>

        <h3 className="font-semibold mb-4">

          Accent Color

        </h3>

        <div className="flex gap-4 flex-wrap">

          {colors.map((color) => (

            <button
              key={color}
              onClick={() =>
                updateAppearance({
                  accentColor: color,
                })
              }
              style={{
                backgroundColor: color,
              }}
              className={`w-10 h-10 rounded-full border-4 ${
                appearance.accentColor === color
                  ? "border-black"
                  : "border-transparent"
              }`}
            />

          ))}

        </div>

      </section>

      {/* Font */}

      <section>

        <h3 className="font-semibold mb-4">

          Editor Font

        </h3>

        <select
          value={editor.fontFamily}
          onChange={(e) =>
            updateEditor({
              fontFamily: e.target.value,
            })
          }
          className="border rounded-xl px-4 py-3 w-80"
        >

          <option>JetBrains Mono</option>

          <option>Fira Code</option>

          <option>Cascadia Code</option>

          <option>Consolas</option>

          <option>Monaco</option>

        </select>

      </section>

      {/* Font Size */}

      <section>

        <h3 className="font-semibold mb-4">

          Font Size

        </h3>

        <div className="flex items-center gap-5">

          <input
            type="range"
            min={12}
            max={24}
            value={editor.fontSize}
            onChange={(e) =>
              updateEditor({
                fontSize: Number(e.target.value),
              })
            }
            className="w-80"
          />

          <span className="font-semibold">

            {editor.fontSize}px

          </span>

        </div>

      </section>

      {/* Compact */}

      <section>

        <label className="flex items-center gap-4">

          <input
            type="checkbox"
            checked={appearance.compactMode}
            onChange={(e) =>
              updateAppearance({
                compactMode: e.target.checked,
              })
            }
          />

          Compact Mode

        </label>

      </section>

      {/* Glass */}

      <section>

        <label className="flex items-center gap-4">

          <input
            type="checkbox"
            checked={appearance.glassEffect}
            onChange={(e) =>
              updateAppearance({
                glassEffect: e.target.checked,
              })
            }
          />

          Glass Effect

        </label>

      </section>

    </div>

  );

}