import "server-only";

import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAllowedAdminEmail } from "@/lib/admin/allowlist";

export async function getAdminSession() {
  if (!hasSupabaseEnv()) {
    return {
      status: "unconfigured" as const,
      user: null,
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "anonymous" as const,
      user: null,
    };
  }

  if (!isAllowedAdminEmail(user.email)) {
    return {
      status: "forbidden" as const,
      user,
    };
  }

  return {
    status: "authorized" as const,
    user,
  };
}
