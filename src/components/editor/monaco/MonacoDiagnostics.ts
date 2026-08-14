import type { editor as MonacoEditor } from "monaco-editor";
import type { CompilerError } from "./ErrorParser";

export async function showDiagnostics(
    editor: MonacoEditor.IStandaloneCodeEditor,
    errors: CompilerError[]
) {
    const model = editor.getModel();

    if (!model) return;

    const monaco = await import("monaco-editor");

    const markers: MonacoEditor.IMarkerData[] =
        errors.map((error) => ({
            severity:
                error.severity === "warning"
                    ? monaco.MarkerSeverity.Warning
                    : monaco.MarkerSeverity.Error,

            message: error.message,

            startLineNumber: error.line,
            startColumn: error.column,

            endLineNumber: error.line,
            endColumn: Math.max(
                error.column + 2,
                error.column + 1
            ),
        }));

    monaco.editor.setModelMarkers(
        model,
        "KnowledgeStream",
        markers
    );
}