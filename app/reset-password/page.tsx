"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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

function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 1500);
  }

  if (!token) {
    return <p style={{ color: "#f88" }}>Missing or invalid reset link.</p>;
  }
  if (done) {
    return <p style={{ color: "#8f8" }}>Password updated — redirecting to login…</p>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <input
        type="password"
        placeholder="New password (8+ characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
        style={inputStyle}
      />
      {error && <p style={{ color: "#f88", fontSize: 13 }}>{error}</p>}
      <button type="submit" style={buttonStyle}>
        Set new password
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main style={{ maxWidth: 360, margin: "80px auto", color: "white", fontFamily: "sans-serif" }}>
      <h1>Reset your password</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <ResetPasswordForm />
      </Suspense>
      <p style={{ marginTop: 16, fontSize: 13 }}>
        <Link href="/login" style={{ color: "#6fe0ff" }}>
          Back to login
        </Link>
      </p>
    </main>
  );
}
