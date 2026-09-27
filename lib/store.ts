import { create } from "zustand";

interface GloveFrame {
  pitch: number;
  roll: number;
  yaw: number;
}

interface GloveState extends GloveFrame {
  connected: boolean;
  lastUpdate: number;
  setFrame: (frame: GloveFrame) => void;
  setConnected: (connected: boolean) => void;
}

export const useGloveStore = create<GloveState>((set) => ({
  pitch: 0,
  roll: 0,
  yaw: 0,
  connected: false,
  lastUpdate: 0,
  setFrame: (frame) => set({ ...frame, lastUpdate: Date.now() }),
  setConnected: (connected) => set({ connected }),
}));
