import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gainables.example"),
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
  },
  twitter: {
    card: "summary_large_image",
    title: "Ride for Mental Health | Gainables",
    description:
      "Support the fundraiser, track the route, and stay close to the campaign as riders move from Ottawa to Montreal.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
