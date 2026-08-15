"use client";

import {
    Sparkles,
    Copy,
    RotateCcw,
    Download,
    CheckCircle2,
    Mic,
    VolumeX,
    Check,
} from "lucide-react";

import { useState } from "react";
import { useTabs } from "./tabs/TabContext";
import { useEditorTheme } from "./EditorTheme";
import { useAIResult } from "./AIResultContext";

import {
    createDictatorPlan,
    type DictatorStep,
} from "./dictator/DictatorPlanner";

export default function AIResultPanel() {

    const { darkMode } = useEditorTheme();

    const {
    result,
    loading,
    mode,

    // General setters
    setResult,
    setMode,

    // Dictator state
    dictatorActive,
    dictatorProject,
    dictatorStep,
    dictatorTotalSteps,

    // Dictator setters
    setDictatorActive,
    setDictatorProject,
    setDictatorStep,
    setDictatorTotalSteps,

} = useAIResult();


    const [speaking, setSpeaking] = useState(false);
    const [copied, setCopied] = useState(false);
    
    const {
    activeTab,
    updateTabContent,
} = useTabs();

const [dictatorInput, setDictatorInput] =
    useState("");

const [dictatorLevel, setDictatorLevel] =
    useState("beginner");

    const [dictatorPlan, setDictatorPlan] =
    useState<DictatorStep[]>([]);

    // =========================
// Auto Code State
// =========================

const [autoCodeInput, setAutoCodeInput] =
    useState("");

const [autoCodeGenerating, setAutoCodeGenerating] =
    useState(false);

    /*
     * Speak AI explanation
     */
    function speakResult() {

        if (!result) return;

        // Stop existing speech first
        window.speechSynthesis.cancel();

        const speech =
            new SpeechSynthesisUtterance(result);

        speech.rate = 0.95;
        speech.pitch = 1;
        speech.volume = 1;

        speech.onstart = () => {
            setSpeaking(true);
        };

        speech.onend = () => {
            setSpeaking(false);
        };

        speech.onerror = () => {
            setSpeaking(false);
        };

        window.speechSynthesis.speak(speech);
    }

    /*
     * Stop speech
     */
    function stopSpeaking() {

        window.speechSynthesis.cancel();

        setSpeaking(false);
    }

    /*
     * Copy AI result
     */
    async function copyResult() {

        if (!result) return;

        await navigator.clipboard.writeText(result);

        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 2000);
    }

    /*
     * Download AI result
     */
    function downloadResult() {

        if (!result) return;

        const blob = new Blob(
            [result],
            {
                type: "text/plain",
            }
        );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            "CodeXAI-Explanation.txt";

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }

    /*
     * Regenerate
     *
     * Actual regeneration can be connected
     * to ExplainButton/API later.
     */
    function regenerate() {

        window.dispatchEvent(
            new CustomEvent("codexai-regenerate")
        );
    }

   function startDictator() {

    const project =
        dictatorInput.trim()
        || activeTab?.name
        || "Current Program";

    const language =
        activeTab?.language || "java";

    const plan =
        createDictatorPlan(
            project,
            language,
            dictatorLevel
        );

    if (plan.length === 0) {

        setMode("dictator");

        setDictatorActive(false);

        return;
    }

    setDictatorPlan(plan);

    setDictatorProject(project);

    setDictatorStep(1);

    setDictatorTotalSteps(
        plan.length
    );

    setDictatorActive(true);

    setMode("dictator");

    console.log(
        "Starting Dictator:",
        {
            project,
            language,
            level: dictatorLevel,
            steps: plan,
        }
    );
}


