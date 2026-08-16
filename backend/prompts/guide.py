def build_guide_prompt(
    language,
    code,
    errors,
):
    """
    Build the student-context prompt for CodeXAI Guide.

    The AI behavior and teaching rules are handled by the
    system prompt in AIOrchestrator.
    """

    prompt = f"""
Student programming language:

{language}

Student's current code:

{code}

Compiler problems:
"""

    # =====================================================
    # ADD COMPILER PROBLEMS
    # =====================================================

    if errors:

        for index, error in enumerate(
            errors,
            start=1,
        ):

            if isinstance(error, dict):

                file = error.get(
                    "file",
                    "",
                )

                line = error.get(
                    "line",
                    "",
                )

                column = error.get(
                    "column",
                    "",
                )

                message = error.get(
                    "message",
                    "",
                )

                severity = error.get(
                    "severity",
                    "error",
                )

            else:

                file = getattr(
                    error,
                    "file",
                    "",
                )

                line = getattr(
                    error,
                    "line",
                    "",
                )

                column = getattr(
                    error,
                    "column",
                    "",
                )

                message = getattr(
                    error,
                    "message",
                    "",
                )

                severity = getattr(
                    error,
                    "severity",
                    "error",
                )

            prompt += f"""

Problem {index}:

File: {file}

Line: {line}

Column: {column}

Severity: {severity}

Message: {message}
"""

    else:

        prompt += """

No compiler problems are currently reported.
"""

    # =====================================================
    # FINAL GUIDE REQUEST
    # =====================================================

    prompt += """

Based on the student's current progress,
guide them toward the next useful programming step.

Do not give the complete solution.

"""

    return prompt