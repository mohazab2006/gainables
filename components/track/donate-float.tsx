import Link from "next/link";

export function DonateFloat({ donationUrl }: { donationUrl: string }) {
  return (
    <Link
      href={donationUrl}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center justify-center border border-foreground bg-foreground px-6 py-3 text-xs font-medium uppercase tracking-[0.24em] text-background transition-colors duration-200 hover:bg-background hover:text-foreground"
    >
      Donate
    </Link>
  );
}
