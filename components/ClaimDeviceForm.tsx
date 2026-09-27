"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function ClaimDeviceForm() {
  const [serial, setSerial] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/devices/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serial, name }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong");
      return;
    }

    setSerial("");
    setName("");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 320 }}
    >
      <input
        placeholder="Device serial (e.g. RA-0001)"
        value={serial}
        onChange={(e) => setSerial(e.target.value)}
        required
        style={{ padding: 8, borderRadius: 6, border: "1px solid #333", background: "#111", color: "white" }}
      />
      <input
        placeholder="Nickname (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: 8, borderRadius: 6, border: "1px solid #333", background: "#111", color: "white" }}
      />
      {error && <p style={{ color: "#f88", fontSize: 13 }}>{error}</p>}
      <button
        type="submit"
        disabled={loading}
        style={{ padding: 10, borderRadius: 6, background: "#ff8844", border: "none", fontWeight: "bold", cursor: "pointer" }}
      >
        {loading ? "Registering..." : "Register device"}
      </button>
    </form>
  );
}
