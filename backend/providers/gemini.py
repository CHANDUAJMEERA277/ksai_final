import os

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


# =========================================================
# GENERAL GEMINI RESPONSE
# =========================================================

def generate_response(prompt: str):

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
    )

    return response.text


# =========================================================
# CODEXAI TEACHING ENGINE
# =========================================================

def generate_teaching_response(
    prompt: str,
    system_instruction: str = "",
):

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            max_output_tokens=1200,
        ),
    )

    return response.text