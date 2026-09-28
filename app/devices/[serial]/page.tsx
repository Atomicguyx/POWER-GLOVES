import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RobotArmScene from "@/components/RobotArmScene";

export default async function DevicePage({
  params,
}: {
  params: Promise<{ serial: string }>;
}) {
  const { serial } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const device = await prisma.device.findUnique({ where: { serial } });

  // Show a clear message instead of silently bouncing back to the
  // dashboard, so it's obvious why a device page didn't open.
  if (!device || device.ownerId !== session.user.id) {
    return (
      <main
        style={{
          maxWidth: 480,
          margin: "80px auto",
          padding: "0 24px",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <h1 style={{ fontSize: 20 }}>Device not available</h1>
        <p style={{ color: "#aaa", fontSize: 14 }}>
          {!device
            ? `No device with serial "${serial}" exists.`
            : `The device "${serial}" is not registered to your account.`}
        </p>
        <Link href="/dashboard" style={{ color: "#6fe0ff", fontSize: 14 }}>
          Back to dashboard
        </Link>
      </main>
    );
  }

  return <RobotArmScene channelName={`glove-${device.serial}`} />;
}
