import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch("http://127.0.0.1:8000/api/ai/dictate/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get("content-type") || "";
    let result;
    if (contentType.includes("application/json")) {
      result = await response.json();
    } else {
      const text = await response.text();
      result = { success: false, message: text || "Invalid response from AI Dictator backend." };
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: result?.message || `Dictator backend request failed with status ${response.status}.`,
        },
        {
          status: response.status,
        }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Next Dictator API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Unable to connect to Dictator backend.",
      },
      {
        status: 502,
      }
    );
  }
}
