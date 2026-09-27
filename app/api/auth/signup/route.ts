import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = body?.email as string | undefined;
  const password = body?.password as string | undefined;
  const name = body?.name as string | undefined;

  if (!email || !password || password.length < 8) {
    return NextResponse.json(
      { error: "Email and an 8+ character password are required" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with that email already exists" },
      { status: 409 }
    );
  }

  const passwordHash = await hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
  });

  // Best-effort: don't fail signup if the email provider hiccups — the
  // user can always hit "resend verification" from the dashboard.
  try {
    const token = await createToken(email, "EMAIL_VERIFY", 24 * 60 * 60 * 1000);
    await sendVerificationEmail(email, token);
  } catch (err) {
    console.error("Failed to send verification email", err);
  }

  return NextResponse.json({ id: user.id, email: user.email });
}
