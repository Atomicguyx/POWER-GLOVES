import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (user.emailVerified) {
    return NextResponse.json({ message: "Already verified" });
  }

  const token = await createToken(user.email, "EMAIL_VERIFY", 24 * 60 * 60 * 1000);
  await sendVerificationEmail(user.email, token);

  return NextResponse.json({ message: "Verification email sent" });
}
