import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from orchestrator.orchestrator import AIOrchestrator


@csrf_exempt
def dictate(request):
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
        language = data.get("language", "java")
        project = data.get("project", "") or data.get("task", "") or data.get("requestedProgram", "")
        level = data.get("level", "") or data.get("learningLevel", "") or "beginner"

        if not project.strip():
            return JsonResponse(
                {
                    "success": False,
                    "message": "Project or task description is required.",
                },
                status=400,
            )

        orchestrator = AIOrchestrator()
        result = orchestrator.dictate(
            language=language,
            project=project,
            level=level,
        )

        return JsonResponse(
            {
                "success": True,
                "data": result,
                "requirements": result.get("requirements", []),
                "steps": result.get("steps", []),
                "totalSteps": result.get("totalSteps", 0),
                "language": result.get("language", language),
                "project": result.get("project", project),
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
        print("Dictator view error:", error)
        return JsonResponse(
            {
                "success": False,
                "message": str(error) or "AI Dictator failed to generate plan.",
            },
            status=500,
        )
