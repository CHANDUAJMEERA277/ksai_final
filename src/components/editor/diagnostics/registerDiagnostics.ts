import * as monaco from "monaco-editor";

import { registerJavaDiagnostics } from "./javaDiagnostics";
import { registerPythonDiagnostics } from "./pythonDiagnostics";
import * as cppDiagnostics from "./cppDiagnostics";


export function registerDiagnostics(editor: any): void {
    registerJavaDiagnostics(
        monaco,
        editor
    );
    registerPythonDiagnostics(
        monaco,
        editor
    );
    // Some modules may not export registerCppDiagnostics as a named export.
    // Guard the call and use a flexible access to avoid import errors.
    const registerCpp = (cppDiagnostics as any).registerCppDiagnostics;
    if (typeof registerCpp === "function") {
        registerCpp(monaco, editor);
    }
    
       
       
}