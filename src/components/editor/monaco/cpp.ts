export function registerCppCompletions(monaco: any) {

  monaco.languages.registerCompletionItemProvider(
    "cpp",
    {
      provideCompletionItems: (model: any, position: any) => {
        return {
          suggestions: [
            {
              label: "cout",
              kind:
                monaco.languages
                  .CompletionItemKind.Keyword,

              insertText:
                'std::cout << "$1";',

              insertTextRules:
                monaco.languages
                  .CompletionItemInsertTextRule
                  .InsertAsSnippet,

              range: {
                startLineNumber: position.lineNumber,
                startColumn: position.column,
                endLineNumber: position.lineNumber,
                endColumn: position.column,
              },
            },
          ],
        };
      },
    }
  );
}