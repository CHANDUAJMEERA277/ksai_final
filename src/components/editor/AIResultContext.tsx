"use client";

import {
    createContext,
    useContext,
    useState,
    useRef,
    ReactNode,
} from "react";

import type { DictatorStep } from "./dictator/DictatorPlanner";
import type { DictatorTeachingUnit } from "./dictator/DictatorTokenizer";
import type { DictatorMessage } from "./dictator/DictatorEngine";

type AIResultMode =
    | "explain"
    | "guide"
    | "error"
    | "dictator"
    | "autocode";

export type DictatorValidationState = "correct" | "error" | "typing" | "completed";

interface AIResultContextType {
    result: string;
    loading: boolean;
    mode: AIResultMode;

    // Dictator state
    dictatorActive: boolean;
    dictatorLanguage: string;
    dictatorProject: string;
    dictatorStep: number;
    dictatorTotalSteps: number;
    dictatorPlan: DictatorStep[];
    dictatorRequirements: string[];
    dictatorCompleted: boolean;
    dictatorFeedback: string;

    // Progressive Word-by-Word Units State
    dictatorUnits: DictatorTeachingUnit[];
    dictatorCurrentUnit: number;
    dictatorValidationStatus: DictatorValidationState;
    dictatorTypedToken: string;
    dictatorExpectedToken: string;
    dictatorErrorExplanation: string;
    dictatorSessionId: number;
    currentDictatorMessage: DictatorMessage | null;

    setResult: (result: string) => void;
    setLoading: (loading: boolean) => void;
    setMode: (mode: AIResultMode) => void;

    setDictatorActive: (active: boolean) => void;
    setDictatorLanguage: (language: string) => void;
    setDictatorProject: (project: string) => void;
    setDictatorStep: (step: number | ((prev: number) => number)) => void;
    setDictatorTotalSteps: (total: number) => void;
    setDictatorPlan: (plan: DictatorStep[]) => void;
    setDictatorRequirements: (reqs: string[]) => void;
    setDictatorCompleted: (completed: boolean) => void;
    setDictatorFeedback: (feedback: string) => void;

    setDictatorUnits: (units: DictatorTeachingUnit[]) => void;
    setDictatorCurrentUnit: (unit: number | ((prev: number) => number)) => void;
    setDictatorValidationStatus: (status: DictatorValidationState) => void;
    setDictatorTypedToken: (token: string) => void;
    setDictatorExpectedToken: (token: string) => void;
    setDictatorErrorExplanation: (explanation: string) => void;
    setCurrentDictatorMessage: (msg: DictatorMessage | null) => void;
    incrementSessionId: () => number;

    clearResult: () => void;
    resetDictatorSession: () => void;
}

const AIResultContext =
    createContext<AIResultContextType | null>(null);

export function AIResultProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<AIResultMode>("explain");

    // Dictator State
    const [dictatorActive, setDictatorActive] = useState(false);
    const [dictatorLanguage, setDictatorLanguage] = useState("java");
    const [dictatorProject, setDictatorProject] = useState("");
    const [dictatorStep, setDictatorStep] = useState(0);
    const [dictatorTotalSteps, setDictatorTotalSteps] = useState(0);
    const [dictatorPlan, setDictatorPlan] = useState<DictatorStep[]>([]);
    const [dictatorRequirements, setDictatorRequirements] = useState<string[]>([]);
    const [dictatorCompleted, setDictatorCompleted] = useState(false);
    const [dictatorFeedback, setDictatorFeedback] = useState("");

    // Progressive Units State
    const [dictatorUnits, setDictatorUnits] = useState<DictatorTeachingUnit[]>([]);
    const [dictatorCurrentUnit, setDictatorCurrentUnit] = useState(0);
    const [dictatorValidationStatus, setDictatorValidationStatus] = useState<DictatorValidationState>("typing");
    const [dictatorTypedToken, setDictatorTypedToken] = useState("");
    const [dictatorExpectedToken, setDictatorExpectedToken] = useState("");
    const [dictatorErrorExplanation, setDictatorErrorExplanation] = useState("");
    const [currentDictatorMessage, setCurrentDictatorMessage] = useState<DictatorMessage | null>(null);
    const sessionIdRef = useRef(1);
    const [dictatorSessionId, setDictatorSessionId] = useState(1);

    function incrementSessionId(): number {
        sessionIdRef.current += 1;
        setDictatorSessionId(sessionIdRef.current);
        return sessionIdRef.current;
    }

    function resetDictatorSession() {
        incrementSessionId();
        setDictatorActive(false);
        setDictatorProject("");
        setDictatorStep(0);
        setDictatorTotalSteps(0);
        setDictatorPlan([]);
        setDictatorRequirements([]);
        setDictatorCompleted(false);
        setDictatorFeedback("");
        setDictatorUnits([]);
        setDictatorCurrentUnit(0);
        setDictatorValidationStatus("typing");
        setDictatorTypedToken("");
        setDictatorExpectedToken("");
        setDictatorErrorExplanation("");
        setCurrentDictatorMessage(null);
    }

    function clearResult() {
        setResult("");
        setLoading(false);
        setMode("explain");
        resetDictatorSession();
    }

    return (
        <AIResultContext.Provider
            value={{
                result,
                loading,
                mode,

                dictatorActive,
                dictatorLanguage,
                dictatorProject,
                dictatorStep,
                dictatorTotalSteps,
                dictatorPlan,
                dictatorRequirements,
                dictatorCompleted,
                dictatorFeedback,

                dictatorUnits,
                dictatorCurrentUnit,
                dictatorValidationStatus,
                dictatorTypedToken,
                dictatorExpectedToken,
                dictatorErrorExplanation,
                dictatorSessionId,
                currentDictatorMessage,

                setResult,
                setLoading,
                setMode,

                setDictatorActive,
                setDictatorLanguage,
                setDictatorProject,
                setDictatorStep,
                setDictatorTotalSteps,
                setDictatorPlan,
                setDictatorRequirements,
                setDictatorCompleted,
                setDictatorFeedback,

                setDictatorUnits,
                setDictatorCurrentUnit,
                setDictatorValidationStatus,
                setDictatorTypedToken,
                setDictatorExpectedToken,
                setDictatorErrorExplanation,
                setCurrentDictatorMessage,
                incrementSessionId,

                clearResult,
                resetDictatorSession,
            }}
        >
            {children}
        </AIResultContext.Provider>
    );
}

export function useAIResult() {
    const context = useContext(AIResultContext);
    if (!context) {
        throw new Error(
            "useAIResult must be used within an AIResultProvider"
        );
    }
    return context;
}