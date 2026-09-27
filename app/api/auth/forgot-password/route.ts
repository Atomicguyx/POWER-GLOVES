import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = body?.email as string | undefined;

  // Always return the same response whether or not the email is
  // registered, so this endpoint can't be used to enumerate accounts.
  if (email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      try {
        const token = await createToken(email, "PASSWORD_RESET", 60 * 60 * 1000);
        await sendPasswordResetEmail(email, token);
      } catch (err) {
        console.error("Failed to send password reset email", err);
      }
    }
  }

  return NextResponse.json({
    message: "If that email is registered, a reset link has been sent.",
  });
}
