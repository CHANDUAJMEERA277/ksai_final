"use client";

import {
    createContext,
    useContext,
    useState,
    ReactNode,
} from "react";

type AIResultMode =
    | "explain"
    | "guide"
    | "error"
    | "dictator"
    | "autocode";

interface AIResultContextType {
    result: string;
    loading: boolean;

    mode: AIResultMode;

    // Dictator state
    dictatorActive: boolean;
    dictatorProject: string;
    dictatorStep: number;
    dictatorTotalSteps: number;

    setResult: (result: string) => void;
    setLoading: (loading: boolean) => void;
    setMode: (mode: AIResultMode) => void;

    setDictatorActive: (
        active: boolean
    ) => void;

    setDictatorProject: (
        project: string
    ) => void;

    setDictatorStep: (
        step: number
    ) => void;

    setDictatorTotalSteps: (
        total: number
    ) => void;

    clearResult: () => void;
}

const AIResultContext =
    createContext<AIResultContextType | null>(null);

export function AIResultProvider({
    children,
}: {
    children: ReactNode;
}) {

    const [result, setResult] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [mode, setMode] =
        useState<AIResultMode>("explain");

    // =========================
    // Dictator State
    // =========================

    const [dictatorActive, setDictatorActive] =
        useState(false);

    const [dictatorProject, setDictatorProject] =
        useState("");

    const [dictatorStep, setDictatorStep] =
        useState(0);

    const [dictatorTotalSteps, setDictatorTotalSteps] =
        useState(0);

    // =========================
    // Clear Result
    // =========================

    function clearResult() {

        setResult("");

        setLoading(false);

        setMode("explain");

        setDictatorActive(false);

        setDictatorProject("");

        setDictatorStep(0);

        setDictatorTotalSteps(0);
    }

    return (
        <AIResultContext.Provider
            value={{
                result,
                loading,
                mode,

                dictatorActive,
                dictatorProject,
                dictatorStep,
                dictatorTotalSteps,

                setResult,
                setLoading,
                setMode,

                setDictatorActive,
                setDictatorProject,
                setDictatorStep,
                setDictatorTotalSteps,

                clearResult,
            }}
        >
            {children}
        </AIResultContext.Provider>
    );
}

export function useAIResult() {

    const context =
        useContext(AIResultContext);

    if (!context) {

        throw new Error(
            "AIResultProvider missing."
        );
    }

    return context;
}