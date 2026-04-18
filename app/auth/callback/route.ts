import { NextResponse, type NextRequest } from "next/server";

import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const next = sanitizeNext(request.nextUrl.searchParams.get("next"));

  if (!hasSupabaseEnv()) {
    return NextResponse.redirect(new URL(next, request.url));
  }

  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL(`/admin?type=error&message=${encodeURIComponent("Missing auth code.")}`, request.url));
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        new URL(`/admin?type=error&message=${encodeURIComponent("Unable to complete admin sign-in.")}`, request.url),
      );
    }
  } catch {
    return NextResponse.redirect(
      new URL(`/admin?type=error&message=${encodeURIComponent("Unable to complete admin sign-in.")}`, request.url),
    );
  }

  return NextResponse.redirect(new URL(next, request.url));
}

function sanitizeNext(next: string | null) {
  if (!next || !next.startsWith("/")) {
    return "/admin";
  }

  return next;
}
