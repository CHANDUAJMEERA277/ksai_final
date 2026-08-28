def build_guide_prompt(
    language,
    code,
    errors=None,
    output=None,
    file_name=None,
):
    """
    Build the student-context prompt for Codenthra AI Guide.
    """
    norm_lang = (language or "Java").strip()
    lower = norm_lang.lower()
    if lower in ["cpp", "c++"]:
        norm_lang = "C++"
    elif lower == "c":
        norm_lang = "C"
    elif lower in ["python", "py"]:
        norm_lang = "Python"
    elif lower == "java":
        norm_lang = "Java"

    prompt = f"""Language: {norm_lang}
File: {file_name or 'Main code file'}

Student's Source Code:
```{lower}
{code}
```
"""

    has_errors = False

    if errors and len(errors) > 0:
        has_errors = True
        prompt += "\nCompiler / Diagnostic Problems:\n"
        for index, error in enumerate(errors, start=1):
            if isinstance(error, dict):
                f = error.get("file", file_name or "")
                line = error.get("line", "")
                col = error.get("column", "")
                msg = error.get("message", "")
                sev = error.get("severity", "error")
            elif isinstance(error, str):
                f, line, col, sev, msg = file_name or "", "", "", "error", error
            else:
                f = getattr(error, "file", file_name or "")
                line = getattr(error, "line", "")
                col = getattr(error, "column", "")
                msg = getattr(error, "message", str(error))
                sev = getattr(error, "severity", "error")

            prompt += f"\n[Problem {index}] File: {f} | Line: {line} | Column: {col} | {sev.upper()}: {msg}\n"

    if output and isinstance(output, str) and output.strip():
        prompt += f"\nTerminal / Runtime Output:\n```\n{output.strip()}\n```\n"
        if any(w in output.lower() for w in ["error", "exception", "traceback", "expected", "undefined", "fatal"]):
            has_errors = True

    if not has_errors:
        prompt += "\nStatus: No compile-time or runtime errors reported.\n"

    prompt += f"""
Please provide concise, encouraging debugging guidance as Codenthra AI Guide for this {norm_lang} program.
"""
    return prompt