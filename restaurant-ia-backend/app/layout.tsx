import "./globals.css";
import RegisterSW from "./RegisterSW";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Hostwai — votre standard téléphonique, pris en charge par l'IA",
  description: "Votre standard téléphonique, pris en charge par l'IA — jour et nuit.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "IA Receptionist",
  },
};

export const viewport: Viewport = {
  themeColor: "#2E5EFF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
