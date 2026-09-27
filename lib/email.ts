import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "RoboArm <onboarding@resend.dev>";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${APP_URL}/api/auth/verify-email?token=${token}`;
  await resend.emails.send({
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
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your RoboArm password",
    html: `<p>Click below to choose a new password:</p>
           <p><a href="${url}">${url}</a></p>
           <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>`,
  });
}
