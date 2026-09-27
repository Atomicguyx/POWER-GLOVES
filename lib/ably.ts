"use client";

import Ably from "ably";

let client: Ably.Realtime | null = null;

// Lazily create a single Realtime client for the whole app, authenticated
// via /api/ably-token (which scopes capability to only the channels this
// signed-in user's devices own).
export function getAblyClient(): Ably.Realtime {
  if (!client) {
    client = new Ably.Realtime({ authUrl: "/api/ably-token" });
  }
  return client;
}
