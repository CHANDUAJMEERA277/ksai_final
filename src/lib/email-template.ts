export type OtpEmailPurpose = "signup" | "reset-password";

export function buildOtpEmailHtml({
  otp,
  purpose,
  expiresInMinutes = 10,
  recipientName,
}: {
  otp: string;
  purpose: OtpEmailPurpose;
  expiresInMinutes?: number;
  recipientName?: string;
}) {
  const title = purpose === "reset-password" ? "Reset your password" : "Verify your email";
  const heading = purpose === "reset-password" ? "Reset your password" : "Welcome to KnowledgeStream AI";
  const bodyCopy =
    purpose === "reset-password"
      ? "We received a request to reset the password for your KnowledgeStream AI account."
      : "Thanks for joining KnowledgeStream AI. Use the verification code below to continue creating your account.";

  return `
    <div style="font-family: Inter, Arial, sans-serif; background:#07111f; padding:24px; color:#f8fafc;">
      <div style="max-width:620px; margin:0 auto; background:linear-gradient(135deg, #0f172a 0%, #111827 100%); border:1px solid rgba(255,255,255,0.08); border-radius:24px; overflow:hidden; box-shadow:0 20px 60px rgba(8,15,30,0.35);">
        <div style="background:linear-gradient(90deg, #2563eb 0%, #7c3aed 50%, #06b6d4 100%); padding:24px 28px;">
          <div style="font-size:12px; letter-spacing:0.24em; text-transform:uppercase; color:rgba(248,250,252,0.8);">KnowledgeStream AI</div>
          <h1 style="margin:8px 0 0; font-size:28px; color:#ffffff;">${title}</h1>
        </div>
        <div style="padding:28px;">
          <p style="margin:0 0 12px; font-size:16px; color:#e2e8f0;">Hi${recipientName ? ` ${recipientName}` : " there"},</p>
          <p style="margin:0 0 18px; font-size:15px; line-height:1.7; color:#cbd5e1;">${bodyCopy}</p>
          <div style="margin:24px 0; padding:20px 24px; border:1px solid rgba(34,211,238,0.25); border-radius:18px; background:rgba(6,182,212,0.12); text-align:center;">
            <div style="font-size:12px; letter-spacing:0.22em; text-transform:uppercase; color:#7dd3fc; margin-bottom:10px;">Your verification code</div>
            <div style="font-size:34px; font-weight:700; letter-spacing:0.35em; color:#ffffff;">${otp}</div>
          </div>
          <p style="margin:0 0 10px; font-size:14px; color:#94a3b8;">This code expires in ${expiresInMinutes} minutes for your security.</p>
          <p style="margin:0 0 6px; font-size:13px; color:#64748b;">Please do not share this code with anyone.</p>
        </div>
        <div style="padding:0 28px 28px; color:#64748b; font-size:12px; line-height:1.6;">
          <div style="border-top:1px solid rgba(255,255,255,0.08); padding-top:16px;">
            <strong style="color:#94a3b8;">KnowledgeStream AI</strong><br />
            Secure learning, simplified.
          </div>
        </div>
      </div>
    </div>
  `;
}

export function buildOtpEmailText({
  otp,
  purpose,
  expiresInMinutes = 10,
}: {
  otp: string;
  purpose: OtpEmailPurpose;
  expiresInMinutes?: number;
}) {
  const title = purpose === "reset-password" ? "Reset your password" : "Verify your email";
  return `${title}\n\nUse the following verification code to continue: ${otp}\n\nThis code expires in ${expiresInMinutes} minutes. Please do not share it with anyone.\n\nKnowledgeStream AI`;
}

export async function sendOtpEmail({
  to,
  otp,
  purpose,
}: {
  to: string;
  otp: string;
  purpose: OtpEmailPurpose;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  if (!apiKey) {
    console.log(`[EMAIL] OTP email template ready for ${to}. Configure RESEND_API_KEY to send it.`);
    return { ok: false, reason: "missing-provider" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [to],
      subject: purpose === "reset-password" ? "Reset your password – KnowledgeStream AI" : "Verify your email – KnowledgeStream AI",
      html: buildOtpEmailHtml({ otp, purpose }),
      text: buildOtpEmailText({ otp, purpose }),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[EMAIL] Failed to send OTP email:", errorText);
    return { ok: false, reason: "send-failed" };
  }

  return { ok: true, reason: "sent" };
}
