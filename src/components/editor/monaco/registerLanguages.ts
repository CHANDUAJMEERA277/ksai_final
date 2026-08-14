import * as monaco from "monaco-editor";

import { registerJavaCompletion } from "./java";
import { registerPythonCompletions } from "./python";
import { registerCppCompletions } from "./cpp";
import { registerJavascriptCompletions } from "./javascript";

export function registerLanguages() {
    registerJavaCompletion(monaco);
    registerPythonCompletions(monaco);
    registerCppCompletions(monaco);
    registerJavascriptCompletions(monaco);
}