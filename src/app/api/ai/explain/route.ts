import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("========== NEXT EXPLAIN ==========");
    console.log(body);

    const response = await fetch(
      "http://127.0.0.1:8000/api/ai/explain/",
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
      "========== DJANGO EXPLAIN RESPONSE =========="
    );

    console.log(result);

    return NextResponse.json(result, {
      status: response.status,
    });
  } catch (error) {
    console.error(
      "AI Explain Route Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to connect to Explain backend.",
      },
      {
        status: 500,
      }
    );
  }
}