import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_BATCH = 1000;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requester = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!requester || requester.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  let serials: string[] = [];

  if (Array.isArray(body?.serials)) {
    serials = body.serials
      .map((s: unknown) => String(s).trim())
      .filter((s: string) => s.length > 0);
  } else if (
    typeof body?.prefix === "string" &&
    Number.isFinite(body?.start) &&
    Number.isFinite(body?.count)
  ) {
    const { prefix, start, count } = body as {
      prefix: string;
      start: number;
      count: number;
      padding?: number;
    };
    const padding = Number.isFinite(body?.padding) ? Number(body.padding) : 4;

    if (count < 1 || count > MAX_BATCH) {
      return NextResponse.json(
        { error: `count must be between 1 and ${MAX_BATCH}` },
        { status: 400 }
      );
    }
    for (let i = 0; i < count; i++) {
      serials.push(`${prefix}${String(start + i).padStart(padding, "0")}`);
    }
  } else {
    return NextResponse.json(
      { error: "Provide either { serials: string[] } or { prefix, start, count }" },
      { status: 400 }
    );
  }

  if (serials.length === 0) {
    return NextResponse.json({ error: "No serials to create" }, { status: 400 });
  }
  if (serials.length > MAX_BATCH) {
    return NextResponse.json(
      { error: `Cannot create more than ${MAX_BATCH} at once` },
      { status: 400 }
    );
  }

  // Unowned rows (ownerId left null) — a customer claims one later via
  // /api/devices/claim by typing in the serial printed on their unit.
  const result = await prisma.device.createMany({
    data: serials.map((serial) => ({ serial })),
    skipDuplicates: true,
  });

  return NextResponse.json({
    created: result.count,
    skipped: serials.length - result.count,
  });
}
