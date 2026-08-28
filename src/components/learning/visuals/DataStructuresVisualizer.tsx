"use client";

import React, { useState } from "react";
import { Box, Layers, GitCommit, Network, FileCode2, Sparkles, ArrowRight, ArrowDown } from "lucide-react";
import {
  ArrayVisualData,
  StackQueueVisualData,
  LinkedListVisualData,
  TreeVisualData,
  ObjectClassVisualData,
} from "@/types/teaching-types";

interface DataStructuresVisualizerProps {
  arrayData?: ArrayVisualData;
  stackQueueData?: StackQueueVisualData;
  linkedListData?: LinkedListVisualData;
  treeData?: TreeVisualData;
  objectClassData?: ObjectClassVisualData;
}

export function DataStructuresVisualizer({
  arrayData,
  stackQueueData,
  linkedListData,
  treeData,
  objectClassData,
}: DataStructuresVisualizerProps) {
  const [selectedElement, setSelectedElement] = useState<number | string | null>(null);

  // 1. ARRAY VISUALIZER
  if (arrayData && arrayData.items && arrayData.items.length > 0) {
    return (
      <div className="rounded-2xl border-2 border-blue-300/80 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 p-4 text-white shadow-md space-y-3 animate-fade-in">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Box size={13} />
            </div>
            <div>
              <h4 className="text-xs font-black tracking-wide text-cyan-200 uppercase">
                Array / List: <span className="text-amber-300 font-mono">{arrayData.arrayName}</span>
              </h4>
              <p className="text-[10px] text-slate-400 font-mono">
                Contiguous memory slots • 0-indexed
              </p>
            </div>
          </div>
          {arrayData.operation && (
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-500/30">
              Op: {arrayData.operation.toUpperCase()}
            </span>
          )}
        </div>

        {/* Array Cells Grid */}
        <div className="flex flex-wrap items-center gap-2 py-2 overflow-x-auto custom-scrollbar">
          {arrayData.items.map((item, idx) => {
            const isHighlight = item.isHighlighted || arrayData.currentIndex === idx || selectedElement === idx;
            return (
              <div
                key={idx}
                onClick={() => setSelectedElement(idx)}
                className="flex flex-col items-center gap-1 cursor-pointer transition-transform hover:scale-105"
              >
                {/* Index label */}
                <span className="text-[9px] font-mono text-slate-400 font-bold">
                  [{item.index !== undefined ? item.index : idx}]
                </span>

                {/* Value Box */}
                <div
                  className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center font-mono font-bold text-sm shadow-md transition-all ${
                    isHighlight
                      ? "bg-blue-600 border-cyan-300 text-white shadow-blue-500/40 ring-2 ring-cyan-400"
                      : "bg-slate-800/90 border-slate-700 text-slate-200 hover:border-slate-500"
                  }`}
                >
                  {String(item.value)}
                </div>

                {item.annotation && (
                  <span className="text-[8px] text-amber-300 font-mono">{item.annotation}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. STACK & QUEUE VISUALIZER
  if (stackQueueData && stackQueueData.items) {
    const isStack = stackQueueData.type === "stack";

    return (
      <div className="rounded-2xl border-2 border-indigo-300/80 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-4 text-white shadow-md space-y-3 animate-fade-in">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
              <Layers size={13} />
            </div>
            <div>
              <h4 className="text-xs font-black tracking-wide text-indigo-200 uppercase">
                {isStack ? "Stack (LIFO)" : "Queue (FIFO)"}: {stackQueueData.name}
              </h4>
              <p className="text-[10px] text-slate-400 font-mono">
                {isStack ? "Last In, First Out" : "First In, First Out"}
              </p>
            </div>
          </div>
        </div>

        {/* Stack Vertical / Queue Horizontal Layout */}
        <div className={`p-3 rounded-xl bg-slate-900/60 border border-white/10 flex ${
          isStack ? "flex-col-reverse items-center gap-1.5 max-w-[200px] mx-auto" : "items-center gap-2 overflow-x-auto"
        }`}>
          {stackQueueData.items.map((item, idx) => {
            const isTop = isStack && idx === stackQueueData.items.length - 1;
            return (
              <div
                key={idx}
                className={`p-2 rounded-lg border font-mono text-xs font-bold text-center transition-all ${
                  isTop
                    ? "bg-indigo-600 border-indigo-300 text-white shadow-sm ring-1 ring-indigo-400 w-full"
                    : "bg-slate-800 border-slate-700 text-slate-200 w-full"
                }`}
              >
                <span>{String(item.value)}</span>
                {isTop && <span className="ml-2 text-[9px] text-amber-300 font-sans">← TOP</span>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 3. LINKED LIST VISUALIZER
  if (linkedListData && linkedListData.nodes && linkedListData.nodes.length > 0) {
    return (
      <div className="rounded-2xl border-2 border-emerald-300/80 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 p-4 text-white shadow-md space-y-3 animate-fade-in">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <GitCommit size={13} />
            </div>
            <div>
              <h4 className="text-xs font-black tracking-wide text-emerald-200 uppercase">
                {linkedListData.listType.toUpperCase()} Linked List
              </h4>
              <p className="text-[10px] text-slate-400 font-mono">
                Nodes with [ Data | Next Pointer ]
              </p>
            </div>
          </div>
        </div>

        {/* Nodes Chain */}
        <div className="flex flex-wrap items-center gap-2 py-2 overflow-x-auto custom-scrollbar">
          {linkedListData.nodes.map((node, idx) => (
            <div key={node.id || idx} className="flex items-center gap-1.5">
              <div className="rounded-xl border border-emerald-500/40 bg-slate-900/90 overflow-hidden font-mono text-xs shadow-md">
                <div className="flex items-center">
                  <div className="px-3 py-2 bg-emerald-950 text-emerald-300 font-bold border-r border-emerald-700/50">
                    {String(node.value)}
                  </div>
                  <div className="px-2 py-2 bg-slate-800 text-slate-400 text-[10px]">
                    next
                  </div>
                </div>
              </div>

              {idx < linkedListData.nodes.length - 1 ? (
                <span className="text-emerald-400 font-bold text-sm">→</span>
              ) : (
                <span className="text-rose-400 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-800/40">
                  NULL
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 4. OBJECT & CLASS VISUALIZER
  if (objectClassData) {
    return (
      <div className="rounded-2xl border-2 border-purple-300/80 bg-gradient-to-br from-slate-900 via-slate-950 to-purple-950 p-4 text-white shadow-md space-y-3 animate-fade-in">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <FileCode2 size={13} />
            </div>
            <div>
              <h4 className="text-xs font-black tracking-wide text-purple-200 uppercase">
                Class Blueprint vs Objects: <span className="text-amber-300 font-mono">{objectClassData.className}</span>
              </h4>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {/* Class Definition */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-purple-500/30 space-y-2 text-xs font-mono">
            <span className="text-[10px] font-black uppercase text-purple-300">
              Class Blueprint
            </span>
            <div className="space-y-1 text-[11px]">
              <div className="text-slate-400 font-bold">Fields:</div>
              {objectClassData.fields?.map((f, i) => (
                <div key={i} className="pl-2 text-slate-300">
                  {f.type} <span className="text-cyan-300">{f.name}</span>
                </div>
              ))}
              <div className="text-slate-400 font-bold pt-1">Methods:</div>
              {objectClassData.methods?.map((m, i) => (
                <div key={i} className="pl-2 text-amber-300">
                  {m.signature}
                </div>
              ))}
            </div>
          </div>

          {/* Instances */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 space-y-2 text-xs font-mono">
            <span className="text-[10px] font-black uppercase text-emerald-400">
              Instantiated Objects
            </span>
            {objectClassData.instances && objectClassData.instances.length > 0 ? (
              objectClassData.instances.map((inst, i) => (
                <div key={i} className="p-2 rounded bg-slate-800/80 border border-slate-700 space-y-1">
                  <div className="flex items-center justify-between text-cyan-300 font-bold">
                    <span>{inst.objectName}</span>
                    {inst.memoryAddress && (
                      <span className="text-[9px] text-slate-400 font-normal">{inst.memoryAddress}</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-300 grid grid-cols-2 gap-1">
                    {Object.entries(inst.fieldValues || {}).map(([k, v]) => (
                      <div key={k}>
                        <span className="text-slate-400">{k}:</span>{" "}
                        <span className="text-amber-300">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-[10px] text-slate-500">No objects instantiated yet.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
