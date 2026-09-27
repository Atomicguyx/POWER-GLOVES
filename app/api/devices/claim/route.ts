import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// A device row can exist unowned (admin-pre-created ahead of shipping) or
// get created fresh on first claim. Either way, claiming only succeeds if
// the device has no owner yet or is already owned by the requesting user
// — it can never be taken from someone else's account this way.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requester = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!requester) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!requester.emailVerified) {
    return NextResponse.json(
      { error: "Please verify your email before registering a device" },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  const serial = body?.serial as string | undefined;
  const name = body?.name as string | undefined;

  if (!serial || typeof serial !== "string" || serial.trim().length === 0) {
    return NextResponse.json({ error: "Device serial is required" }, { status: 400 });
  }

  const userId = requester.id;
  const existing = await prisma.device.findUnique({ where: { serial } });

  if (existing) {
    if (existing.ownerId && existing.ownerId !== userId) {
      return NextResponse.json(
        { error: "That device is already registered to another account" },
        { status: 409 }
      );
    }
    const updated = await prisma.device.update({
      where: { serial },
      data: { ownerId: userId, name: name || existing.name },
    });
    return NextResponse.json({ device: updated });
  }

  // Not pre-provisioned by an admin — still allowed to self-register so
  // development/testing isn't blocked on the admin flow existing.
  const device = await prisma.device.create({
    data: { serial, ownerId: userId, name: name || serial },
  });
  return NextResponse.json({ device });
}
