"use client";

import TerminalHeader from "./TerminalHeader";
import XTermTabs from "./XTermTabs";
import XTermInstance from "./XTermInstance";
import { useTerminal } from "./TerminalContext";
import { useEditor } from "../EditorContext";
import { useEditorTheme } from "../EditorTheme";

import {
    AlertCircle,
    AlertTriangle,
    Trash2,
} from "lucide-react";

interface Props {
    onClose: () => void;
}

export default function TerminalPanel({
    onClose,
}: Props) {

    const {
        activePanel,
        output,
    } = useTerminal();

    const {
        diagnostics,
        editor,
        setDiagnostics,
    } = useEditor();

    const { darkMode } = useEditorTheme();

    const errorCount =
        diagnostics.filter(
            (item) =>
                item.severity === "error"
        ).length;

    const warningCount =
        diagnostics.filter(
            (item) =>
                item.severity === "warning"
        ).length;

    function jumpToDiagnostic(
        line: number,
        column: number
    ) {

        if (!editor) return;

        editor.setPosition({
            lineNumber: line,
            column: column,
        });

        editor.revealLineInCenter(
            line
        );

        editor.focus();
    }

    function clearProblems() {

        if (!editor) {
            setDiagnostics([]);
            return;
        }

        const model =
            editor.getModel();

        if (!model) {
            setDiagnostics([]);
            return;
        }

        import("monaco-editor").then(
            (monaco) => {

                monaco.editor.setModelMarkers(
                    model,
                    "KnowledgeStream",
                    []
                );

                setDiagnostics([]);
            }
        );
    }

    return (
        <div
            className={`h-[230px] flex flex-col border-t ${
                darkMode
                    ? "border-white/10 bg-[#0F1117] text-white"
                    : "border-gray-300 bg-white text-gray-900"
            }`}
        >

            <TerminalHeader
                onClose={onClose}
            />

            <XTermTabs />

            <div className="flex-1 overflow-y-auto overflow-x-hidden">

                {/* TERMINAL */}

                {activePanel === "terminal" && (
                    <XTermInstance />
                )}

                {/* OUTPUT */}

                {activePanel === "output" && (

                    <div
                        className={`h-full overflow-auto p-5 ${
                            darkMode
                                ? "bg-[#0F1117]"
                                : "bg-white"
                        }`}
                    >

                        <pre
                            className={`whitespace-pre-wrap font-mono text-sm ${
                                darkMode
                                    ? "text-slate-300"
                                    : "text-gray-700"
                            }`}
                        >
                            {output ||
                                "No output yet."}
                        </pre>

                    </div>

                )}

                {/* PROBLEMS */}

                {activePanel === "problems" && (

                    <div className="h-full flex flex-col">

                        {/* Problems Header */}

                        <div
                            className={`h-10 shrink-0 flex items-center justify-between px-4 border-b ${
                                darkMode
                                    ? "border-white/10"
                                    : "border-gray-200"
                            }`}
                        >

                            <div className="flex items-center gap-3">

                                <span className="text-sm font-semibold">
                                    Problems
                                </span>

                                {errorCount > 0 && (

                                    <span className="flex items-center gap-1 text-xs text-red-500">

                                        <AlertCircle
                                            size={14}
                                        />

                                        {errorCount}

                                    </span>

                                )}

                                {warningCount > 0 && (

                                    <span className="flex items-center gap-1 text-xs text-yellow-500">

                                        <AlertTriangle
                                            size={14}
                                        />

                                        {warningCount}

                                    </span>

                                )}

                            </div>

                            {diagnostics.length > 0 && (

                                <button
                                    type="button"
                                    onClick={
                                        clearProblems
                                    }
                                    title="Clear problems"
                                    className={`w-7 h-7 rounded-md flex items-center justify-center transition ${
                                        darkMode
                                            ? "text-slate-400 hover:bg-white/10 hover:text-white"
                                            : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                    }`}
                                >

                                    <Trash2
                                        size={15}
                                    />

                                </button>

                            )}

                        </div>

                        {/* Problems List */}

                        <div className="flex-1 overflow-y-auto">

                            {diagnostics.length === 0 ? (

                                <div className="h-full flex items-center justify-center">

                                    <div className="flex flex-col items-center gap-2">

                                        <AlertCircle
                                            size={24}
                                            className="text-green-500"
                                        />

                                        <span
                                            className={`text-sm ${
                                                darkMode
                                                    ? "text-slate-400"
                                                    : "text-gray-500"
                                            }`}
                                        >
                                            No problems detected.
                                        </span>

                                    </div>

                                </div>

                            ) : (

                                <div>

                                    {diagnostics.map(
                                        (
                                            error,
                                            index
                                        ) => {

                                            const isWarning =
                                                error.severity ===
                                                "warning";

                                            return (

                                                <button
                                                    key={`${error.file}-${error.line}-${error.column}-${index}`}
                                                    type="button"
                                                    onClick={() =>
                                                        jumpToDiagnostic(
                                                            error.line,
                                                            error.column
                                                        )
                                                    }
                                                    className={`w-full text-left px-4 py-3 border-b transition ${
                                                        darkMode
                                                            ? "border-white/5 hover:bg-white/5"
                                                            : "border-gray-100 hover:bg-gray-50"
                                                    }`}
                                                >

                                                    <div className="flex items-start gap-3">

                                                        {/* Icon */}

                                                        <div className="pt-0.5">

                                                            {isWarning ? (

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

                                                        {/* Information */}

                                                        <div className="min-w-0 flex-1">

                                                            <div className="flex items-center gap-2">

                                                                <span
                                                                    className={`text-xs font-semibold ${
                                                                        isWarning
                                                                            ? "text-yellow-500"
                                                                            : "text-red-500"
                                                                    }`}
                                                                >
                                                                    Line{" "}
                                                                    {
                                                                        error.line
                                                                    }
                                                                </span>

                                                                <span
                                                                    className={`text-xs ${
                                                                        darkMode
                                                                            ? "text-slate-500"
                                                                            : "text-gray-400"
                                                                    }`}
                                                                >
                                                                    Column{" "}
                                                                    {
                                                                        error.column
                                                                    }
                                                                </span>

                                                            </div>

                                                            <p
                                                                className={`text-sm mt-1 ${
                                                                    darkMode
                                                                        ? "text-slate-200"
                                                                        : "text-gray-700"
                                                                }`}
                                                            >
                                                                {
                                                                    error.message
                                                                }
                                                            </p>

                                                            <p
                                                                className={`text-xs mt-1 truncate ${
                                                                    darkMode
                                                                        ? "text-slate-500"
                                                                        : "text-gray-400"
                                                                }`}
                                                            >
                                                                {
                                                                    error.file
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>

                                                </button>

                                            );
                                        }
                                    )}

                                </div>

                            )}

                        </div>

                    </div>

                )}

            </div>

        </div>
    );
}