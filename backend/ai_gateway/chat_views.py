from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from orchestrator.orchestrator import AIOrchestrator

import json


@csrf_exempt
def chat(request):

    if request.method != "POST":
        return JsonResponse(
            {
                "success": False,
                "message": "POST only."
            },
            status=405
        )

    try:

        data = json.loads(request.body)

        language = data.get("language", "")
        code = data.get("code", "")
        history = data.get("history", [])
        question = data.get("question", "")

        if not question.strip():
            return JsonResponse(
                {
                    "success": False,
                    "message": "Question is required."
                },
                status=400
            )

        orchestrator = AIOrchestrator()

        result = orchestrator.chat(
            language,
            code,
            history,
            question,
        )

        return JsonResponse(
            {
                "success": True,
                "data": result,
            }
        )

    except Exception as e:

        print("========== AI CHAT ERROR ==========")
        print(e)
        print("===================================")

        return JsonResponse(
            {
                "success": False,
                "message": "AI Chat failed.",
                "error": str(e),
            },
            status=500
        )