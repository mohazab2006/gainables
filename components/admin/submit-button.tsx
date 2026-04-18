"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type AdminSubmitButtonProps = {
  idleLabel: string;
  pendingLabel?: string;
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link";
  className?: string;
  disabled?: boolean;
};

export function AdminSubmitButton({
  idleLabel,
  pendingLabel,
  variant = "default",
  className,
  disabled = false,
}: AdminSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant={variant} className={className} disabled={pending || disabled}>
      {pending ? pendingLabel ?? "Saving..." : idleLabel}
    </Button>
  );
}
