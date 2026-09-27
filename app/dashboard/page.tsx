import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ClaimDeviceForm from "@/components/ClaimDeviceForm";
import SignOutButton from "@/components/SignOutButton";
import VerifyBanner from "@/components/VerifyBanner";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { verify?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { devices: { orderBy: { createdAt: "desc" } } },
  });
  if (!user) redirect("/login");

  return (
    <main
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "48px 24px",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Your gloves</h1>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {user.role === "ADMIN" && (
            <Link href="/admin" style={{ color: "#6fe0ff", fontSize: 13 }}>
              Admin
            </Link>
          )}
          <SignOutButton />
        </div>
      </div>

      {searchParams.verify === "success" && (
        <p style={{ color: "#8f8", fontSize: 13, marginTop: 8 }}>Email verified — thanks!</p>
      )}
      {searchParams.verify === "invalid" && (
        <p style={{ color: "#f88", fontSize: 13, marginTop: 8 }}>
          That verification link is invalid or has expired.
        </p>
      )}

      <VerifyBanner verified={!!user.emailVerified} />

      {user.devices.length === 0 ? (
        <p style={{ color: "#aaa", marginTop: 16 }}>
          No devices registered yet. Enter the serial number printed on your unit below.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, marginTop: 16 }}>
          {user.devices.map((d) => (
            <li key={d.id} style={{ marginBottom: 12 }}>
              <Link href={`/devices/${d.serial}`} style={{ color: "#6fe0ff" }}>
                {d.name || d.serial}
              </Link>
              <span style={{ color: "#888", marginLeft: 8, fontSize: 12 }}>{d.serial}</span>
            </li>
          ))}
        </ul>
      )}

      <h2 style={{ marginTop: 32, fontSize: 18 }}>Register a new device</h2>
      <ClaimDeviceForm />
    </main>
  );
}
