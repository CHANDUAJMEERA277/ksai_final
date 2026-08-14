import { parseJavaCompilerError } from "./ErrorParser";
import type { CompilerError } from "./ErrorParser";

export async function compileCode(
    code: string,
    setDiagnostics: (
        errors: CompilerError[]
    ) => void
) {
    try {
        const response = await fetch(
            "/api/run",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify({
                    code,
                    language: "java",
                }),
            }
        );

        const result =
            await response.json();

        if (result.success) {
            setDiagnostics([]);
        } else {

            const errors =
                parseJavaCompilerError(
                    result.output || ""
                );

            setDiagnostics(errors);
        }

    } catch (error) {

        console.error(
            "Compilation failed:",
            error
        );

        setDiagnostics([]);
    }
}