async function generateAutoCode() {

    const project =
        autoCodeInput.trim();

    if (!project) {
        setResult(
            "Please enter what you want to build."
        );
        return;
    }

    const language =
        activeTab?.language || "java";

    setAutoCodeGenerating(true);
    setMode("autocode");
    setResult("");

    try {

        const response =
            await fetch(
                "/api/ai/autocode/",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        language,
                        project,
                    }),
                }
            );

        if (!response.ok) {

            throw new Error(
                `Auto Code request failed: ${response.status}`
            );
        }

        const data =
            await response.json();

        console.log(
            "CodeXAI Auto Code Response:",
            data
        );

        const aiResponse =
            data?.data?.response ??
            data?.response ??
            data?.data ??
            null;

        if (!aiResponse) {

            throw new Error(
                "Auto Code returned an empty response."
            );
        }

        /*
         * Backend may return JSON as an object
         * or JSON encoded inside a string.
         */

        let generated;

        if (
            typeof aiResponse === "string"
        ) {

            try {

                generated =
                    JSON.parse(aiResponse);

            } catch {

                throw new Error(
                    "Auto Code returned invalid JSON."
                );
            }

        } else {

            generated = aiResponse;
        }

        const generatedCode =
            generated?.code ?? "";

        const explanation =
            generated?.explanation ?? "";

        if (!generatedCode) {

            throw new Error(
                "Generated code was empty."
            );
        }

        /*
         * Put generated code into the
         * currently selected editor tab.
         */

        if (activeTab) {

            updateTabContent(
                activeTab.id,
                generatedCode
            );
        }

        /*
         * Show teacher-style explanation
         * in the AI panel.
         */

        setResult(
            explanation ||
            "CodeXAI generated the program successfully."
        );

    } catch (error) {

        console.error(
            "Auto Code Error:",
            error
        );

        setResult(
            "⚠️ CodeXAI could not generate the code. Please try again."
        );

    } finally {

        setAutoCodeGenerating(false);
    }
}

