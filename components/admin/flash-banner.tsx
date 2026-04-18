type AdminFlashBannerProps = {
  message: string | null;
  type: string | null;
  className?: string;
};

export function AdminFlashBanner({ message, type, className }: AdminFlashBannerProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={`${className ?? ""} rounded-[1.25rem] border px-5 py-4 text-sm ${
        type === "error" ? "border-destructive/30 bg-destructive/5 text-destructive" : "border-border bg-background text-foreground"
      }`.trim()}
    >
      {message}
    </div>
  );
}
