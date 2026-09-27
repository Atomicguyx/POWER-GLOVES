"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      style={{
        background: "transparent",
        color: "#aaa",
        border: "1px solid #444",
        padding: "6px 12px",
        borderRadius: 6,
        cursor: "pointer",
      }}
    >
      Sign out
    </button>
  );
}
