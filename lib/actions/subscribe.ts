"use server";

import { createHash } from "node:crypto";

import { updateTag } from "next/cache";
import { headers } from "next/headers";
import { Resend } from "resend";
import { z } from "zod";

import { CACHE_TAGS } from "@/lib/cache-tags";
import { hasSupabaseAdminEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type SubscribeActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const subscribeSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  company: z.string().trim().max(0).optional(),
});

const RATE_LIMIT_WINDOW_MS = 30_000;

declare global {
  // eslint-disable-next-line no-var
  var __subscribeRateLimit__: Map<string, number> | undefined;
}

export async function subscribeAction(_: SubscribeActionState, formData: FormData): Promise<SubscribeActionState> {
  const result = subscribeSchema.safeParse({
    email: formData.get("email"),
    company: formData.get("company"),
  });

  if (!result.success) {
    return {
      status: "error",
      message: result.error.issues[0]?.message ?? "Unable to process signup.",
    };
  }

  if (result.data.company) {
    return {
      status: "success",
      message: "Thanks. You're on the list.",
    };
  }

  const requestHeaders = await headers();
  const fingerprint = buildRequestFingerprint(requestHeaders);

  if (isRateLimited(fingerprint)) {
    return {
      status: "error",
      message: "Please wait a few seconds before submitting again.",
    };
  }

  if (hasSupabaseAdminEnv()) {
    try {
      const supabase = createSupabaseAdminClient();
      const { error } = await supabase.from("subscribers").upsert(
        {
          email: result.data.email,
          source: fingerprint ? `website:${fingerprint}` : "website",
        },
        { onConflict: "email" },
      );

      if (error) {
        return {
          status: "error",
          message: "Signup is configured, but the subscriber record could not be saved.",
        };
      }

      updateTag(CACHE_TAGS.subscribers);
      await sendConfirmationEmail(result.data.email);
    } catch {
      return {
        status: "error",
        message: "Signup is configured, but the subscriber record could not be saved.",
      };
    }
  }

  return {
    status: "success",
    message: hasSupabaseAdminEnv()
      ? "Thanks. You're subscribed for campaign updates."
      : "Thanks. The form is ready and will start storing signups once Supabase is connected.",
  };
}

function buildRequestFingerprint(requestHeaders: Headers) {
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const userAgent = requestHeaders.get("user-agent") ?? "";
  const input = `${ip}|${userAgent}`.trim();

  if (!input) {
    return null;
  }

  return createHash("sha256").update(input).digest("hex").slice(0, 16);
}

function isRateLimited(fingerprint: string | null) {
  if (!fingerprint) {
    return false;
  }

  const store = (globalThis.__subscribeRateLimit__ ??= new Map<string, number>());
  const now = Date.now();
  const previous = store.get(fingerprint);

  if (previous && now - previous < RATE_LIMIT_WINDOW_MS) {
    return true;
  }

  store.set(fingerprint, now);

  for (const [key, timestamp] of store.entries()) {
    if (now - timestamp >= RATE_LIMIT_WINDOW_MS) {
      store.delete(key);
    }
  }

  return false;
}

async function sendConfirmationEmail(email: string) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return;
  }

  const resend = new Resend(apiKey);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Ride for Mental Health <onboarding@resend.dev>",
    to: email,
    subject: "You're in for Ride for Mental Health updates",
    text: [
      "Thanks for subscribing to Ride for Mental Health updates.",
      "We'll send key campaign and ride-day moments as they happen.",
      `Track the ride: ${siteUrl}/track`,
      `Donate: ${siteUrl}/donate`,
    ].join("\n\n"),
  });
}
