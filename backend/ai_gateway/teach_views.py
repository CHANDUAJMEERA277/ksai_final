import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from orchestrator.orchestrator import AIOrchestrator


@csrf_exempt
def teach(request):

    if request.method != "POST":
        return JsonResponse(
            {
                "success": False,
                "message": "POST only.",
            },
            status=405,
        )

    try:

        data = json.loads(request.body)

        course = data.get(
            "course",
            "",
        )

        chapter = data.get(
            "chapter",
            "",
        )

        topic = data.get(
            "topic",
            "",
        )

        content = data.get(
            "content",
            "",
        )

        question = data.get(
            "question",
            "",
        )

        mode = data.get(
            "mode",
            "chat",
        )

        history = data.get(
            "history",
            [],
        )

        asked_question = data.get(
    "askedQuestion",
    "",
)

        # -----------------------------------------
        # VALIDATION
        # -----------------------------------------

        if not question.strip():
            return JsonResponse(
                {
                    "success": False,
                    "message": "Question is required.",
                },
                status=400,
            )

        if not content.strip():
            return JsonResponse(
                {
                    "success": False,
                    "message": "Lesson content is required.",
                },
                status=400,
            )

        allowed_modes = {
    "explain",
    "example",
    "visual",
    "question",
    "evaluate",
    "confused",
    "chat",
}

        if mode not in allowed_modes:
            mode = "chat"

        # -----------------------------------------
        # TEACHING ENGINE
        # -----------------------------------------

        orchestrator = AIOrchestrator()

        result = orchestrator.teach(
    course=course,
    chapter=chapter,
    topic=topic,
    content=content,
    question=question,
    mode=mode,
    history=history,
    asked_question=asked_question,
)

        return JsonResponse(
            {
                "success": True,
                "data": result,
            }
        )

    except json.JSONDecodeError:

        return JsonResponse(
            {
                "success": False,
                "message": "Invalid JSON.",
            },
            status=400,
        )

    except Exception as error:

        print()
        print("========== AI TEACHING ERROR ==========")
        print(error)
        print("=======================================")

        return JsonResponse(
            {
                "success": False,
                "message": "AI Teaching Engine failed.",
                "error": str(error),
            },
            status=500,
        )