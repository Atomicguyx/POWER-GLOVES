import type { Metadata } from "next";
import Script from "next/script";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoboArm Glove Viewer",
  description: "Live 3D viewer for your glove-controlled robot arm, relayed over Ably",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Script
          src="https://cdn.ably.com/lib/ably.min-2.js"
          strategy="beforeInteractive"
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
