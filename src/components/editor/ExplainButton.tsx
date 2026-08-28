"use client";

import {
    BookOpen,
    Loader2,
} from "lucide-react";

import { useTabs } from "./tabs/TabContext";
import { useAIResult } from "./AIResultContext";
import { useLanguage } from "./languages/LanguageContext";

export default function ExplainButton() {

    const { activeTab } = useTabs();
    const { language } = useLanguage();

    const {
        setResult,
        setLoading,
        loading,
    } = useAIResult();


    async function explainCode() {

        if (!activeTab) return;

        setLoading(true);
        setResult("");

        const langName =
            language?.name ||
            (activeTab.language === "cpp"
                ? "C++"
                : activeTab.language === "c"
                ? "C"
                : activeTab.language === "python"
                ? "Python"
                : "Java");

        try {

            const response = await fetch(
                "/api/ai/explain",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({

                        language: langName,

                        code:
                            activeTab.content,

                    }),
                }
            );


            if (!response.ok) {

                throw new Error(
                    `Explain request failed: ${response.status}`
                );

            }


            const result =
                await response.json();


            console.log(
                "CodeXAI Response:",
                result
            );


            /*
             * Support the response structures
             * currently used by our backend.
             */

            const aiResponse =
                result.response ??
                result.data?.response ??
                result.data ??
                "";


            if (!aiResponse) {

                throw new Error(
                    "AI returned an empty response."
                );

            }


            setResult(aiResponse);


        } catch (error) {

            console.error(
                "Explain failed:",
                error
            );


            setResult(
                "⚠️ Unable to generate an explanation. Please try again."
            );


        } finally {

            setLoading(false);

        }

    }


    return (

        <button
            onClick={explainCode}
            disabled={!activeTab || loading}
            className="
                group
                flex
                items-center
                gap-3
                px-5
                py-3
                rounded-2xl
                bg-gradient-to-r
                from-violet-500
                to-purple-600
                text-white
                shadow-lg
                hover:scale-105
                hover:shadow-xl
                transition
                disabled:opacity-50
                disabled:cursor-not-allowed
                disabled:hover:scale-100
            "
        >

            {loading ? (

                <Loader2
                    size={20}
                    className="animate-spin"
                />

            ) : (

                <BookOpen
                    size={20}
                />

            )}


            <span className="font-semibold">

                {loading
                    ? "Analyzing..."
                    : "Explain"}

            </span>

        </button>

    );

}