

export function registerJavaCompletion(monaco: any) {

  monaco.languages.registerCompletionItemProvider("java", {
    provideCompletionItems: (model: any, position: any, context: any, token: any) => {
      const word = model.getWordUntilPosition(position);

      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };


      const suggestions = [
        {
          label: "println",
          kind: monaco.languages.CompletionItemKind.Method,
          insertText: "println($1);",
          range,
          insertTextRules:
            monaco.languages
              .CompletionItemInsertTextRule
              .InsertAsSnippet,
          documentation: "Print line",
        },

        {
          label: "print",
          kind: monaco.languages.CompletionItemKind.Method,
          insertText: "print($1);",
          range,
          insertTextRules:
            monaco.languages
              .CompletionItemInsertTextRule
              .InsertAsSnippet,
          documentation: "Print text",
        },

        {
          label: "printf",
          kind: monaco.languages.CompletionItemKind.Method,
          insertText: "printf($1);",
          range,
          insertTextRules:
            monaco.languages
              .CompletionItemInsertTextRule
              .InsertAsSnippet,
          documentation: "Formatted output",
        },

        {
          label: "main",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            "public static void main(String[] args) {",
            "\t$0",
            "}",
          ].join("\n"),
          range,
          insertTextRules:
            monaco.languages
              .CompletionItemInsertTextRule
              .InsertAsSnippet,
        },
      ];

      return { suggestions };
    },
  });
}