"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

const inputStyle = {
  padding: 10,
  borderRadius: 6,
  border: "1px solid #333",
  background: "#111",
  color: "white",
};
const buttonStyle = {
  padding: 10,
  borderRadius: 6,
  background: "#ff8844",
  border: "none",
  fontWeight: "bold" as const,
  cursor: "pointer",
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    setMessage(data.message || "If that email is registered, a reset link has been sent.");
  }

  return (
    <main style={{ maxWidth: 360, margin: "80px auto", color: "white", fontFamily: "sans-serif" }}>
      <h1>Forgot password</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>
          Send reset link
        </button>
      </form>
      {message && <p style={{ marginTop: 12, fontSize: 13, color: "#8f8" }}>{message}</p>}
      <p style={{ marginTop: 16, fontSize: 13 }}>
        <Link href="/login" style={{ color: "#6fe0ff" }}>
          Back to login
        </Link>
      </p>
    </main>
  );
}
