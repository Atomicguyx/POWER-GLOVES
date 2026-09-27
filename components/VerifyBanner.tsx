"use client";

import { useState } from "react";

export default function VerifyBanner({ verified }: { verified: boolean }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (verified) return null;

  async function handleResend() {
    setLoading(true);
    await fetch("/api/auth/resend-verification", { method: "POST" });
    setLoading(false);
    setSent(true);
  }

  return (
    <div
      style={{
        background: "#332a10",
        border: "1px solid #6b5620",
        padding: "10px 14px",
        borderRadius: 8,
        marginTop: 16,
        fontSize: 13,
      }}
    >
      Your email isn&apos;t verified yet — you&apos;ll need to verify before registering a
      device.{" "}
      {sent ? (
        <span style={{ color: "#8f8" }}>Verification email sent — check your inbox.</span>
      ) : (
        <button
          onClick={handleResend}
          disabled={loading}
          style={{
            marginLeft: 6,
            background: "transparent",
            color: "#6fe0ff",
            border: "none",
            cursor: "pointer",
            textDecoration: "underline",
            fontSize: 13,
          }}
        >
          {loading ? "Sending..." : "Resend verification email"}
        </button>
      )}
    </div>
  );
}
