import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BulkCreateDevicesForm from "@/components/BulkCreateDevicesForm";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  const [unclaimedCount, totalCount, recentDevices] = await Promise.all([
    prisma.device.count({ where: { ownerId: null } }),
    prisma.device.count(),
    prisma.device.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
      include: { owner: { select: { email: true } } },
    }),
  ]);

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "48px 24px",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Admin — device provisioning</h1>
      <p style={{ color: "#aaa", fontSize: 13 }}>
        {totalCount} devices total, {unclaimedCount} unclaimed.
      </p>

      <h2 style={{ marginTop: 32, fontSize: 18 }}>Bulk-create serials</h2>
      <BulkCreateDevicesForm />

      <h2 style={{ marginTop: 32, fontSize: 18 }}>Recent devices</h2>
      <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", color: "#888" }}>
            <th style={{ padding: "4px 8px" }}>Serial</th>
            <th style={{ padding: "4px 8px" }}>Owner</th>
            <th style={{ padding: "4px 8px" }}>Created</th>
          </tr>
        </thead>
        <tbody>
          {recentDevices.map((d) => (
            <tr key={d.id} style={{ borderTop: "1px solid #222" }}>
              <td style={{ padding: "4px 8px" }}>{d.serial}</td>
              <td style={{ padding: "4px 8px", color: d.owner ? "#8f8" : "#666" }}>
                {d.owner?.email || "unclaimed"}
              </td>
              <td style={{ padding: "4px 8px", color: "#888" }}>
                {d.createdAt.toISOString().slice(0, 10)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
