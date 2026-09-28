import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM || "RoboArm <onboarding@resend.dev>";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

// Created lazily so the build doesn't need RESEND_API_KEY — it's only
// required at the moment an email is actually sent.
function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return new Resend(key);
}

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${APP_URL}/api/auth/verify-email?token=${token}`;
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Verify your RoboArm account",
    html: `<p>Welcome! Click below to verify your email address:</p>
           <p><a href="${url}">${url}</a></p>
           <p>This link expires in 24 hours. If you didn't create an account, ignore this email.</p>`,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${APP_URL}/reset-password?token=${token}`;
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Reset your RoboArm password",
    html: `<p>Click below to choose a new password:</p>
           <p><a href="${url}">${url}</a></p>
           <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>`,
  });
}
