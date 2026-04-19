import type { Metadata } from "next";
import { Inter, Anton } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import { getSiteUrl } from "@/lib/env";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Anton is the closest free Google Font to the GAINABLES wordmark (heavy condensed grotesque).
// To swap to a licensed face later (e.g. Druk Condensed Super), replace this with localFont and
// repoint the --font-display variable. No other code needs to change.
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
    "A Next.js campaign site for Gainables' Ottawa to Montreal Ride for Mental Health with donations, sponsor visibility, and live ride tracking.",
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
      "Follow the Ottawa to Montreal route, support the fundraiser, and stay current with live ride updates.",
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
      "Support the fundraiser, track the route, and stay close to the campaign as riders move from Ottawa to Montreal.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${anton.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
