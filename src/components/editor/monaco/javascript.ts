export function registerJavascriptCompletions(monaco: any) {

  monaco.languages.registerCompletionItemProvider(
    "javascript",
    {
      provideCompletionItems: (model: any, position: any) => {
        return {
          suggestions: [
            {
              label: "console.log",

              kind:
                monaco.languages
                  .CompletionItemKind.Function,

              insertText: "console.log($1)",

              insertTextRules:
                monaco.languages
                  .CompletionItemInsertTextRule
                  .InsertAsSnippet,

              range: new monaco.Range(
                position.lineNumber,
                position.column,
                position.lineNumber,
                position.column
              ),
            },
          ],
        };
      },
    }
  );
}