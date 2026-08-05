import crypto from "crypto";

export function signToken(token: string): string {
  const secret = process.env.BETTER_AUTH_SECRET || "";
  const signature = crypto
    .createHmac("sha256", secret)
    .update(token)
    .digest("base64");
  return `${token}.${signature}`;
}

export function parseSessionToken(cookieValue: string | undefined): string {
  if (!cookieValue) return "";
  return cookieValue.split(".")[0];
}
