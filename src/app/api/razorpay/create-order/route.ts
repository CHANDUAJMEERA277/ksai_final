import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const { amount, currency = "INR", courseId, userEmail } = await req.json();

    if (!amount) {
      return NextResponse.json({ error: "Amount is required." }, { status: 400 });
    }

    const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return NextResponse.json({
        success: true,
        order: {
          id: `order_mock_${Date.now()}`,
          amount: Math.round(amount * 100),
          currency,
        },
        key: "rzp_test_mock_key_id",
        isMock: true,
      });
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const options = {
      amount: Math.round(amount * 100), // convert INR rupees to paise
      currency,
      receipt: `rcpt_${Date.now()}`,
      notes: {
        courseId: courseId || "",
        userEmail: userEmail || "",
      },
    };

    // Create real Razorpay order on Razorpay servers
    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      order,
      key: key_id,
    });
  } catch (error: any) {
    console.error("Razorpay Order Creation Error:", error);
    const errorMsg = error?.error?.description || error?.message || "Failed to create Razorpay order.";
    return NextResponse.json(
      { error: errorMsg, details: error },
      { status: 500 }
    );
  }
}
