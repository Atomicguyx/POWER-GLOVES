"use client";

import { BaseRealtime, WebSocketTransport, FetchRequest } from "ably/modular";
import type Ably from "ably";

let client: Ably.Realtime | null = null;

export function getAblyClient(): Ably.Realtime {
  if (!client) {
    client = new BaseRealtime({
      authUrl: "/api/ably-token",
      plugins: { WebSocketTransport, FetchRequest },
    }) as unknown as Ably.Realtime;
  }
  return client;
}
