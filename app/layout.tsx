import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TmaProvider } from "@/components/TmaProvider";

export const metadata: Metadata = {
  title: "Location Intelligence Pro — Алматы",
  description: "Геоаналитика для выбора локации бизнеса в Алматы",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
        <script src="https://telegram.org/js/telegram-web-app.js" defer />
      </head>
      <body className="bg-[#08080f] text-[#d1d5db] antialiased">
        <TmaProvider>{children}</TmaProvider>
      </body>
    </html>
  );
}
