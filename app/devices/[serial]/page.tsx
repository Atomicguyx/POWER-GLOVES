import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RobotArmScene from "@/components/RobotArmScene";

export default async function DevicePage({
  params,
}: {
  params: { serial: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const device = await prisma.device.findUnique({ where: { serial: params.serial } });

  if (!device || device.ownerId !== session.user.id) {
    redirect("/dashboard");
  }

  return <RobotArmScene channelName={`glove-${device.serial}`} />;
}
