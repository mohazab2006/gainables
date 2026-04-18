"use server";

import { redirect } from "next/navigation";

import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signInAdmin(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    redirect(
      `/admin?type=error&message=${encodeURIComponent("Enter an email address to request a magic link.")}`,
    );
  }

  if (!hasSupabaseEnv()) {
    redirect(
      `/admin?type=error&message=${encodeURIComponent("Supabase isn't configured yet — sign-in is disabled.")}`,
    );
  }

  const supabase = await createSupabaseServerClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/admin`,
    },
  });

  if (error) {
    redirect(
      `/admin?type=error&message=${encodeURIComponent("Couldn't send the magic link. Double-check the email and try again.")}`,
    );
  }

  redirect(
    `/admin?type=success&message=${encodeURIComponent("Magic link sent — check your inbox to finish signing in.")}`,
  );
}

export async function signOutAdmin() {
  if (!hasSupabaseEnv()) {
    redirect("/admin");
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  redirect("/admin");
}
