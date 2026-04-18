"use server";

import { redirect } from "next/navigation";

import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signInAdmin(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();

  if (!email || !hasSupabaseEnv()) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/admin`,
    },
  });

  redirect("/admin");
}

export async function signOutAdmin() {
  if (!hasSupabaseEnv()) {
    redirect("/admin");
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  redirect("/admin");
}