const currentDictatorStep =
    dictatorPlan.find(
        (step) =>
            step.step === dictatorStep
    );

    return (

        <div
            className={`
    h-1/2
    min-h-0
    flex-shrink-0
    overflow-hidden
    flex
    flex-col
    border-b
    transition-all
    duration-300
    ${darkMode
      ? "bg-[#11131B] border-white/10"
      : "bg-white border-gray-300"
    }
`}
        >

            {/* =========================
                HEADER
            ========================== */}

            <div
                className={`
                    h-12
                    min-h-12
                    flex
                    items-center
                    justify-between
                    px-5
                    border-b
                    ${
                        darkMode
                            ? "border-white/10"
                            : "border-gray-300"
                    }
                `}
            >

                {/* Title */}

                <div className="flex items-center gap-2">

                    <Sparkles
                        size={18}
                        className="text-cyan-500"
                    />

                    <span
    className={`
        font-semibold
        ${
            darkMode
                ? "text-white"
                : "text-gray-900"
        }
    `}
>
    {mode === "guide"
    ? "Codenthra AI Guide"
    : mode === "dictator"
        ? "Codenthra AI Dictator"
        : mode === "autocode"
            ? "Codenthra AI Auto Code"
            : mode === "error"
                ? "Codenthra AI Error Analysis"
                : "Codenthra AI Explanation"}
</span>

                </div>


                {/* Controls */}

                <div className="flex items-center gap-2">

                    {/* Mic */}

                    <button
                        onClick={
                            speaking
                                ? stopSpeaking
                                : speakResult
                        }
                        disabled={
                            !result || loading
                        }
                        title={
                            speaking
                                ? "Stop speaking"
                                : "Read explanation aloud"
                        }
                        className={`
                            w-8
                            h-8
                            rounded-lg
                            flex
                            items-center
                            justify-center
                            transition
                            ${
                                speaking
                                    ? "bg-red-500/15 text-red-500"
                                    : darkMode
                                        ? "hover:bg-white/5 text-slate-300"
                                        : "hover:bg-gray-100 text-gray-700"
                            }
                            disabled:opacity-40
                            disabled:cursor-not-allowed
                        `}
                    >

                        {speaking ? (
                            <VolumeX size={16} />
                        ) : (
                            <Mic size={16} />
                        )}

                    </button>


                    {/* Copy */}

                    <button
                        onClick={copyResult}
                        disabled={
                            !result || loading
                        }
                        title="Copy explanation"
                        className={`
                            w-8
                            h-8
                            rounded-lg
                            flex
                            items-center
                            justify-center
                            transition
                            ${
                                darkMode
                                    ? "hover:bg-white/5"
                                    : "hover:bg-gray-100"
                            }
                            disabled:opacity-40
                            disabled:cursor-not-allowed
                        `}
                    >

                        {copied ? (
                            <Check
                                size={15}
                                className="text-green-500"
                            />
                        ) : (
                            <Copy size={15} />
                        )}

                    </button>


                    {/* Regenerate */}

                    <button
                        onClick={regenerate}
                        disabled={
                            loading
                        }
                        title="Regenerate explanation"
                        className={`
                            w-8
                            h-8
                            rounded-lg
                            flex
                            items-center
                            justify-center
                            transition
                            ${
                                darkMode
                                    ? "hover:bg-white/5"
                                    : "hover:bg-gray-100"
                            }
                            disabled:opacity-40
                        `}
                    >

                        <RotateCcw size={15} />

                    </button>


                    {/* Download */}

                    <button
                        onClick={downloadResult}
                        disabled={
                            !result || loading
                        }
                        title="Download explanation"
                        className={`
                            w-8
                            h-8
                            rounded-lg
                            flex
                            items-center
                            justify-center
                            transition
                            ${
                                darkMode
                                    ? "hover:bg-white/5"
                                    : "hover:bg-gray-100"
                            }
                            disabled:opacity-40
                        `}
                    >

                        <Download size={15} />

                    </button>

                </div>

            </div>


            {/* =========================
                SCROLLABLE CONTENT
            ========================== */}

            <div
                className="
                    flex-1
                    min-h-0
                    overflow-y-auto
                    overflow-x-hidden
                    p-5
                "
            >

                <div className="space-y-5 max-w-none">

                    {/* Loading */}

                    {loading && (

                        <div
                            className={`
                                rounded-2xl
                                border
                                p-6
                                ${
                                    darkMode
                                        ? "bg-[#181B23] border-white/10"
                                        : "bg-gray-50 border-gray-300"
                                }
                            `}
                        >

                            <div className="flex items-center gap-3">

                                <Sparkles
                                    size={18}
                                    className="
                                        text-cyan-500
                                        animate-pulse
                                    "
                                />

                                <span
                                    className={
                                        darkMode
                                            ? "text-slate-300"
                                            : "text-gray-700"
                                    }
                                >
                                    CodeXAI is analyzing your code...
                                </span>

                            </div>

                        </div>

                    )}


                    {/* AI Result */}

                    {!loading && result && (

                        <div
                            className={`
                                rounded-2xl
                                border
                                p-5
                                ${
                                    darkMode
                                        ? "bg-[#181B23] border-white/10"
                                        : "bg-gray-50 border-gray-300"
                                }
                            `}
                        >

                            {/* Status */}

                            <div className="flex items-center gap-2 mb-5">

                                <CheckCircle2
                                    size={18}
                                    className="text-green-500"
                                />

                                <span className="font-semibold text-green-600">
 
                                </span>

                            </div>


                            {/* Explanation */}

                            <div
                                className={`
                                    whitespace-pre-wrap
                                    break-words
                                    leading-7
                                    text-sm
                                    ${
                                        darkMode
                                            ? "text-slate-300"
                                            : "text-gray-700"
                                    }
                                `}
                            >
                                {result}
                            </div>

                        </div>

                    )}


                    {/* =========================
    AUTO CODE SETUP
========================= */}

{!loading && mode === "autocode" && (

    <div
        className={`
            rounded-2xl
            border
            p-6
            ${
                darkMode
                    ? "bg-[#181B23] border-white/10"
                    : "bg-gray-50 border-gray-300"
            }
        `}
    >

        {/* Header */}

        <div className="flex items-center gap-3 mb-6">

            <div
                className="
                    w-10
                    h-10
                    rounded-xl
                    bg-gradient-to-r
                    from-blue-500
                    to-indigo-600
                    flex
                    items-center
                    justify-center
                    text-white
                "
            >
                <Sparkles size={20} />
            </div>

            <div>

                <h3
                    className={`font-semibold ${
                        darkMode
                            ? "text-white"
                            : "text-gray-900"
                    }`}
                >
                    CodeXAI Auto Code
                </h3>

                <p
                    className={`text-xs ${
                        darkMode
                            ? "text-slate-400"
                            : "text-gray-500"
                    }`}
                >
                    Describe what you want to build and CodeXAI will generate it.
                </p>

            </div>

        </div>


        {/* Project */}

        <label
            className={`block text-sm font-medium mb-2 ${
                darkMode
                    ? "text-slate-300"
                    : "text-gray-700"
            }`}
        >
            What do you want to build?
        </label>


        <input
            value={autoCodeInput}
            onChange={(event) =>
                setAutoCodeInput(
                    event.target.value
                )
            }
            onKeyDown={(event) => {

                if (
                    event.key === "Enter" &&
                    !autoCodeGenerating
                ) {
                    generateAutoCode();
                }

            }}
            placeholder="Example: Hello World"
            disabled={autoCodeGenerating}
            className={`
                w-full
                rounded-xl
                px-4
                py-3
                outline-none
                border
                mb-5
                ${
                    darkMode
                        ? "bg-[#11131B] border-white/10 text-white placeholder:text-slate-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                }
                disabled:opacity-50
            `}
        />


        {/* Language */}

        <label
            className={`block text-sm font-medium mb-2 ${
                darkMode
                    ? "text-slate-300"
                    : "text-gray-700"
            }`}
        >
            Programming language
        </label>


        <div
            className={`
                rounded-xl
                px-4
                py-3
                border
                text-sm
                mb-6
                ${
                    darkMode
                        ? "bg-[#11131B] border-white/10 text-slate-300"
                        : "bg-white border-gray-300 text-gray-700"
                }
            `}
        >
            {activeTab?.language || "java"}
        </div>


        {/* Generate */}

        <button
            type="button"
            onClick={generateAutoCode}
            disabled={
                autoCodeGenerating ||
                !autoCodeInput.trim()
            }
            className="
                w-full
                py-3
                rounded-xl
                bg-gradient-to-r
                from-blue-500
                to-indigo-600
                hover:opacity-90
                transition
                text-white
                font-semibold
                disabled:opacity-50
                disabled:cursor-not-allowed
            "
        >

            {autoCodeGenerating ? (
                <span className="flex items-center justify-center gap-2">

                    <Sparkles
                        size={18}
                        className="animate-pulse"
                    />

                    Generating Code...

                </span>
            ) : (
                <span className="flex items-center justify-center gap-2">

                    <Sparkles size={18} />

                    Generate Code

                </span>
            )}

        </button>

    </div>
)}




                    {/* =========================
    DICTATOR SETUP
========================= */}

{!loading && mode === "dictator" && !dictatorActive && (

    <div
        className={`
            rounded-2xl
            border
            p-6
            ${
                darkMode
                    ? "bg-[#181B23] border-white/10"
                    : "bg-gray-50 border-gray-300"
            }
        `}
    >

        {/* Header */}

        <div className="flex items-center gap-3 mb-6">

            <div
                className="
                    w-10
                    h-10
                    rounded-xl
                    bg-gradient-to-r
                    from-purple-500
                    to-pink-600
                    flex
                    items-center
                    justify-center
                    text-white
                "
            >
                <Mic size={20} />
            </div>

            <div>

                <h3
                    className={`font-semibold ${
                        darkMode
                            ? "text-white"
                            : "text-gray-900"
                    }`}
                >
                    Start Dictator
                </h3>

                <p
                    className={`text-xs ${
                        darkMode
                            ? "text-slate-400"
                            : "text-gray-500"
                    }`}
                >
                    Build your program step by step with CodeXAI.
                </p>

            </div>

        </div>


        {/* Program */}

        <label
            className={`block text-sm font-medium mb-2 ${
                darkMode
                    ? "text-slate-300"
                    : "text-gray-700"
            }`}
        >
            What do you want to build?
        </label>

        <input
            value={dictatorInput}
            onChange={(event) =>
                setDictatorInput(event.target.value)
            }
            placeholder="Example: Java Calculator"
            className={`
                w-full
                rounded-xl
                px-4
                py-3
                outline-none
                border
                mb-5
                ${
                    darkMode
                        ? "bg-[#11131B] border-white/10 text-white placeholder:text-slate-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                }
            `}
        />


        {/* Current File */}

        <label
            className={`block text-sm font-medium mb-2 ${
                darkMode
                    ? "text-slate-300"
                    : "text-gray-700"
            }`}
        >
            Current file
        </label>

        <div
            className={`
                rounded-xl
                px-4
                py-3
                border
                text-sm
                mb-5
                ${
                    darkMode
                        ? "bg-[#11131B] border-white/10 text-slate-300"
                        : "bg-white border-gray-300 text-gray-700"
                }
            `}
        >
            {activeTab?.name || "No file selected"}
        </div>


        {/* Learning Level */}

        <label
            className={`block text-sm font-medium mb-2 ${
                darkMode
                    ? "text-slate-300"
                    : "text-gray-700"
            }`}
        >
            Learning level
        </label>

        <select
            value={dictatorLevel}
            onChange={(event) =>
                setDictatorLevel(event.target.value)
            }
            className={`
                w-full
                rounded-xl
                px-4
                py-3
                outline-none
                border
                mb-6
                ${
                    darkMode
                        ? "bg-[#11131B] border-white/10 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                }
            `}
        >
            <option value="beginner">
                Beginner
            </option>

            <option value="intermediate">
                Intermediate
            </option>

            <option value="advanced">
                Advanced
            </option>
        </select>


        {/* Start */}

        <button
            type="button"
            onClick={startDictator}
            className="
                w-full
                py-3
                rounded-xl
                bg-gradient-to-r
                from-purple-500
                to-pink-600
                hover:opacity-90
                transition
                text-white
                font-semibold
            "
        >
            🎙 Start Dictator
        </button>

    </div>

)}


                  {/* =========================
    ACTIVE DICTATOR
========================= */}

{!loading && mode === "dictator" && dictatorActive && (

    <div
        className={`
            rounded-2xl
            border
            p-6
            ${
                darkMode
                    ? "bg-[#181B23] border-white/10"
                    : "bg-gray-50 border-gray-300"
            }
        `}
    >

        {/* =========================
            HEADER
        ========================== */}

        <div className="flex items-center gap-3 mb-6">

            <div
                className="
                    w-10
                    h-10
                    rounded-xl
                    bg-gradient-to-r
                    from-purple-500
                    to-pink-600
                    flex
                    items-center
                    justify-center
                    text-white
                "
            >
                <Mic size={20} />
            </div>

            <div>

                <h3
                    className={`font-semibold ${
                        darkMode
                            ? "text-white"
                            : "text-gray-900"
                    }`}
                >
                    CodeXAI Dictator
                </h3>

                <p
                    className={`text-xs ${
                        darkMode
                            ? "text-slate-400"
                            : "text-gray-500"
                    }`}
                >
                    {dictatorProject}
                </p>

            </div>

        </div>


        {/* =========================
            PROGRESS
        ========================== */}

        <div className="mb-6">

            <div className="flex items-center justify-between mb-2">

                <span
                    className={`text-sm font-medium ${
                        darkMode
                            ? "text-slate-300"
                            : "text-gray-700"
                    }`}
                >
                    Step {dictatorStep}

                    {dictatorTotalSteps > 0 &&
                        ` of ${dictatorTotalSteps}`}
                </span>

                <span
                    className={`text-xs ${
                        darkMode
                            ? "text-slate-400"
                            : "text-gray-500"
                    }`}
                >
                    Learning mode
                </span>

            </div>


            <div
                className={`
                    h-2
                    rounded-full
                    overflow-hidden
                    ${
                        darkMode
                            ? "bg-white/10"
                            : "bg-gray-200"
                    }
                `}
            >

                <div
                    className="
                        h-full
                        rounded-full
                        bg-gradient-to-r
                        from-purple-500
                        to-pink-600
                        transition-all
                    "
                    style={{
                        width:
                            dictatorTotalSteps > 0
                                ? `${Math.min(
                                    (dictatorStep /
                                        dictatorTotalSteps) *
                                        100,
                                    100
                                )}%`
                                : "10%",
                    }}
                />

            </div>

        </div>


        {/* =========================
            CURRENT STEP
        ========================== */}

        <div
            className={`
                rounded-xl
                border
                p-5
                mb-5
                ${
                    darkMode
                        ? "bg-[#11131B] border-white/10"
                        : "bg-white border-gray-300"
                }
            `}
        >

            <div className="flex items-center gap-2 mb-3">

                <span className="text-xl">
                    🎙
                </span>

                <span
                    className={`font-semibold ${
                        darkMode
                            ? "text-white"
                            : "text-gray-900"
                    }`}
                >
                    Step {dictatorStep}
                </span>

            </div>


            <p
                className={`text-sm leading-7 ${
                    darkMode
                        ? "text-slate-300"
                        : "text-gray-700"
                }`}
            >
                {currentDictatorStep?.instruction ||
                    "Preparing your next step..."}
            </p>

        </div>


        {/* =========================
            CONCEPT
        ========================== */}

        {currentDictatorStep?.concept && (

            <div
                className={`
                    rounded-xl
                    border
                    p-5
                    mb-5
                    ${
                        darkMode
                            ? "bg-blue-500/10 border-blue-500/20"
                            : "bg-blue-50 border-blue-200"
                    }
                `}
            >

                <div className="flex items-start gap-3">

                    <span className="text-lg">
                        🧠
                    </span>

                    <div className="min-w-0">

                        <p
                            className={`text-sm font-semibold mb-1 ${
                                darkMode
                                    ? "text-blue-300"
                                    : "text-blue-700"
                            }`}
                        >
                            Concept
                        </p>

                        <p
                            className={`text-sm leading-6 ${
                                darkMode
                                    ? "text-slate-300"
                                    : "text-gray-700"
                            }`}
                        >
                            {currentDictatorStep.concept}
                        </p>

                    </div>

                </div>

            </div>

        )}


        {/* =========================
            EXPLANATION
        ========================== */}

        {currentDictatorStep?.explanation && (

            <div
                className={`
                    rounded-xl
                    border
                    p-5
                    mb-5
                    ${
                        darkMode
                            ? "bg-[#11131B] border-white/10"
                            : "bg-white border-gray-300"
                    }
                `}
            >

                <div className="flex items-start gap-3">

                    <span className="text-lg">
                        📖
                    </span>

                    <div className="min-w-0">

                        <p
                            className={`text-sm font-semibold mb-2 ${
                                darkMode
                                    ? "text-white"
                                    : "text-gray-900"
                            }`}
                        >
                            What are we doing?
                        </p>

                        <p
                            className={`text-sm leading-7 whitespace-pre-wrap ${
                                darkMode
                                    ? "text-slate-300"
                                    : "text-gray-700"
                            }`}
                        >
                            {currentDictatorStep.explanation}
                        </p>

                    </div>

                </div>

            </div>

        )}


        {/* =========================
            WHY
        ========================== */}

        {currentDictatorStep?.why && (

            <div
                className={`
                    rounded-xl
                    border
                    p-5
                    mb-5
                    ${
                        darkMode
                            ? "bg-emerald-500/10 border-emerald-500/20"
                            : "bg-emerald-50 border-emerald-200"
                    }
                `}
            >

                <div className="flex items-start gap-3">

                    <span className="text-lg">
                        💡
                    </span>

                    <div className="min-w-0">

                        <p
                            className={`text-sm font-semibold mb-2 ${
                                darkMode
                                    ? "text-emerald-300"
                                    : "text-emerald-700"
                            }`}
                        >
                            Why are we using it?
                        </p>

                        <p
                            className={`text-sm leading-7 whitespace-pre-wrap ${
                                darkMode
                                    ? "text-slate-300"
                                    : "text-gray-700"
                            }`}
                        >
                            {currentDictatorStep.why}
                        </p>

                    </div>

                </div>

            </div>

        )}


        {/* =========================
            EXAMPLE
        ========================== */}

        {currentDictatorStep?.example && (

            <div
                className={`
                    rounded-xl
                    border
                    p-5
                    mb-5
                    ${
                        darkMode
                            ? "bg-[#0D1117] border-white/10"
                            : "bg-gray-900 border-gray-700"
                    }
                `}
            >

                <div className="flex items-center gap-2 mb-3">

                    <span className="text-lg">
                        📝
                    </span>

                    <p
                        className="
                            text-sm
                            font-semibold
                            text-white
                        "
                    >
                        Example
                    </p>

                </div>

                <pre
                    className="
                        text-sm
                        leading-7
                        text-slate-200
                        whitespace-pre-wrap
                        break-words
                        font-mono
                    "
                >
                    {currentDictatorStep.example}
                </pre>

            </div>

        )}


        {/* =========================
            HINT
        ========================== */}

        <div
            className={`
                rounded-xl
                border
                p-4
                mb-5
                ${
                    darkMode
                        ? "bg-purple-500/10 border-purple-500/20"
                        : "bg-purple-50 border-purple-200"
                }
            `}
        >

            <div className="flex items-start gap-3">

                <span className="text-lg">
                    💡
                </span>

                <div>

                    <p
                        className={`text-sm font-semibold mb-1 ${
                            darkMode
                                ? "text-purple-300"
                                : "text-purple-700"
                        }`}
                    >
                        Hint
                    </p>

                    <p
                        className={`text-sm leading-6 ${
                            darkMode
                                ? "text-slate-300"
                                : "text-gray-600"
                        }`}
                    >
                        {currentDictatorStep?.hint ||
                            "Follow the current instruction carefully."}
                    </p>

                </div>

            </div>

        </div>


        {/* =========================
            NEXT STEP
        ========================== */}

        <div
            className={`
                rounded-xl
                border
                p-4
                mb-5
                ${
                    darkMode
                        ? "bg-purple-500/10 border-purple-500/20"
                        : "bg-purple-50 border-purple-200"
                }
            `}
        >

            <div className="flex items-center gap-3">

                <span className="text-lg">
                    🎯
                </span>

                <div>

                    <p
                        className={`text-sm font-semibold ${
                            darkMode
                                ? "text-purple-300"
                                : "text-purple-700"
                        }`}
                    >
                        Your task
                    </p>

                    <p
                        className={`text-sm mt-1 ${
                            darkMode
                                ? "text-slate-300"
                                : "text-gray-700"
                        }`}
                    >
                        {currentDictatorStep?.instruction ||
                            "Complete the current step."}
                    </p>

                </div>

            </div>

        </div>


        {/* =========================
            WAITING
        ========================== */}

        <div
            className={`
                flex
                items-center
                gap-3
                rounded-xl
                px-4
                py-3
                ${
                    darkMode
                        ? "bg-white/5"
                        : "bg-gray-100"
                }
            `}
        >

            <span className="text-green-500">
                ●
            </span>

            <p
                className={`text-sm ${
                    darkMode
                        ? "text-slate-300"
                        : "text-gray-600"
                }`}
            >
                Write the code in the editor.
                CodeXAI will check your progress.
            </p>

        </div>

    </div>

)}

                    {/* Empty State */}

                    {!loading &&
    !result &&
    mode !== "dictator" &&
    mode !== "autocode" && (

                        <div
                            className={`
                                rounded-2xl
                                border
                                p-8
                                text-center
                                ${
                                    darkMode
                                        ? "bg-[#181B23] border-white/10"
                                        : "bg-gray-50 border-gray-300"
                                }
                            `}
                        >

                            <Sparkles
                                size={28}
                                className="
                                    mx-auto
                                    mb-3
                                    text-cyan-500
                                "
                            />

                            <p
    className={
        darkMode
            ? "text-slate-400"
            : "text-gray-500"
    }
>
    {mode === "guide" ? (
        <>
            Click{" "}
            <span className="font-semibold">
                AI Guide
            </span>{" "}
            to get step-by-step guidance for your code.
        </>
    ) : mode === "error" ? (
        <>
            CodeXAI will explain your current
            coding errors here.
        </>
    ) : (
        <>
            Click{" "}
            <span className="font-semibold">
                Explain
            </span>{" "}
            to let CodeXAI analyze your code.
        </>
    )}
</p>

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
}