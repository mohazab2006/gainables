import "server-only";

import { getSupabasePublishableKey } from "@/lib/env";

export async function getAdminState() {
  const allowedEmails = process.env.ADMIN_ALLOWED_EMAILS;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = getSupabasePublishableKey();

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      title: "Supabase is not configured yet",
      description:
        "Add the public Supabase URL and publishable key to enable auth, content editing, sponsor uploads, and ride updates.",
    };
  }

  if (!allowedEmails) {
    return {
      title: "Allowlist is missing",
      description: "Set ADMIN_ALLOWED_EMAILS so only approved operators can access the admin workflow.",
    };
  }

  return {
    title: "Configuration ready for auth wiring",
    description: "Environment variables are present. Finish the auth flow and CRUD pages to enable the live admin dashboard.",
  };
}
