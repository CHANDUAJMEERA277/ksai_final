import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from orchestrator.orchestrator import AIOrchestrator


@csrf_exempt
def guide(request):

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

        language = data.get("language", "")
        code = data.get("code", "")
        errors = data.get("errors", [])
        output = data.get("output", "")
        file_name = data.get("fileName", "") or data.get("file_name", "")

        orchestrator = AIOrchestrator()

        result = orchestrator.guide(
            language=language,
            code=code,
            errors=errors,
            output=output,
            file_name=file_name,
        )

        return JsonResponse(
            {
                "success": True,
                "data": result,
                "response": result.get("response", ""),
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

        print(
            "Guide error:",
            error,
        )

        return JsonResponse(
            {
                "success": False,
                "message": "AI Guide failed.",
            },
            status=500,
        )