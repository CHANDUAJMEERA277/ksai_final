import os
import requests

from dotenv import load_dotenv


load_dotenv()


OLLAMA_URL = os.getenv(
    "OLLAMA_URL",
    "http://localhost:11434",
)


QWEN_MODEL = os.getenv(
    "QWEN_MODEL",
    "deepseek-coder:6.7b",
)


GUIDE_MODEL = os.getenv(
    "GUIDE_MODEL",
    "deepseek-coder:6.7b",
)


def generate_qwen_response(
    prompt: str,
    history=None,
    system_prompt=None,
    model=None,
):
    """
    Generate a response using an Ollama-hosted coding model.

    model:
        Optional model override.

    system_prompt:
        Optional system-level instruction.
    """

    selected_model = model or QWEN_MODEL

    messages = []


    # =====================================================
    # SYSTEM PROMPT
    # =====================================================

    if system_prompt:

        messages.append({
            "role": "system",
            "content": system_prompt,
        })


    # =====================================================
    # PREVIOUS CONVERSATION
    # =====================================================

    if history:

        for item in history:

            role = item.get(
                "role"
            )

            content = item.get(
                "content"
            )

            if role in [
                "user",
                "assistant",
            ] and content:

                messages.append({
                    "role": role,
                    "content": content,
                })


    # =====================================================
    # CURRENT REQUEST
    # =====================================================

    messages.append({
        "role": "user",
        "content": prompt,
    })


    # =====================================================
    # DEBUG
    # =====================================================

    print()
    print("========== OLLAMA REQUEST ==========")
    print("URL:", OLLAMA_URL)
    print("MODEL:", selected_model)
    print("MESSAGES:", len(messages))
    print("====================================")


    # =====================================================
    # OLLAMA REQUEST
    # =====================================================

    response = requests.post(

        f"{OLLAMA_URL}/api/chat",

        json={

            "model":
                selected_model,

            "messages":
                messages,

            "stream":
                False,

            "options": {

                "temperature":
                    0.2,

                "num_predict":
                    220,
            },

            "keep_alive":
                "10m",
        },

        timeout=180,
    )


    # =====================================================
    # ERROR HANDLING
    # =====================================================

    try:

        response.raise_for_status()

    except requests.exceptions.RequestException as error:

        print()
        print("========== OLLAMA ERROR ==========")
        print("URL:", OLLAMA_URL)
        print("MODEL:", selected_model)
        print("ERROR:", error)

        if response is not None:

            print(
                "STATUS:",
                response.status_code,
            )

            print(
                "RESPONSE:",
                response.text,
            )

        print(
            "================================="
        )

        raise


    # =====================================================
    # RESPONSE
    # =====================================================

    result = response.json()


    print()
    print("========== OLLAMA RESPONSE ==========")
    print("MODEL:", selected_model)
    print(
        "Response received:",
        bool(result),
    )
    print("=====================================")


    return result[
        "message"
    ][
        "content"
    ]