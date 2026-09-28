"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Message } from "ably";
import { getAblyClient } from "@/lib/ably";
import { useGloveStore } from "@/lib/store";

// Same gains/home-pose values as the firmware's own on-device viewer,
// so the cloud-relayed scene moves identically to the local one.
const GAIN_PITCH = 0.013;
const GAIN_ROLL = 0.013;
const GAIN_YAW = 0.009;
const HOME_SHOULDER = 0.45;
const HOME_ELBOW = -0.55;

function useGloveSubscription(channelName: string) {
  const setFrame = useGloveStore((s) => s.setFrame);
  const setConnected = useGloveStore((s) => s.setConnected);

  useEffect(() => {
    const client = getAblyClient();
    const channel = client.channels.get(channelName);

    const onConnected = () => setConnected(true);
    const onDisconnected = () => setConnected(false);
    client.connection.on("connected", onConnected);
    client.connection.on("disconnected", onDisconnected);
    client.connection.on("suspended", onDisconnected);
    client.connection.on("failed", onDisconnected);

    // Subscribe to every message on the channel rather than a specific
    // event name — the firmware publishes over MQTT, where the Ably
    // bridge doesn't set a message "name" by default.
    const onMessage = (msg: Message) => {
      let raw: unknown = msg.data;
      if (typeof raw === "string") {
        try {
          raw = JSON.parse(raw);
        } catch {
          return;
        }
      }
      const data = raw as Partial<{ pitch: number; roll: number; yaw: number }>;
      if (
        typeof data?.pitch === "number" &&
        typeof data?.roll === "number" &&
        typeof data?.yaw === "number"
      ) {
        setFrame({ pitch: data.pitch, roll: data.roll, yaw: data.yaw });
      }
    };
    channel.subscribe(onMessage);

    return () => {
      channel.unsubscribe(onMessage);
      client.connection.off("connected", onConnected);
      client.connection.off("disconnected", onDisconnected);
      client.connection.off("suspended", onDisconnected);
      client.connection.off("failed", onDisconnected);
    };
  }, [channelName, setFrame, setConnected]);
}

function ArmModel() {
  const baseRef = useRef<THREE.Group>(null);
  const shoulderRef = useRef<THREE.Group>(null);
  const elbowRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const unsub = useGloveStore.subscribe((state) => {
      if (baseRef.current) {
        baseRef.current.rotation.y = THREE.MathUtils.clamp(
          state.yaw * GAIN_YAW,
          -Math.PI * 0.95,
          Math.PI * 0.95
        );
      }
      if (shoulderRef.current) {
        shoulderRef.current.rotation.x = THREE.MathUtils.clamp(
          HOME_SHOULDER + state.pitch * GAIN_PITCH,
          -0.75,
          1.45
        );
      }
      if (elbowRef.current) {
        elbowRef.current.rotation.x = THREE.MathUtils.clamp(
          HOME_ELBOW + state.roll * GAIN_ROLL,
          -1.25,
          0.25
        );
      }
    });
    return unsub;
  }, []);

  return (
    <group ref={baseRef} position={[0, -0.8, 0]}>
      <mesh position={[0, 0.14, 0]} castShadow>
        <cylinderGeometry args={[0.95, 1.05, 0.28, 48]} />
        <meshPhysicalMaterial color="#2c2e3a" metalness={0.95} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.62, 0]} castShadow>
        <cylinderGeometry args={[0.62, 0.72, 0.68, 36]} />
        <meshPhysicalMaterial color="#9a9eae" metalness={0.98} roughness={0.28} clearcoat={0.45} />
      </mesh>
      <group ref={shoulderRef} position={[0, 0.96, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.44, 48, 48]} />
          <meshPhysicalMaterial color="#dd9955" metalness={0.99} roughness={0.12} />
        </mesh>
        <mesh position={[0, 0.82, 0]} castShadow>
          <boxGeometry args={[0.56, 1.28, 0.62]} />
          <meshPhysicalMaterial color="#9a9eae" metalness={0.98} roughness={0.28} />
        </mesh>
        <group ref={elbowRef} position={[0, 1.45, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.42, 48, 48]} />
            <meshPhysicalMaterial color="#dd9955" metalness={0.99} roughness={0.12} />
          </mesh>
          <mesh position={[0, 0.76, 0]} castShadow>
            <boxGeometry args={[0.52, 1.18, 0.58]} />
            <meshPhysicalMaterial color="#9a9eae" metalness={0.98} roughness={0.28} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export default function RobotArmScene({ channelName }: { channelName: string }) {
  useGloveSubscription(channelName);
  const connected = useGloveStore((s) => s.connected);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 10,
          color: "white",
          fontFamily: "monospace",
          fontSize: 13,
          background: "rgba(0,0,0,0.6)",
          padding: "8px 14px",
          borderRadius: 10,
        }}
      >
        {connected ? "🟢 Live — glove connected via Ably" : "🔴 Waiting for glove data..."}
      </div>
      <Canvas shadows camera={{ position: [5, 4, 7], fov: 45 }}>
        <color attach="background" args={["#050510"]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 8, 4]} intensity={1.6} castShadow />
        <ArmModel />
        <gridHelper args={[16, 24, "#88aaff", "#335588"]} position={[0, -0.9, 0]} />
        <OrbitControls target={[0, 1, 0]} />
      </Canvas>
    </div>
  );
}
