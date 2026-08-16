from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

import subprocess
import tempfile
import os
import json
import time


@csrf_exempt
def run_code(request):

    if request.method != "POST":
        return JsonResponse(
            {
                "success": False,
                "output": "Only POST requests are allowed."
            },
            status=405,
        )

    try:
        data = json.loads(request.body)

        code = data.get("code", "")

        if not code.strip():
            return JsonResponse(
                {
                    "success": False,
                    "output": "No code provided."
                }
            )

        with tempfile.TemporaryDirectory() as tmpdir:

            java_file = os.path.join(tmpdir, "Main.java")

            with open(java_file, "w", encoding="utf-8") as file:
                file.write(code)

            # Compile Java
            compile_process = subprocess.run(
                ["javac", java_file],
                capture_output=True,
                text=True,
            )

            if compile_process.returncode != 0:
                return JsonResponse(
                    {
                        "success": False,
                        "output": compile_process.stderr,
                        "exitCode": compile_process.returncode,
                    }
                )

            # Execute Java
            start_time = time.perf_counter()

            run_process = subprocess.run(
                ["java", "-cp", tmpdir, "Main"],
                capture_output=True,
                text=True,
            )

            end_time = time.perf_counter()

            execution_time = round(
                (end_time - start_time) * 1000,
                2,
            )

            return JsonResponse(
                {
                    "success": True,
                    "output": run_process.stdout,
                    "executionTime": execution_time,
                    "exitCode": run_process.returncode,
                }
            )

    except Exception as e:
        return JsonResponse(
            {
                "success": False,
                "output": str(e),
                "exitCode": -1,
            },
            status=500,
        )