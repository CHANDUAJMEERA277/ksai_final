import { validateCodeBeforeRun } from "../runner/CodeValidator";
import type { CompilerError } from "./ErrorParser";

export function compileCode(
    code: string,
    setDiagnostics: (
        errors: CompilerError[]
    ) => void,
    language: string = "java",
    fileName?: string
) {
    try {
        const validation = validateCodeBeforeRun({
            language,
            code,
            fileName,
        });

        if (validation.valid || !validation.diagnostics || validation.diagnostics.length === 0) {
            setDiagnostics([]);
        } else {
            const compilerErrors: CompilerError[] = validation.diagnostics.map((d) => ({
                file: d.file || fileName || "Main",
                line: d.line,
                column: d.column,
                message: d.message,
                severity: d.severity,
                type: d.type,
                explanation: d.explanation,
                correction: d.correction,
                code: d.code,
            }));
            setDiagnostics(compilerErrors);
        }
    } catch (error) {
        console.error("Live validation failed:", error);
        setDiagnostics([]);
    }
}