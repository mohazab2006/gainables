"use server";

import { z } from "zod";

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
      message: "Thanks. You’re on the list.",
    };
  }

  if (hasSupabaseAdminEnv()) {
    try {
      const supabase = createSupabaseAdminClient();
      const { error } = await supabase.from("subscribers").upsert(
        {
          email: result.data.email,
          source: "website",
        },
        { onConflict: "email" },
      );

      if (error) {
        return {
          status: "error",
          message: "Signup is configured, but the subscriber record could not be saved.",
        };
      }
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
      ? "Thanks. You’re subscribed for campaign updates."
      : "Thanks. The form is ready and will start storing signups once Supabase is connected.",
  };
}
