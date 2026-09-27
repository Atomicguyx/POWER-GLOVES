"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
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

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong");
      return;
    }

    const signInRes = await signIn("credentials", { email, password, redirect: false });
    if (signInRes?.error) {
      router.push("/login");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main style={{ maxWidth: 360, margin: "80px auto", color: "white", fontFamily: "sans-serif" }}>
      <h1>Create an account</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password (8+ characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          style={inputStyle}
        />
        {error && <p style={{ color: "#f88", fontSize: 13 }}>{error}</p>}
        <button type="submit" style={buttonStyle}>
          Sign up
        </button>
      </form>
      <p style={{ marginTop: 16, fontSize: 13 }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: "#6fe0ff" }}>
          Log in
        </Link>
      </p>
    </main>
  );
}
