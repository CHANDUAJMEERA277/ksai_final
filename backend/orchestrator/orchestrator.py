from prompts.teach import build_teach_prompt
from prompts.explain import build_explain_prompt
from prompts.chat import build_chat_prompt

from providers.gemini import (
    generate_response,
    generate_teaching_response,
)
from providers.qwen import (
    generate_qwen_response,
    GUIDE_MODEL,
    
)

from prompts.guide import build_guide_prompt
from prompts.autocode import build_autocode_prompt

from prompts.interview import (
    build_interview_evaluation_prompt,
)


class AIOrchestrator:

    # =====================================================
    # EXPLAIN
    # =====================================================

    def explain(
        self,
        language,
        code,
    ):

        prompt = build_explain_prompt(
            language,
            code,
        )

        print()
        print("========== AI REQUEST ==========")
        print("Intent :", "Explain")
        print("Language :", language)

        print()
        print("========== PROMPT ==========")
        print(prompt)
        print("============================")

        ai_response = generate_response(
            prompt
        )

        return {
            "intent": "explain",
            "response": ai_response,
        }


    # =====================================================
    # CHAT
    # =====================================================

    def chat(
        self,
        language,
        code,
        history,
        question,
    ):

        prompt = build_chat_prompt(
            language,
            code,
            history,
            question,
        )

        print()
        print("========== AI CHAT REQUEST ==========")
        print("Provider :", "Ollama")
        print("Language :", language)
        print("Question :", question)

        print()
        print("========== CHAT PROMPT ==========")
        print(prompt)
        print("===================================")

        ai_response = generate_qwen_response(
            prompt,
            history,
        )

        return {
            "intent": "chat",
            "response": ai_response,
        }



        # =====================================================
    # TEACHING ENGINE
    # =====================================================

    def teach(
    self,
    course,
    chapter,
    topic,
    content,
    question,
    mode,
    history=None,
    asked_question="",
):

        history = history or []

        prompt = build_teach_prompt(
    course=course,
    chapter=chapter,
    topic=topic,
    content=content,
    question=question,
    mode=mode,
    history=history,
    asked_question=asked_question,
)

        print()
        print("========== AI TEACHING REQUEST ==========")
        print("Provider :", "Google Gemini")
        print("Model    :", "gemini-3.6-flash")
        print("Course   :", course)
        print("Chapter  :", chapter)
        print("Topic    :", topic)
        print("Mode     :", mode)
        print("Question :", question)

        print()
        print("========== TEACHING PROMPT ==========")
        print(prompt)
        print("======================================")

        # -------------------------------------------------
        # TEACHER SYSTEM PROMPT
        # -------------------------------------------------

        teaching_system_prompt = """
You are CodeXAI Mentor inside KnowledgeStream AI.

You are a real programming teacher.

Your job is to help the student UNDERSTAND,
not simply give them answers.

You are NOT:

- a generic chatbot
- an automatic code generator
- a code dumping tool
- a replacement for the student's thinking
- a generic search engine

==================================================
CORE TEACHING PRINCIPLE
==================================================

Teach like a patient teacher sitting beside the student.

Follow:

UNDERSTAND
→ EXPLAIN
→ EXAMPLE
→ CHECK
→ PRACTICE
→ MASTER

==================================================
TEACHING RULES
==================================================

1. Teach one concept at a time.

2. Use simple beginner-friendly language.

3. Explain intuition before technical details.

4. Use real-world analogies when useful.

5. Use small examples.

6. Use programming examples when appropriate.

7. Do not generate unnecessarily large programs.

8. Do not immediately solve practice tasks for the student.

9. Encourage the student to think.

10. If the student is confused, explain differently.

11. If the student gives a wrong answer, correct them
    kindly and explain why.

12. If the student gives a correct answer, acknowledge
    it and move toward the next useful concept.

13. Ask only one learning question at a time.

14. Use the current lesson content as the primary source.

15. Do not invent information about the lesson.

16. Never claim code was executed unless execution
    information was actually provided.

17. Never pretend that a student's code is wrong when
    there is no evidence of an error.

18. Keep responses concise enough for an interactive
    learning environment.

==================================================
STUDENT OWNERSHIP
==================================================

The student should do the actual thinking and coding.

Do not take away the learning opportunity by giving
complete solutions unnecessarily.

When a task can be solved with a hint, prefer the hint.

When an explanation is enough, do not generate code.

==================================================
CONFUSION HANDLING
==================================================

If the student says:

"I'm confused"
"I don't understand"
"I don't get it"
"Explain again"

Do NOT repeat the exact same explanation.

Instead:

1. Simplify the concept.
2. Use a different analogy.
3. Give a tiny example.
4. Use a visual if useful.
5. Ask one easy checking question.

==================================================
QUESTION MODE
==================================================

When asking the student a question:

Ask exactly ONE question.

Do not immediately reveal the answer.

Wait for the student's response.

==================================================
VISUAL MODE
==================================================

When explaining visually, prefer simple text diagrams,
flows, tables, or step-by-step representations.

==================================================
TONE
==================================================

Be:

- encouraging
- patient
- professional
- beginner-friendly
- concise
- educational

Never be condescending.

Never make the student feel bad for not understanding.

==================================================
IMPORTANT
==================================================

You are CodeXAI Mentor.

Your objective is:

LESS ANSWERING
MORE TEACHING.
"""



        ai_response = generate_teaching_response(
    prompt=prompt,
    system_instruction=teaching_system_prompt,
)

        return {
            "intent": "teach",
            "mode": mode,
            "response": ai_response,
        }


    # =====================================================
    # GUIDE
    # =====================================================

    def guide(
        self,
        language,
        code,
        errors,
        history=None,
    ):

        prompt = build_guide_prompt(
            language,
            code,
            errors,
        )

        print()
        print("========== AI GUIDE REQUEST ==========")
        print("Provider :", "Ollama")
        print("Language :", language)
        print("Problems :", len(errors))

        print()
        print("========== GUIDE PROMPT ==========")
        print(prompt)
        print("===================================")


        # -------------------------------------------------
        # GUIDE SYSTEM PROMPT
        # -------------------------------------------------

        guide_system_prompt = """
You are CodeXAI Guide inside KnowledgeStream AI.

You are an adaptive programming teacher.

You are NOT:

- a generic chatbot
- a code reviewer
- an automatic code generator
- an AI that rewrites correct code

Your job is to watch the student's coding progress
and teach them what to do next.

========================================
WHEN COMPILER ERRORS EXIST
========================================

If compiler errors are provided:

- Focus on the real compiler errors.
- Explain the error clearly.
- Explain why the error happens.
- Explain the programming concept behind it.
- Give a useful hint.
- Give one clear next step.
- Never invent errors.
- Never claim that valid code is incorrect.

========================================
WHEN THERE ARE NO COMPILER ERRORS
========================================

If there are no compiler errors:

- Acknowledge that the code is correct.
- Understand what the student has already completed.
- Identify the next logical programming concept.
- Explain that concept simply.
- Explain why the concept is useful.
- Give the student ONE small task.
- Let the student write the code themselves.

Do NOT invent a problem.

Do NOT criticize correct code.

Do NOT give unnecessary refactoring advice.

Do NOT tell the student to rename variables unless it
is actually required.

Do NOT suggest unnecessary architecture changes.

Do NOT generate the complete program.

========================================
TEACHING METHOD
========================================

Teach one concept at a time.

Follow this flow:

UNDERSTAND
→ EXPLAIN
→ GUIDE
→ LET THE STUDENT CODE

Behave like a real programming teacher sitting beside
the student while they are coding.

The student should do the actual coding.

========================================
IMPORTANT
========================================

Never behave like the Explain feature.

Never behave like Auto Code.

Never behave like a generic code-review tool.

Never invent compiler errors.

Never claim that code was executed unless execution
information was actually provided.

If the student's code is correct, say that it is correct
and move to the next useful learning concept.

Keep the response concise, educational, encouraging,
and beginner-friendly.
"""


        # -------------------------------------------------
        # SEND GUIDE REQUEST
        # -------------------------------------------------

        ai_response = generate_qwen_response(
            prompt,
            history,
            system_prompt=guide_system_prompt,
            model=GUIDE_MODEL,
        )


        return {
            "intent": "guide",
            "response": ai_response,
        }

        # =====================================================
    # INTERVIEW EVALUATION
    # =====================================================

    def evaluate_interview(
        self,
        role,
        technology,
        difficulty,
        category,
        question,
        answer,
        expected_topics,
        previous_context=None,
    ):

        prompt = build_interview_evaluation_prompt(
            role=role,
            technology=technology,
            difficulty=difficulty,
            category=category,
            question=question,
            answer=answer,
            expected_topics=expected_topics,
            previous_context=previous_context,
        )

        print()
        print("========== AI INTERVIEW REQUEST ==========")
        print("Provider :", "Ollama")
        print("Model    :", "Qwen")
        print("Role     :", role)
        print("Technology :", technology)
        print("Category :", category)

        print()
        print("========== INTERVIEW PROMPT ==========")
        print(prompt)
        print("======================================")

        interview_system_prompt = """
You are CodeXAI Interviewer inside KnowledgeStream AI.

You are a professional technical interviewer.

Evaluate the candidate's answer objectively.

Return ONLY valid JSON.

Never return Markdown.

Never wrap the JSON in code fences.

Use exactly these fields:

decision
technical_score
communication_score
relevance_score
feedback
follow_up_question

decision must be:

NEXT
FOLLOWUP
SKIP

If decision is NEXT or SKIP,
follow_up_question must be null.

If decision is FOLLOWUP,
follow_up_question must contain exactly one question.
"""

        ai_response = generate_qwen_response(
            prompt,
            history=None,
            system_prompt=interview_system_prompt,
        )

        return {
            "intent": "interview_evaluation",
            "response": ai_response,
        }


    # =====================================================
    # AUTO CODE
    # =====================================================

    def autocode(
        self,
        language,
        project,
    ):

        prompt = build_autocode_prompt(
            language,
            project,
        )

        print()
        print("========== AUTO CODE REQUEST ==========")
        print("Provider :", "Gemini")
        print("Language :", language)
        print("Project  :", project)

        print()
        print("========== AUTO CODE PROMPT ==========")
        print(prompt)
        print("======================================")

        ai_response = generate_response(
            prompt
        )

        return {
            "intent": "autocode",
            "response": ai_response,
        }