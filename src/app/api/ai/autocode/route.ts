import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("========== NEXT AUTO CODE ==========");
    console.log(body);

    const response = await fetch(
      "http://127.0.0.1:8000/api/ai/autocode/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const result = await response.json();

    console.log(
      "========== DJANGO AUTO CODE RESPONSE =========="
    );
    console.log(result);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            result?.message ||
            "Auto Code backend request failed.",
        },
        {
          status: response.status,
        }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "Next Auto Code API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to connect to the Auto Code backend.",
      },
      {
        status: 500,
      }
    );
  }
}