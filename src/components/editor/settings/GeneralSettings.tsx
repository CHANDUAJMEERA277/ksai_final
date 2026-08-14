"use client";

import { Save, RotateCcw, LogOut } from "lucide-react";
import { useEditorSettings } from "../EditorSettingsContext";

export default function GeneralSettings() {

  const {
    settings,
    updateGeneral,
  } = useEditorSettings();

  const general = settings.general;

  return (

    <div className="p-8 space-y-10">

      {/* Heading */}

      <div>

        <h2 className="text-2xl font-bold">

          General Settings

        </h2>

        <p className="text-sm opacity-70 mt-2">

          Configure the overall behavior of KnowledgeStream AI IDE.

        </p>

      </div>

      {/* Auto Save */}

      <div className="rounded-xl border p-5">

        <div className="flex items-center justify-between">

          <div>

            <div className="flex items-center gap-2 font-semibold">

              <Save size={18} />

              Auto Save

            </div>

            <p className="text-sm opacity-70 mt-2">

              Automatically save your files while editing.

            </p>

          </div>

          <input
            type="checkbox"
            checked={general.autoSave}
            onChange={(e)=>

              updateGeneral({

                autoSave:e.target.checked

              })

            }
          />

        </div>

      </div>

      {/* Restore Session */}

      <div className="rounded-xl border p-5">

        <div className="flex items-center justify-between">

          <div>

            <div className="flex items-center gap-2 font-semibold">

              <RotateCcw size={18} />

              Restore Previous Session

            </div>

            <p className="text-sm opacity-70 mt-2">

              Open the same files after restarting the IDE.

            </p>

          </div>

          <input
            type="checkbox"
            checked={general.restoreSession}
            onChange={(e)=>

              updateGeneral({

                restoreSession:e.target.checked

              })

            }
          />

        </div>

      </div>

      {/* Confirm Before Exit */}

      <div className="rounded-xl border p-5">

        <div className="flex items-center justify-between">

          <div>

            <div className="flex items-center gap-2 font-semibold">

              <LogOut size={18} />

              Confirm Before Exit

            </div>

            <p className="text-sm opacity-70 mt-2">

              Ask for confirmation before closing the IDE.

            </p>

          </div>

          <input
            type="checkbox"
            checked={general.confirmBeforeExit}
            onChange={(e)=>

              updateGeneral({

                confirmBeforeExit:e.target.checked

              })

            }
          />

        </div>

      </div>

    </div>

  );

}