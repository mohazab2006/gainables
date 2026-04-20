import type { Metadata } from "next";
import { Inter, Instrument_Serif, Anton } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import { getSiteUrl } from "@/lib/env";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const metadataBase = new URL(getSiteUrl());

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Ride for Mental Health | Gainables",
    template: "%s | Ride for Mental Health",
  },
  description:
    "Ride for Mental Health — a community-driven initiative from Gainables during Mental Health Month. Cycling Ottawa to Montreal to raise awareness and funds, with live tracking, donations, and sponsor partners.",
  applicationName: "Ride for Mental Health",
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Ride for Mental Health | Gainables",
    description:
      "A community-driven initiative from Gainables during Mental Health Month. Follow the Ottawa to Montreal ride, support the cause, and stay close in real time.",
    type: "website",
    url: metadataBase,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Ride for Mental Health by Gainables",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ride for Mental Health | Gainables",
    description:
      "Support the cause, track the ride, and stay close to the campaign as the Gainables team moves from Ottawa to Montreal.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${instrumentSerif.variable} ${anton.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
