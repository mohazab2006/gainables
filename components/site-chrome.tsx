"use client";

import { usePathname } from "next/navigation";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

/**
 * Home is kept cinematic by hiding the floating header on `/`.
 * The sitemap footer is rendered on every page so navigation stays reachable.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <>
      {isHome ? null : <Header />}
      {children}
      <Footer />
    </>
  );
}
