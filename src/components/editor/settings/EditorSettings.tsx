"use client";

import {
  Code2,
  WrapText,
  Map,
  Hash,
  Type,
  MousePointer2,
  Braces,
  Sparkles,
} from "lucide-react";

import { useEditorSettings } from "../EditorSettingsContext";

export default function EditorSettings() {
  const {
    settings,
    updateEditor,
  } = useEditorSettings();

  const editor = settings.editor;

  return (
    <div className="p-8 space-y-10">

      {/* Heading */}

      <div>

        <h2 className="text-2xl font-bold">

          Editor Settings

        </h2>

        <p className="text-sm opacity-70 mt-2">

          Configure the Monaco Editor experience.

        </p>

      </div>

      {/* Font Family */}

      <div className="rounded-xl border p-5">

        <div className="flex items-center gap-2 mb-4">

          <Type size={18} />

          <span className="font-semibold">

            Font Family

          </span>

        </div>

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

      </div>

      {/* Font Size */}

      <div className="rounded-xl border p-5">

        <div className="flex items-center gap-2 mb-4">

          <Code2 size={18} />

          <span className="font-semibold">

            Font Size

          </span>

        </div>

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

          <span className="font-bold">

            {editor.fontSize}px

          </span>

        </div>

      </div>

      {/* Word Wrap */}

      <div className="rounded-xl border p-5 flex items-center justify-between">

        <div>

          <div className="flex items-center gap-2 font-semibold">

            <WrapText size={18} />

            Word Wrap

          </div>

          <p className="text-sm opacity-70 mt-2">

            Wrap long lines automatically.

          </p>

        </div>

        <input
          type="checkbox"
          checked={editor.wordWrap}
          onChange={(e) =>
            updateEditor({
              wordWrap: e.target.checked,
            })
          }
        />

      </div>

      {/* Minimap */}

      <div className="rounded-xl border p-5 flex items-center justify-between">

        <div>

          <div className="flex items-center gap-2 font-semibold">

            <Map size={18} />

            Minimap

          </div>

          <p className="text-sm opacity-70 mt-2">

            Show editor minimap.

          </p>

        </div>

        <input
          type="checkbox"
          checked={editor.minimap}
          onChange={(e) =>
            updateEditor({
              minimap: e.target.checked,
            })
          }
        />

      </div>

      {/* Line Numbers */}

      <div className="rounded-xl border p-5 flex items-center justify-between">

        <div>

          <div className="flex items-center gap-2 font-semibold">

            <Hash size={18} />

            Line Numbers

          </div>

          <p className="text-sm opacity-70 mt-2">

            Display line numbers.

          </p>

        </div>

        <input
          type="checkbox"
          checked={editor.lineNumbers}
          onChange={(e) =>
            updateEditor({
              lineNumbers: e.target.checked,
            })
          }
        />

      </div>

      {/* Cursor Style */}

      <div className="rounded-xl border p-5">

        <div className="flex items-center gap-2 mb-4">

          <MousePointer2 size={18} />

          <span className="font-semibold">

            Cursor Style

          </span>

        </div>

        <select
          value={editor.cursorStyle}
          onChange={(e) =>
            updateEditor({
              cursorStyle: e.target.value as any,
            })
          }
          className="border rounded-xl px-4 py-3 w-80"
        >

          <option value="line">

            Line

          </option>

          <option value="block">

            Block

          </option>

          <option value="underline">

            Underline

          </option>

        </select>

      </div>

      {/* Tab Size */}

      <div className="rounded-xl border p-5">

        <div className="flex items-center gap-2 mb-4">

          <Braces size={18} />

          <span className="font-semibold">

            Tab Size

          </span>

        </div>

        <select
          value={editor.tabSize}
          onChange={(e) =>
            updateEditor({
              tabSize: Number(e.target.value),
            })
          }
          className="border rounded-xl px-4 py-3 w-40"
        >

          <option value={2}>2</option>

          <option value={4}>4</option>

          <option value={8}>8</option>

        </select>

      </div>

      {/* Format On Save */}

      <div className="rounded-xl border p-5 flex items-center justify-between">

        <div>

          <div className="flex items-center gap-2 font-semibold">

            <Sparkles size={18} />

            Format On Save

          </div>

          <p className="text-sm opacity-70 mt-2">

            Automatically format the code when saving.

          </p>

        </div>

        <input
          type="checkbox"
          checked={editor.formatOnSave}
          onChange={(e) =>
            updateEditor({
              formatOnSave: e.target.checked,
            })
          }
        />

      </div>

    </div>
  );
}