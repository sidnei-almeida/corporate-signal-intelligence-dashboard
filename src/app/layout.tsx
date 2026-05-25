import type { Metadata } from "next";
import { JetBrains_Mono, Syne } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import { APP_NAME } from "@/lib/constants";

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: APP_NAME,
  description:
    "Anomaly detection and AI briefings for public company monitoring — market signals, SEC filings, and corporate intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${syne.variable} ${jetbrainsMono.variable} min-h-screen antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
