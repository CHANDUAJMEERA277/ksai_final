"use client";

import { useMemo, useState } from "react";
import {
  RotateCcw,
  Play,
  Layers,
  ArrowDown,
  ArrowRight,
  Sparkles,
  GitCommit,
  CheckCircle2,
} from "lucide-react";

export type VisualNode = {
  id?: string;
  label: string;
  description?: string;
};

export type VisualData = {
  type?: "flow" | "sequence" | "diagram" | "comparison" | "linked_list";
  title?: string;
  description?: string;
  nodes?: VisualNode[];
  steps?: string[];
  before?: string[];
  after?: string[];
  operation?: string;
  columns?: {
    title: string;
    items: string[];
  }[];
  replayable?: boolean;
};

export interface VisualNoteRendererProps {
  metadata?: string | VisualData | null;
  content?: string;
}

function parseVisual(metadata?: string | VisualData | null): VisualData | null {
  if (!metadata) return null;

  if (typeof metadata === "object") {
    return metadata;
  }

  try {
    const parsed = JSON.parse(metadata);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

export default function VisualNoteRenderer({
  metadata,
  content,
}: VisualNoteRendererProps) {
  const visual = useMemo(() => parseVisual(metadata), [metadata]);
  const [replayStep, setReplayStep] = useState(0);

  if (!visual) {
    return (
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-xs">
        <div className="mb-2 text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
          <Sparkles size={14} className="text-blue-600" />
          <span>Visual Diagram</span>
        </div>
        <pre className="whitespace-pre-wrap font-mono text-xs text-slate-800 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          {content || "No visual content available."}
        </pre>
      </div>
    );
  }

  const type = visual.type || "flow";

  /*
   * =========================================================================
   * 1. FLOW / PIPELINE DIAGRAM
   * =========================================================================
   */
  if (type === "flow") {
    const steps =
      visual.steps ||
      visual.nodes?.map((node) => node.label) ||
      [];

    return (
      <div className="rounded-3xl border-2 border-blue-200/90 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 p-6 sm:p-7 shadow-xs space-y-4">
        {visual.title && (
          <div className="border-b border-blue-100 pb-3">
            <h4 className="text-base sm:text-lg font-black tracking-tight text-slate-950 uppercase flex items-center gap-2">
              <Layers size={18} className="text-blue-600" />
              <span>{visual.title}</span>
            </h4>
            {visual.description && (
              <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed">
                {visual.description}
              </p>
            )}
          </div>
        )}

        {/* Responsive Flow: Vertical with clear arrows on mobile, wrapped pipeline on desktop */}
        <div className="flex flex-col items-center gap-2.5 w-full py-2">
          {steps.map((step, index) => {
            const isDimmed = visual.replayable && index > replayStep;
            return (
              <div
                key={`${step}-${index}`}
                className="flex flex-col items-center w-full max-w-lg transition-all duration-300"
              >
                {/* Step Node Card */}
                <div
                  className={`w-full rounded-2xl border-2 px-6 py-3.5 text-center text-xs sm:text-sm font-black transition-all ${
                    isDimmed
                      ? "opacity-30 border-slate-200 bg-slate-100 text-slate-400"
                      : "border-blue-400/90 bg-white text-slate-950 shadow-sm hover:border-blue-600 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                </div>

                {/* Connector Arrow */}
                {index < steps.length - 1 && (
                  <div className="py-1 text-blue-600 font-black text-xl flex items-center justify-center select-none animate-pulse">
                    <ArrowDown size={20} className="stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Interactive Replay Controls */}
        {visual.replayable && steps.length > 1 && (
          <div className="mt-4 flex justify-center gap-2 pt-3 border-t border-blue-100">
            <button
              type="button"
              onClick={() => setReplayStep(0)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setReplayStep(Math.min(replayStep + 1, steps.length - 1))
              }
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs"
            >
              <Play size={13} />
              <span>Next Step ({replayStep + 1}/{steps.length})</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  /*
   * =========================================================================
   * 2. LINKED LIST / MEMORY NODES
   * =========================================================================
   */
  if (type === "linked_list") {
    const before = visual.before || [];
    const after = visual.after || [];

    return (
      <div className="rounded-3xl border-2 border-indigo-200/90 bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 p-6 sm:p-7 shadow-xs space-y-5">
        {visual.title && (
          <div className="border-b border-indigo-100 pb-3">
            <h4 className="text-base sm:text-lg font-black tracking-tight text-slate-950 uppercase flex items-center gap-2">
              <GitCommit size={18} className="text-indigo-600" />
              <span>{visual.title}</span>
            </h4>
            {visual.description && (
              <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-600">
                {visual.description}
              </p>
            )}
          </div>
        )}

        {/* Before State */}
        <div>
          <div className="mb-2.5 text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>State: Before</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {before.map((item, index) => (
              <div key={`${item}-${index}`} className="flex items-center gap-2">
                <div className="rounded-xl border-2 border-indigo-200 bg-white px-4 py-2 font-mono text-xs font-bold text-indigo-950 shadow-xs">
                  {item}
                </div>
                {index < before.length - 1 && (
                  <ArrowRight size={16} className="text-indigo-600 stroke-[3]" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Operation Banner */}
        {visual.operation && (
          <div className="rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/80 p-4 text-center">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-700 mr-2">
              Operation:
            </span>
            <span className="text-xs sm:text-sm font-mono font-bold text-indigo-950">
              {visual.operation}
            </span>
          </div>
        )}

        {/* After State */}
        <div>
          <div className="mb-2.5 text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>State: After</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {after.map((item, index) => (
              <div key={`${item}-${index}`} className="flex items-center gap-2">
                <div className="rounded-xl border-2 border-emerald-200 bg-white px-4 py-2 font-mono text-xs font-bold text-emerald-950 shadow-xs">
                  {item}
                </div>
                {index < after.length - 1 && (
                  <ArrowRight size={16} className="text-emerald-600 stroke-[3]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /*
   * =========================================================================
   * 3. NUMBERED SEQUENCE
   * =========================================================================
   */
  if (type === "sequence") {
    const steps = visual.steps || [];

    return (
      <div className="rounded-3xl border-2 border-blue-200/90 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 p-6 sm:p-7 shadow-xs space-y-4">
        {visual.title && (
          <div className="border-b border-blue-100 pb-3">
            <h4 className="text-base sm:text-lg font-black tracking-tight text-slate-950 uppercase flex items-center gap-2">
              <CheckCircle2 size={18} className="text-blue-600" />
              <span>{visual.title}</span>
            </h4>
            {visual.description && (
              <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-600">
                {visual.description}
              </p>
            )}
          </div>
        )}

        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={`${step}-${index}`}
              className="flex items-center gap-4 rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-xs hover:border-blue-300 transition"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xs font-black text-white shadow-xs">
                {index + 1}
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-950 leading-snug">
                {step}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /*
   * =========================================================================
   * 4. COMPARISON COLUMNS
   * =========================================================================
   */
  if (type === "comparison") {
    return (
      <div className="rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100/40 p-6 sm:p-7 shadow-xs space-y-4">
        {visual.title && (
          <div className="border-b border-slate-200 pb-3">
            <h4 className="text-base sm:text-lg font-black tracking-tight text-slate-950 uppercase">
              {visual.title}
            </h4>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {(visual.columns || []).map((column, index) => (
            <div
              key={`${column.title}-${index}`}
              className="rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-xs space-y-3"
            >
              <h5 className="font-black text-xs sm:text-sm uppercase tracking-wide text-slate-950 border-b border-slate-100 pb-2">
                {column.title}
              </h5>

              <ul className="space-y-2 text-xs sm:text-sm font-medium text-slate-700">
                {column.items.map((item, itemIndex) => (
                  <li key={`${item}-${itemIndex}`} className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /*
   * =========================================================================
   * 5. GENERIC NODE DIAGRAM
   * =========================================================================
   */
  return (
    <div className="rounded-3xl border-2 border-blue-200/90 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 p-6 sm:p-7 shadow-xs space-y-4">
      {visual.title && (
        <div className="border-b border-blue-100 pb-3">
          <h4 className="text-base sm:text-lg font-black tracking-tight text-slate-950 uppercase">
            {visual.title}
          </h4>
          {visual.description && (
            <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-600">
              {visual.description}
            </p>
          )}
        </div>
      )}

      <div className="space-y-3">
        {(visual.nodes || []).map((node, index) => (
          <div
            key={`${node.id || node.label}-${index}`}
            className="rounded-2xl border-2 border-blue-200 bg-white p-4 shadow-xs space-y-1"
          >
            <div className="font-black text-xs sm:text-sm text-slate-950">
              {node.label}
            </div>
            {node.description && (
              <div className="text-xs font-medium text-slate-600">
                {node.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}