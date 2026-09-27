import { NextResponse } from "next/server";
import Ably from "ably";
import type { CapabilityOp } from "ably";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Issues a short-lived Ably token scoped ONLY to the channels of devices
// this signed-in user actually owns — so customer A can never subscribe
// to customer B's glove data, even though they share one Ably app.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ABLY_API_KEY is not configured on the server" },
      { status: 500 }
    );
  }

  const devices = await prisma.device.findMany({
    where: { ownerId: session.user.id },
  });

  if (devices.length === 0) {
    return NextResponse.json(
      { error: "No devices registered to this account yet" },
      { status: 403 }
    );
  }

     const capability: Record<string, CapabilityOp[]> = {};
  for (const device of devices) {
    capability[`glove-${device.serial}`] = ["subscribe"];
  }

  try {
    const client = new Ably.Rest(apiKey);
    const tokenRequest = await client.auth.createTokenRequest({
      clientId: session.user.id,
      capability,
      ttl: 60 * 60 * 1000, // 1 hour
    });
    return NextResponse.json(tokenRequest);
  } catch (err) {
    console.error("Failed to create Ably token request", err);
    return NextResponse.json(
      { error: "Failed to create Ably token request" },
      { status: 500 }
    );
  }
}
