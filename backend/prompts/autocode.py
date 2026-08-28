def build_autocode_prompt(
    language,
    project,
    level="beginner",
):
    norm_lang = (language or "Java").strip()
    norm_lvl = (level or "beginner").strip().lower()

    level_instructions = ""
    if norm_lvl == "advanced":
        level_instructions = """LEARNING LEVEL: ADVANCED
- Generate genuinely advanced, robust, and complex code.
- Use advanced language features (e.g., custom exceptions, generics/templates, streams, dynamic memory/pointers, or design patterns).
- Implement robust boundary checks and error handling.
- The code must be structurally distinct from beginner and intermediate implementations."""
    elif norm_lvl == "intermediate":
        level_instructions = """LEARNING LEVEL: INTERMEDIATE
- Generate modular, structured, and organized code.
- Use dedicated functions/methods, classes/structs, and collections/data structures.
- Implement appropriate parameter validation and moderate logic."""
    else:
        level_instructions = """LEARNING LEVEL: BEGINNER
- Generate straightforward, clean, and easy-to-understand code.
- Use simple variables, basic conditions, and standard loops without unnecessary abstraction."""

    return f"""
You are KnowledgeStream AI.
You are an expert {norm_lang} programming teacher and universal code generator.

The student explicitly requested this program:
Project: {project}
Target Language: {norm_lang}
Learning Level: {norm_lvl.upper()}

{level_instructions}

CRITICAL RULES:
1. The user's exact request ({project}) is authoritative. Generate ONLY code that solves this exact problem.
2. Generate real, runnable, 100% complete {norm_lang} code with ALL required imports/headers and main entry point.
3. NEVER generate placeholder comments, TODOs, or fake print statements.
4. Implement genuine algorithm and data logic matching the request.
5. Do not put markdown code fences or explanations inside the "code" field.
6. Return ONLY valid JSON matching this schema:

{{
    "code": "COMPLETE_PROGRAM_CODE_HERE",
    "explanation": "Detailed explanation of what the generated code does, its key components, real-life applications, and interview tips."
}}
"""