import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(
      "http://127.0.0.1:8000/api/ai/chat/",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    return NextResponse.json(
      data,
      {
        status: response.status,
      }
    );

  } catch (error) {

    console.error(
      "CodeXAI Chat API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to connect to CodeXAI backend.",
      },
      {
        status: 500,
      }
    );
  }
}