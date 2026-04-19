import type { Metadata } from "next";

import { FaqSection } from "@/components/sections/faq";
import { getFaqs } from "@/lib/content";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Common questions about Ride for Mental Health: where donations go, how to follow the ride, and how sponsors are managed.",
};

export default async function FaqPage() {
  const faqs = await getFaqs();

  return (
    <main className="min-h-screen bg-background pt-24 md:pt-28">
      <FaqSection faqs={faqs} />
    </main>
  );
}
