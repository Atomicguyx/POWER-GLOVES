"use client";

import type Ably from "ably";

declare global {
  interface Window {
    Ably: typeof Ably;
  }
}

let client: Ably.Realtime | null = null;

export function getAblyClient(): Ably.Realtime {
  if (!client) {
    if (typeof window === "undefined" || !window.Ably) {
      throw new Error(
        "Ably hasn't loaded yet — getAblyClient() must only be called after mount, from a client component."
      );
    }
    client = new window.Ably.Realtime({ authUrl: "/api/ably-token" });
  }
  return client;
}
