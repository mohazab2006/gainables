import Link from "next/link";

export function DonateFloat({ donationUrl }: { donationUrl: string }) {
  return (
    <Link
      href={donationUrl}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-40 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background shadow-[0_18px_50px_rgba(10,10,10,0.18)] transition hover:opacity-85"
    >
      Donate
    </Link>
  );
}
