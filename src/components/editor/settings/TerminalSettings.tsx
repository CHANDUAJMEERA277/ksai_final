"use client";

import {
  TerminalSquare,
  Type,
  MousePointer2,
  Bell,
  Clipboard,
  Trash2,
} from "lucide-react";

import { useEditorSettings } from "../EditorSettingsContext";

export default function TerminalSettings() {

  const {
    settings,
    updateTerminal,
  } = useEditorSettings();

  const terminal = settings.terminal;

  return (

    <div className="p-8 space-y-10">

      {/* Heading */}

      <div>

        <h2 className="text-2xl font-bold">

          Terminal Settings

        </h2>

        <p className="text-sm opacity-70 mt-2">

          Configure the integrated terminal.

        </p>

      </div>

      {/* Shell */}

      <div className="rounded-xl border p-5">

        <div className="flex items-center gap-2 mb-4">

          <TerminalSquare size={18} />

          <span className="font-semibold">

            Default Shell

          </span>

        </div>

        <select
          value={terminal.shell}
          onChange={(e)=>
            updateTerminal({
              shell:e.target.value as any
            })
          }
          className="border rounded-xl px-4 py-3 w-72"
        >

          <option>PowerShell</option>

          <option>CMD</option>

          <option>Git Bash</option>

          <option>WSL</option>

        </select>

      </div>

      {/* Font */}

      <div className="rounded-xl border p-5">

        <div className="flex items-center gap-2 mb-4">

          <Type size={18} />

          <span className="font-semibold">

            Font Family

          </span>

        </div>

        <select
          value={terminal.fontFamily}
          onChange={(e)=>
            updateTerminal({
              fontFamily:e.target.value
            })
          }
          className="border rounded-xl px-4 py-3 w-72"
        >

          <option>JetBrains Mono</option>

          <option>Fira Code</option>

          <option>Cascadia Code</option>

          <option>Consolas</option>

        </select>

      </div>

      {/* Font Size */}

      <div className="rounded-xl border p-5">

        <div className="flex justify-between">

          <span className="font-semibold">

            Font Size

          </span>

          <span>

            {terminal.fontSize}px

          </span>

        </div>

        <input
          type="range"
          min={10}
          max={24}
          value={terminal.fontSize}
          onChange={(e)=>
            updateTerminal({
              fontSize:Number(e.target.value)
            })
          }
          className="w-full mt-5"
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
          value={terminal.cursorStyle}
          onChange={(e)=>
            updateTerminal({
              cursorStyle:e.target.value as any
            })
          }
          className="border rounded-xl px-4 py-3 w-60"
        >

          <option value="block">Block</option>

          <option value="line">Line</option>

          <option value="underline">Underline</option>

        </select>

      </div>

      {/* Switches */}

      {[
        {
          title:"Cursor Blink",
          value:terminal.cursorBlink,
          key:"cursorBlink"
        },
        {
          title:"Copy On Select",
          value:terminal.copyOnSelect,
          key:"copyOnSelect"
        },
        {
          title:"Right Click Paste",
          value:terminal.rightClickPaste,
          key:"rightClickPaste"
        },
        {
          title:"Terminal Bell",
          value:terminal.terminalBell,
          key:"terminalBell"
        },
        {
          title:"Clear Terminal Before Run",
          value:terminal.clearOnRun,
          key:"clearOnRun"
        },
      ].map((item)=>(

        <div
          key={item.key}
          className="rounded-xl border p-5 flex justify-between items-center"
        >

          <span className="font-semibold">

            {item.title}

          </span>

          <input
            type="checkbox"
            checked={item.value}
            onChange={(e)=>
              updateTerminal({
                [item.key]:e.target.checked
              } as any)
            }
          />

        </div>

      ))}

      {/* Startup Command */}

      <div className="rounded-xl border p-5">

        <div className="flex items-center gap-2 mb-4">

          <Clipboard size={18} />

          <span className="font-semibold">

            Startup Command

          </span>

        </div>

        <input
          value={terminal.startupCommand}
          onChange={(e)=>
            updateTerminal({
              startupCommand:e.target.value
            })
          }
          placeholder="npm install"
          className="border rounded-xl px-4 py-3 w-full"
        />

      </div>

      {/* Scrollback */}

      <div className="rounded-xl border p-5">

        <div className="flex justify-between">

          <span className="font-semibold">

            Scrollback Buffer

          </span>

          <span>

            {terminal.scrollback}

          </span>

        </div>

        <input
          type="range"
          min={1000}
          max={50000}
          step={1000}
          value={terminal.scrollback}
          onChange={(e)=>
            updateTerminal({
              scrollback:Number(e.target.value)
            })
          }
          className="w-full mt-5"
        />

      </div>

    </div>

  );

}