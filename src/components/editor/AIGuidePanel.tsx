"use client";

import {
    Brain,
    X,
    Lightbulb,
    ArrowRight,
} from "lucide-react";

import { useEditorTheme } from "./EditorTheme";
import { useTabs } from "./tabs/TabContext";

interface Props {
    onClose: () => void;
}

export default function AIGuidePanel({
    onClose,
}: Props) {
    const { darkMode } = useEditorTheme();
    const { activeTab } = useTabs();

    return (
        <div
            className={`w-[360px] h-full shrink-0 border-l flex flex-col ${
                darkMode
                    ? "bg-[#11131B] border-white/10 text-white"
                    : "bg-white border-gray-300 text-gray-900"
            }`}
        >

            {/* Header */}

            <div
                className={`h-14 shrink-0 flex items-center justify-between px-5 border-b ${
                    darkMode
                        ? "border-white/10"
                        : "border-gray-200"
                }`}
            >

                <div className="flex items-center gap-3">

                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                        <Brain size={18} />
                    </div>

                    <div>

                        <div className="font-semibold">
                            AI Guide
                        </div>

                        <div
                            className={`text-xs ${
                                darkMode
                                    ? "text-slate-400"
                                    : "text-gray-500"
                            }`}
                        >
                            Your coding mentor
                        </div>

                    </div>

                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        darkMode
                            ? "hover:bg-white/10 text-slate-400"
                            : "hover:bg-gray-100 text-gray-500"
                    }`}
                >
                    <X size={18} />
                </button>

            </div>

            {/* Content */}

            <div className="flex-1 overflow-y-auto p-5 space-y-5">

                {/* Current File */}

                <div
                    className={`rounded-xl p-4 border ${
                        darkMode
                            ? "bg-[#1A1D26] border-white/10"
                            : "bg-gray-50 border-gray-200"
                    }`}
                >

                    <div
                        className={`text-xs uppercase tracking-wide mb-2 ${
                            darkMode
                                ? "text-slate-400"
                                : "text-gray-500"
                        }`}
                    >
                        Current File
                    </div>

                    <div className="font-medium">
                        {activeTab?.name ||
                            "No file open"}
                    </div>

                </div>

                {/* Mentor */}

                <div className="flex gap-3">

                    <div className="w-9 h-9 shrink-0 rounded-full bg-cyan-500 flex items-center justify-center text-white">
                        <Brain size={17} />
                    </div>

                    <div
                        className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                            darkMode
                                ? "bg-[#1A1D26] text-slate-300"
                                : "bg-gray-100 text-gray-700"
                        }`}
                    >
                        <p className="font-semibold mb-2">
                            Let's build this together.
                        </p>

                        <p>
                            I'll look at your current
                            code and guide you through
                            the next step instead of
                            simply giving you the answer.
                        </p>
                    </div>

                </div>

                {/* Hint */}

                <div
                    className={`rounded-xl border p-4 ${
                        darkMode
                            ? "bg-cyan-500/5 border-cyan-500/20"
                            : "bg-cyan-50 border-cyan-200"
                    }`}
                >

                    <div className="flex items-center gap-2 mb-2">

                        <Lightbulb
                            size={17}
                            className="text-cyan-500"
                        />

                        <span className="font-semibold text-sm">
                            Hint
                        </span>

                    </div>

                    <p
                        className={`text-sm leading-6 ${
                            darkMode
                                ? "text-slate-300"
                                : "text-gray-600"
                        }`}
                    >
                        Open a coding task and I'll
                        help you understand what to
                        work on next.
                    </p>

                </div>

            </div>

            {/* Footer */}

            <div
                className={`p-4 border-t ${
                    darkMode
                        ? "border-white/10"
                        : "border-gray-200"
                }`}
            >

                <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:scale-[1.02] transition"
                >
                    <ArrowRight size={17} />

                    Get Next Step
                </button>

            </div>

        </div>
    );
}