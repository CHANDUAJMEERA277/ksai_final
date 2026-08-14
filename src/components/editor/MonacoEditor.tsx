"use client";

import Editor from "@monaco-editor/react";
import { useEffect, useMemo, useRef } from "react";

import type { editor as MonacoEditor } from "monaco-editor";

import { useTabs } from "./tabs/TabContext";

import { useEditorTheme } from "./EditorTheme";
import { useEditorSettings } from "./EditorSettingsContext";

import type { CompilerError } from "./monaco/ErrorParser";

import { registerLanguages } from "./monaco/registerLanguages";
import { useEditor } from "./EditorContext";
import { showDiagnostics } from "./monaco/MonacoDiagnostics";
import { debounceCompile } from "./monaco/LiveDiagnostics";
import { compileCode } from "./monaco/LiveCompiler";

import { useAIResult } from "./AIResultContext";
import { checkDictatorStep } from "./dictator/DictatorEngine";


export default function MonacoEditorPanel() {
  const { darkMode } = useEditorTheme();
  const { settings } = useEditorSettings();

  const {
    activeTab,
    updateTabContent,
    diagnosticsByTab,
    setTabDiagnostics,
} = useTabs();

const {
    setEditor,
} = useEditor();

const {
    dictatorActive,
    dictatorProject,
    dictatorStep,
    setDictatorStep,
    setDictatorTotalSteps,
    setResult,
    setLoading,
    setMode,
} = useAIResult();

const activeDiagnostics =
    activeTab
        ? diagnosticsByTab[activeTab.id] ?? []
        : [];

const editorRef =
    useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);


  const editor = settings.editor;

  const initialCode = `public class Main {

    public static void main(String[] args) {

        System.out.println("Welcome to KnowledgeStream AI");

    }

}`;

  const editorOptions = useMemo<MonacoEditor.IStandaloneEditorConstructionOptions>(
  () => ({
    fontFamily: editor.fontFamily,
    fontSize: editor.fontSize,

    wordWrap: editor.wordWrap ? "on" : "off",

    lineNumbers: editor.lineNumbers ? "on" : "off",

    cursorStyle: editor.cursorStyle,

    tabSize: editor.tabSize,

    minimap: {
      enabled: editor.minimap,
    },

    automaticLayout: true,
    scrollBeyondLastLine: false,
    roundedSelection: true,
    cursorBlinking: "smooth",
    smoothScrolling: true,

    padding: {
      top: 20,
    },
  }),
  [editor]
);

useEffect(() => {

    if (!editorRef.current) {
        return;
    }

    void showDiagnostics(
        editorRef.current,
        activeDiagnostics
    );

}, [
    activeTab?.id,
    activeDiagnostics,
]);


  return (
  <div
    className={`h-full w-full flex-1 transition-all duration-300 ${
      darkMode ? "bg-[#1E1E1E]" : "bg-white"
    }`}
  >
    <Editor
      onMount={(editor)=>{

    editorRef.current=editor;

    setEditor(editor);

}}
      height="100%"
      language={activeTab?.language || "java"}
      value={activeTab?.content ?? initialCode}
      theme={darkMode ? "vs-dark" : "vs"}
      options={editorOptions}
      onChange={(value) => {

    if (!activeTab) return;

    const code = value || "";

    updateTabContent(
        activeTab.id,
        code
    );


    // =========================
// DICTATOR CHECK
// =========================

if (
    dictatorActive &&
    dictatorStep > 0
) {

    const check =
        checkDictatorStep(
            code,
            dictatorStep,
            dictatorProject
        );


    // Keep Result Panel in Dictator mode
    setMode("dictator");


    // =========================
    // CORRECT
    // =========================

    if (check.correct) {

        setResult(
            check.message
        );


        // Move to next Dictator step

        if (
            check.nextStep !== undefined
        ) {

            setDictatorStep(
                check.nextStep
            );

        }


        // =========================
        // SPEAK SUCCESS
        // =========================

        if (
            check.speech &&
            typeof window !== "undefined" &&
            "speechSynthesis" in window
        ) {

            window.speechSynthesis.cancel();


            const speech =
                new SpeechSynthesisUtterance(
                    check.speech
                );


            speech.rate = 0.9;
            speech.pitch = 1;
            speech.volume = 1;


            window.speechSynthesis.speak(
                speech
            );
        }

    }


    // =========================
    // INCORRECT / MISTAKE
    // =========================

    else {

        // Show teacher feedback
        // inside the Result Panel

        setResult(
            check.message
        );


        // Speak mistake + hint

        if (
            check.speech &&
            typeof window !== "undefined" &&
            "speechSynthesis" in window
        ) {

            // Stop any previous speech

            window.speechSynthesis.cancel();


            const speech =
                new SpeechSynthesisUtterance(
                    check.speech
                );


            // Teacher-like speaking speed

            speech.rate = 0.9;
            speech.pitch = 1;
            speech.volume = 1;


            // Start speaking

            window.speechSynthesis.speak(
                speech
            );
        }
    }
}


    // =========================
    // NORMAL COMPILER CHECK
    // =========================

    debounceCompile(() => {

        compileCode(
            code,
            (errors: CompilerError[]) => {

                setTabDiagnostics(
                    activeTab.id,
                    errors
                );

            }
        );

    });

}}
    />
  </div>
);

}