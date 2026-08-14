"use client";

import {
  Bot,
  Cpu,
  KeyRound,
  Brain,
  GraduationCap,
} from "lucide-react";

import { useEditorSettings } from "../EditorSettingsContext";

export default function AISettings() {

  const {
    settings,
    updateAI,
  } = useEditorSettings();

  const ai = settings.ai;

  return (

    <div className="p-8 space-y-10">

      {/* Heading */}

      <div>

        <h2 className="text-2xl font-bold">

          AI Settings

        </h2>

        <p className="text-sm opacity-70 mt-2">

          Configure the AI engine powering
          KnowledgeStream AI.

        </p>

      </div>

      {/* Provider */}

      <div className="rounded-xl border p-5">

        <div className="flex items-center gap-2 mb-4">

          <Bot size={18} />

          <span className="font-semibold">

            AI Provider

          </span>

        </div>

        <select
          value={ai.provider}
          onChange={(e)=>
            updateAI({
              provider:e.target.value as any
            })
          }
          className="border rounded-xl px-4 py-3 w-72"
        >

          <option>Gemini</option>

          <option>OpenAI</option>

          <option>Claude</option>

          <option>DeepSeek</option>

          <option>Ollama</option>

        </select>

      </div>

      {/* Model */}

      <div className="rounded-xl border p-5">

        <div className="flex items-center gap-2 mb-4">

          <Cpu size={18} />

          <span className="font-semibold">

            AI Model

          </span>

        </div>

        <input
          value={ai.model}
          onChange={(e)=>
            updateAI({
              model:e.target.value
            })
          }
          className="border rounded-xl px-4 py-3 w-80"
        />

      </div>

      {/* Temperature */}

      <div className="rounded-xl border p-5">

        <div className="flex items-center justify-between">

          <span className="font-semibold">

            Temperature

          </span>

          <span>

            {ai.temperature}

          </span>

        </div>

        <input
          type="range"
          min={0}
          max={2}
          step={0.1}
          value={ai.temperature}
          onChange={(e)=>
            updateAI({
              temperature:Number(e.target.value)
            })
          }
          className="w-full mt-5"
        />

      </div>

      {/* Coding Assistant */}

      <div className="rounded-xl border p-5 space-y-5">

        <div className="flex items-center gap-2 font-semibold">

          <Brain size={18} />

          Coding Assistant

        </div>

        <label className="flex items-center justify-between">

          AI Suggestions

          <input
            type="checkbox"
            checked={ai.suggestions}
            onChange={(e)=>
              updateAI({
                suggestions:e.target.checked
              })
            }
          />

        </label>

        <label className="flex items-center justify-between">

          Explain Code

          <input
            type="checkbox"
            checked={ai.autoExplain}
            onChange={(e)=>
              updateAI({
                autoExplain:e.target.checked
              })
            }
          />

        </label>

      </div>

      {/* KnowledgeStream AI */}

      <div className="rounded-xl border p-5 space-y-5">

        <div className="flex items-center gap-2 font-semibold">

          <GraduationCap size={18} />

          KnowledgeStream AI

        </div>

        <label className="flex items-center justify-between">

          Screen Mentor

          <input
            type="checkbox"
            checked={ai.screenMentor}
            onChange={(e)=>
              updateAI({
                screenMentor:e.target.checked
              })
            }
          />

        </label>

        <label className="flex items-center justify-between">

          Dictator

          <input
            type="checkbox"
            checked={ai.dictator}
            onChange={(e)=>
              updateAI({
                dictator:e.target.checked
              })
            }
          />

        </label>

      </div>

      {/* API Key */}

      <div className="rounded-xl border p-5">

        <div className="flex items-center gap-2 mb-4">

          <KeyRound size={18} />

          <span className="font-semibold">

            Gemini API Key

          </span>

        </div>

        <input
          type="password"
          placeholder="Enter your API Key..."
          className="border rounded-xl px-4 py-3 w-full"
        />

        <button
          className="mt-5 px-5 py-3 rounded-xl bg-blue-600 text-white"
        >

          Test Connection

        </button>

      </div>

    </div>

  );

}