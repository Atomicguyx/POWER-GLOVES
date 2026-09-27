import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { consumeToken } from "@/lib/tokens";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const token = body?.token as string | undefined;
  const password = body?.password as string | undefined;

  if (!token || !password || password.length < 8) {
    return NextResponse.json(
      { error: "A valid token and an 8+ character password are required" },
      { status: 400 }
    );
  }

  const email = await consumeToken(token, "PASSWORD_RESET");
  if (!email) {
    return NextResponse.json(
      { error: "That reset link is invalid or has expired" },
      { status: 400 }
    );
  }

  const passwordHash = await hash(password, 10);
  await prisma.user.update({ where: { email }, data: { passwordHash } });

  return NextResponse.json({ message: "Password updated" });
}
