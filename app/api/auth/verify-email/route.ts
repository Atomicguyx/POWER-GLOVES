import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { consumeToken } from "@/lib/tokens";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const appUrl = process.env.APP_URL || new URL(req.url).origin;

  if (!token) {
    return NextResponse.redirect(`${appUrl}/dashboard?verify=missing`);
  }

  const email = await consumeToken(token, "EMAIL_VERIFY");
  if (!email) {
    return NextResponse.redirect(`${appUrl}/dashboard?verify=invalid`);
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });

  return NextResponse.redirect(`${appUrl}/dashboard?verify=success`);
}
