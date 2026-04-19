"use client";

import { usePathname } from "next/navigation";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

/**
 * Chrome (header + footer) is hidden on the landing page to keep it
 * cinematic and focused. Inner pages keep the full nav experience.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (isHome) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
