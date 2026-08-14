export function registerJavaDiagnostics(
    monaco: any,
    editor: any
) {
    editor.onDidChangeModelContent(() => {
        const model = editor.getModel();

        if (!model) return;

        const code = model.getValue();

        const markers = [];

        if (
            code.includes("System.out.println") &&
            !code.includes(";")
        ) {
            markers.push({
                severity: monaco.MarkerSeverity.Error,

                startLineNumber: 1,
                startColumn: 1,

                endLineNumber: 1,
                endColumn: 10,

                message: "Semicolon expected",
            });
        }

        monaco.editor.setModelMarkers(
            model,
            "java",
            markers
        );
    });
}