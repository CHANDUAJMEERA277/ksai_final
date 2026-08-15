"use client";

import RunButton from "./RunButton";
import ExplainButton from "./ExplainButton";

import {
    Brain,
    Mic,
    Wand2,
    MonitorSmartphone,
} from "lucide-react";

import { useEditorTheme } from "./EditorTheme";
import { useTabs } from "./tabs/TabContext";
import { useAIResult } from "./AIResultContext";

const buttons = [
    {
        title: "Dictator",
        icon: Mic,
        color: "from-purple-500 to-pink-600",
    },
    {
        title: "Auto Code",
        icon: Wand2,
        color: "from-blue-500 to-indigo-600",
    },
    {
        title: "Run",
        color: "from-green-500 to-emerald-600",
    },
    {
        title: "Screen Mentor",
        icon: MonitorSmartphone,
        color: "from-orange-500 to-red-500",
    },
];

export default function BottomDock() {

    const { darkMode } =
        useEditorTheme();

    const {
        activeTab,
        diagnosticsByTab,
    } = useTabs();

    const {
        setResult,
        setLoading,
        setMode,
    } = useAIResult();

    async function handleAIGuide() {

        if (!activeTab) {

            setMode("guide");

            setResult(
                "Please open a code file before using AI Guide."
            );

            return;
        }

        const diagnostics =
            diagnosticsByTab[
                activeTab.id
            ] ?? [];

        setMode("guide");
        setLoading(true);
        setResult("");

        try {

            const response =
                await fetch(
                    "/api/ai/guide",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            language:
                                activeTab.language,

                            code:
                                activeTab.content,

                            errors:
                                diagnostics,
                        }),
                    }
                );

            if (!response.ok) {

                throw new Error(
                    `Guide request failed: ${response.status}`
                );
            }

            const data =
                await response.json();

            const guideResponse =
                data?.data?.response ??
                data?.response ??
                "";

            if (!guideResponse) {

                throw new Error(
                    "AI Guide returned an empty response."
                );
            }

            setResult(
                guideResponse
            );

        } catch (error) {

            console.error(
                "AI Guide Error:",
                error
            );

            setResult(
                "⚠️ Codenthra AI Guide could not process your code. Please try again."
            );

        } finally {

            setLoading(false);
        }
    }

    function handleDictator() {

    console.log("Dictator button clicked");

    setMode("dictator");

    setLoading(false);

    setResult("");
}

    function handleAutoCode() {

    console.log("Auto Code button clicked");

    setMode("autocode");
    setLoading(false);
    setResult("");
}

    return (
        <div
            className={`h-20 border-t backdrop-blur-xl flex items-center justify-center gap-4 px-6 transition-all duration-300 ${
                darkMode
                    ? "bg-[#0B0D14] border-white/10"
                    : "bg-white border-gray-300 shadow-md"
            }`}
        >

            {/* ========================= */}
            {/* AI GUIDE */}
            {/* ========================= */}

            <button
                type="button"
                onClick={handleAIGuide}
                className="group flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600
                hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-white"
            >

                <Brain size={20} />

                <span className="font-semibold text-sm">
                    AI Guide
                </span>

            </button>


            {/* ========================= */}
            {/* EXPLAIN */}
            {/* ========================= */}

            <ExplainButton />


            {/* ========================= */}
            {/* OTHER BUTTONS */}
            {/* ========================= */}

            {buttons.map((button) => {

                {/* RUN */}

                if (button.title === "Run") {

                    return (
                        <RunButton
                            key="run"
                        />
                    );
                }

                const Icon =
                    button.icon;

                return (
    <button
        key={button.title}
        type="button"
        onClick={
            button.title === "Dictator"
                ? handleDictator
                : button.title === "Auto Code"
                    ? handleAutoCode
                    : undefined
        }
        className={`group flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r ${button.color}
        hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-white`}
    >

        {Icon && (
            <Icon size={20} />
        )}

        <span className="font-semibold text-sm">
            {button.title}
        </span>

    </button>
);
            })}

        </div>
    );
}