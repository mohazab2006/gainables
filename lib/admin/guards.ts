import "server-only";

import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/admin/auth";
import { hasSupabaseAdminEnv } from "@/lib/env";

export async function requireAuthorizedAdmin(redirectPath = "/admin") {
  const session = await getAdminSession();

  if (session.status !== "authorized") {
    redirect(`${redirectPath}?status=unauthorized`);
  }

  if (!hasSupabaseAdminEnv()) {
    redirect(`${redirectPath}?status=unconfigured`);
  }

  return session.user;
}
