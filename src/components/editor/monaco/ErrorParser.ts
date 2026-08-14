export interface CompilerError {
    file: string;
    line: number;
    column: number;
    message: string;
    severity: "error" | "warning";
}

export function parseJavaCompilerError(
    output: string
): CompilerError[] {

    const errors: CompilerError[] = [];

    const lines = output.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {

        const line = lines[i].trim();

        /*
         * Standard javac format:
         *
         * Main.java:3: error: illegal start of expression
         */

        const standardMatch = line.match(
            /^(.+\.java):(\d+):\s*(error|warning):\s*(.*)$/i
        );

        if (standardMatch) {

            const file = standardMatch[1];
            const lineNumber = Number(
                standardMatch[2]
            );

            const severity =
                standardMatch[3].toLowerCase() === "warning"
                    ? "warning"
                    : "error";

            const message =
                standardMatch[4].trim();

            let column = 1;

            /*
             * javac normally places the ^ pointer
             * two lines below the error line.
             */

            for (
                let j = i + 1;
                j < Math.min(i + 4, lines.length);
                j++
            ) {

                const pointerIndex =
                    lines[j].indexOf("^");

                if (pointerIndex >= 0) {

                    column =
                        pointerIndex + 1;

                    break;
                }
            }

            errors.push({
                file,
                line: lineNumber,
                column,
                message,
                severity,
            });

            continue;
        }

        /*
         * Alternative format:
         *
         * C:\...\Main.java
         * Line 3
         * illegal start of expression
         */

        const fileMatch = line.match(
            /^(.+\.java)$/i
        );

        if (
            fileMatch &&
            i + 2 < lines.length
        ) {

            const lineMatch =
                lines[i + 1].trim().match(
                    /^Line\s+(\d+)$/i
                );

            if (!lineMatch) {
                continue;
            }

            const lineNumber =
                Number(lineMatch[1]);

            const message =
                lines[i + 2].trim();

            if (!message) {
                continue;
            }

            errors.push({
                file: fileMatch[1],
                line: lineNumber,
                column: 1,
                message,
                severity: "error",
            });
        }
    }

    return errors;
}