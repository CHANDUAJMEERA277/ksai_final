"use client";

import {
    AlertCircle,
    AlertTriangle,
    X,
} from "lucide-react";

import { useEditorTheme } from "./EditorTheme";
import { useEditor } from "./EditorContext";

export default function ProblemsPanel() {
    const { darkMode } = useEditorTheme();
    const { diagnostics, editor } = useEditor();

    function jumpToError(
        line: number,
        column: number
    ) {
        if (!editor) return;

        editor.revealLineInCenter(line);

        editor.setPosition({
            lineNumber: line,
            column: column,
        });

        editor.focus();
    }

    function clearProblems() {
        if (!editor) return;

        const model = editor.getModel();

        if (!model) return;

        // Clear Monaco red markers.
        import("monaco-editor").then((monaco) => {
            monaco.editor.setModelMarkers(
                model,
                "KnowledgeStream",
                []
            );
        });
    }

    return (
        <div
            className={`flex flex-col h-full border-t ${
                darkMode
                    ? "bg-[#11131B] border-white/10 text-white"
                    : "bg-white border-gray-300 text-gray-900"
            }`}
        >

            {/* Header */}

            <div
                className={`h-10 shrink-0 flex items-center justify-between px-4 border-b ${
                    darkMode
                        ? "border-white/10"
                        : "border-gray-300"
                }`}
            >

                <div className="flex items-center gap-2">

                    <AlertCircle
                        size={16}
                        className={
                            diagnostics.length > 0
                                ? "text-red-500"
                                : "text-gray-500"
                        }
                    />

                    <span className="text-sm font-semibold">
                        Problems
                    </span>

                    {diagnostics.length > 0 && (
                        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                            {diagnostics.length}
                        </span>
                    )}

                </div>

                {diagnostics.length > 0 && (
                    <button
                        type="button"
                        onClick={clearProblems}
                        title="Clear problems"
                        className={`w-7 h-7 rounded-md flex items-center justify-center ${
                            darkMode
                                ? "hover:bg-white/10"
                                : "hover:bg-gray-100"
                        }`}
                    >
                        <X size={15} />
                    </button>
                )}

            </div>

            {/* Problems */}

            <div className="flex-1 overflow-y-auto">

                {diagnostics.length === 0 ? (

                    <div className="h-full flex items-center justify-center">

                        <div className="text-center">

                            <div className="flex justify-center mb-2">

                                <AlertCircle
                                    size={24}
                                    className="text-green-500"
                                />

                            </div>

                            <p
                                className={`text-sm ${
                                    darkMode
                                        ? "text-slate-400"
                                        : "text-gray-500"
                                }`}
                            >
                                No problems detected
                            </p>

                        </div>

                    </div>

                ) : (

                    <div className="py-1">

                        {diagnostics.map(
                            (error, index) => (

                                <button
                                    key={`${error.file}-${error.line}-${error.column}-${index}`}
                                    type="button"
                                    onClick={() =>
                                        jumpToError(
                                            error.line,
                                            error.column
                                        )
                                    }
                                    className={`w-full text-left px-4 py-2 flex items-start gap-3 transition ${
                                        darkMode
                                            ? "hover:bg-white/5"
                                            : "hover:bg-gray-100"
                                    }`}
                                >

                                    {/* Icon */}

                                    <div className="pt-0.5">

                                        {error.severity ===
                                        "warning" ? (
                                            <AlertTriangle
                                                size={16}
                                                className="text-yellow-500"
                                            />
                                        ) : (
                                            <AlertCircle
                                                size={16}
                                                className="text-red-500"
                                            />
                                        )}

                                    </div>

                                    {/* Error information */}

                                    <div className="min-w-0 flex-1">

                                        <div className="flex items-center gap-2">

                                            <span
                                                className={`text-xs font-semibold ${
                                                    error.severity ===
                                                    "warning"
                                                        ? "text-yellow-500"
                                                        : "text-red-500"
                                                }`}
                                            >
                                                Line {error.line}
                                            </span>

                                            <span
                                                className={`text-xs ${
                                                    darkMode
                                                        ? "text-slate-500"
                                                        : "text-gray-400"
                                                }`}
                                            >
                                                Column {error.column}
                                            </span>

                                        </div>

                                        <p
                                            className={`text-sm mt-0.5 truncate ${
                                                darkMode
                                                    ? "text-slate-300"
                                                    : "text-gray-700"
                                            }`}
                                        >
                                            {error.message}
                                        </p>

                                        <p
                                            className={`text-xs mt-1 truncate ${
                                                darkMode
                                                    ? "text-slate-500"
                                                    : "text-gray-400"
                                            }`}
                                        >
                                            {error.file}
                                        </p>

                                    </div>

                                </button>

                            )
                        )}

                    </div>

                )}

            </div>

        </div>
    );
}