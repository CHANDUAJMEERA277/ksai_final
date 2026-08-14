"use client";

import {
  Keyboard,
  Command,
  Play,
  Sparkles,
  Brain,
  Mic,
  Monitor,
} from "lucide-react";

import { useEditorSettings } from "../EditorSettingsContext";

export default function KeyboardSettings() {

  const {

    settings,

    updateKeyboard,

  } = useEditorSettings();

  const keyboard = settings.keyboard;

  return (

    <div className="p-8 space-y-10">

      {/* Heading */}

      <div>

        <h2 className="text-2xl font-bold">

          Keyboard Settings

        </h2>

        <p className="text-sm opacity-70 mt-2">

          Configure shortcuts and keybindings.

        </p>

      </div>

      {/* Keymap */}

      <div className="rounded-xl border p-5">

        <div className="flex items-center gap-2 mb-4">

          <Keyboard size={18} />

          <span className="font-semibold">

            Keyboard Profile

          </span>

        </div>

        <select
          value={keyboard.keymap}
          onChange={(e)=>

            updateKeyboard({

              keymap:e.target.value as any

            })

          }
          className="border rounded-xl px-4 py-3 w-72"
        >

          <option>VSCode</option>

          <option>Cursor</option>

          <option>IntelliJ</option>

          <option>Visual Studio</option>

          <option>Vim</option>

          <option>Emacs</option>

        </select>

      </div>

      {/* Vim */}

      <div className="rounded-xl border p-5 flex justify-between items-center">

        <span>Enable Vim Mode</span>

        <input
          type="checkbox"
          checked={keyboard.vimMode}
          onChange={(e)=>

            updateKeyboard({

              vimMode:e.target.checked

            })

          }
        />

      </div>

      {/* Emacs */}

      <div className="rounded-xl border p-5 flex justify-between items-center">

        <span>Enable Emacs Mode</span>

        <input
          type="checkbox"
          checked={keyboard.emacsMode}
          onChange={(e)=>

            updateKeyboard({

              emacsMode:e.target.checked

            })

          }
        />

      </div>

      {/* Shortcuts */}

      {[
        {
          title:"AI Autocomplete",
          icon:Command,
          key:"autoCompleteShortcut",
        },
        {
          title:"Run Program",
          icon:Play,
          key:"runShortcut",
        },
        {
          title:"Format Code",
          icon:Sparkles,
          key:"formatShortcut",
        },
        {
          title:"Explain Code",
          icon:Brain,
          key:"explainShortcut",
        },
        {
          title:"Auto Code",
          icon:Sparkles,
          key:"autoCodeShortcut",
        },
        {
          title:"Screen Mentor",
          icon:Monitor,
          key:"screenMentorShortcut",
        },
        {
          title:"Dictator",
          icon:Mic,
          key:"dictatorShortcut",
        },

      ].map((item)=>{

        const Icon=item.icon;

        return(

          <div
            key={item.key}
            className="rounded-xl border p-5"
          >

            <div className="flex items-center gap-2 mb-3">

              <Icon size={18}/>

              <span className="font-semibold">

                {item.title}

              </span>

            </div>

            <input
              value={(keyboard as any)[item.key]}
              onChange={(e)=>

                updateKeyboard({

                  [item.key]:e.target.value,

                } as any)

              }
              className="border rounded-xl px-4 py-3 w-72"
            />

          </div>

        );

      })}

    </div>

  );

}