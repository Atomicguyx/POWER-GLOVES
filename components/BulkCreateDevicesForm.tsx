"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const inputStyle = {
  padding: 8,
  borderRadius: 6,
  border: "1px solid #333",
  background: "#111",
  color: "white",
  flex: 1,
  minWidth: 0,
};

export default function BulkCreateDevicesForm() {
  const [mode, setMode] = useState<"range" | "list">("range");
  const [serialsText, setSerialsText] = useState("");
  const [prefix, setPrefix] = useState("RA-");
  const [start, setStart] = useState(1);
  const [count, setCount] = useState(10);
  const [padding, setPadding] = useState(4);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    const body =
      mode === "list"
        ? { serials: serialsText.split("\n").map((s) => s.trim()).filter(Boolean) }
        : { prefix, start, count, padding };

    const res = await fetch("/api/admin/devices/bulk-create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }

    setResult(`Created ${data.created}, skipped ${data.skipped} (already existed).`);
    setSerialsText("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 460 }}>
      <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
        <label style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <input type="radio" checked={mode === "range"} onChange={() => setMode("range")} />
          Generate a range
        </label>
        <label style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <input type="radio" checked={mode === "list"} onChange={() => setMode("list")} />
          Paste a list
        </label>
      </div>

      {mode === "range" ? (
        <>
          <div style={{ display: "flex", gap: 8 }}>
            <input placeholder="Prefix" value={prefix} onChange={(e) => setPrefix(e.target.value)} style={inputStyle} />
            <input
              type="number"
              placeholder="Start"
              value={start}
              onChange={(e) => setStart(Number(e.target.value))}
              style={inputStyle}
            />
            <input
              type="number"
              placeholder="Count"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              style={inputStyle}
            />
            <input
              type="number"
              placeholder="Pad width"
              value={padding}
              onChange={(e) => setPadding(Number(e.target.value))}
              style={inputStyle}
            />
          </div>
          <p style={{ color: "#888", fontSize: 12 }}>
            Will create {count} serials: {prefix}
            {String(start).padStart(padding, "0")} … {prefix}
            {String(start + Math.max(count - 1, 0)).padStart(padding, "0")}
          </p>
        </>
      ) : (
        <textarea
          placeholder={"RA-0001\nRA-0002\nRA-0003"}
          value={serialsText}
          onChange={(e) => setSerialsText(e.target.value)}
          rows={6}
          style={{ ...inputStyle, fontFamily: "monospace" }}
        />
      )}

      {error && <p style={{ color: "#f88", fontSize: 13 }}>{error}</p>}
      {result && <p style={{ color: "#8f8", fontSize: 13 }}>{result}</p>}

      <button
        type="submit"
        disabled={loading}
        style={{ padding: 10, borderRadius: 6, background: "#ff8844", border: "none", fontWeight: "bold", cursor: "pointer" }}
      >
        {loading ? "Creating..." : "Create devices"}
      </button>
    </form>
  );
}
