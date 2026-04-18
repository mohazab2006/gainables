import "server-only";

import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/admin/auth";
import { hasSupabaseAdminEnv } from "@/lib/env";

function buildRedirect(base: string, type: "error" | "info", message: string) {
  const params = new URLSearchParams({ type, message });
  return `${base}?${params.toString()}`;
}

export async function requireAuthorizedAdmin(redirectPath = "/admin") {
  const session = await getAdminSession();

  if (session.status === "anonymous") {
    redirect(
      buildRedirect(redirectPath, "info", "Please sign in to access the admin area."),
    );
  }

  if (session.status === "forbidden") {
    redirect(
      buildRedirect(
        redirectPath,
        "error",
        "This email isn't on the admin allowlist.",
      ),
    );
  }

  if (session.status === "unconfigured" || !hasSupabaseAdminEnv()) {
    redirect(
      buildRedirect(
        redirectPath,
        "error",
        "Supabase isn't configured. Set the required environment variables.",
      ),
    );
  }

  if (session.status !== "authorized") {
    redirect(
      buildRedirect(redirectPath, "error", "You don't have access to the admin area."),
    );
  }

  return session.user;
}
