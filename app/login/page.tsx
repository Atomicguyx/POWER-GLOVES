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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main style={{ maxWidth: 360, margin: "80px auto", color: "white", fontFamily: "sans-serif" }}>
      <h1>Log in</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />
        {error && <p style={{ color: "#f88", fontSize: 13 }}>{error}</p>}
        <button type="submit" style={buttonStyle}>
          Log in
        </button>
      </form>
      <p style={{ marginTop: 16, fontSize: 13 }}>
        No account?{" "}
        <Link href="/signup" style={{ color: "#6fe0ff" }}>
          Sign up
        </Link>
      </p>
      <p style={{ marginTop: 8, fontSize: 13 }}>
        <Link href="/forgot-password" style={{ color: "#6fe0ff" }}>
          Forgot password?
        </Link>
      </p>
    </main>
  );
}
