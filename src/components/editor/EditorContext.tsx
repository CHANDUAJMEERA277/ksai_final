"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

import type { CompilerError } from "./monaco/ErrorParser";
import type { editor as MonacoEditor } from "monaco-editor";

interface EditorContextType {

  diagnostics: CompilerError[];

  setDiagnostics: (
    errors: CompilerError[]
  ) => void;

  editor:
    | MonacoEditor.IStandaloneCodeEditor
    | null;

  setEditor: (
    editor: MonacoEditor.IStandaloneCodeEditor | null
  ) => void;
}

const EditorContext =
createContext<EditorContextType | null>(null);

export function EditorProvider({
  children,
}:{
  children: ReactNode;
}){

  const [diagnostics,setDiagnostics]=
    useState<CompilerError[]>([]);

  const [editor,setEditor]=
    useState<MonacoEditor.IStandaloneCodeEditor|null>(null);

  return(

    <EditorContext.Provider
      value={{
        diagnostics,
        setDiagnostics,
        editor,
        setEditor,
      }}
    >

      {children}

    </EditorContext.Provider>

  );

}

export function useEditor(){

  const context=useContext(EditorContext);

  if(!context){
    throw new Error("EditorProvider missing.");
  }

  return context;

}