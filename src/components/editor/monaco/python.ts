import * as monaco from "monaco-editor";

export function registerPythonCompletions(monaco: any) {

  monaco.languages.registerCompletionItemProvider("python", {
    provideCompletionItems: (model: any, position: any) => {
      const word = model.getWordUntilPosition(position);
      const range: any = {
        startLineNumber: position.lineNumber,
        startColumn: word.startColumn ?? position.column,
        endLineNumber: position.lineNumber,
        endColumn: word.endColumn ?? position.column,
      };

      return {
        suggestions: [
          {
            label: "print",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: "print($1)",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
        ],
      };
    },
  });
}