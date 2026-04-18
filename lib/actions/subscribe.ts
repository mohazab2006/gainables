"use server";

import { z } from "zod";

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

  return {
    status: "success",
    message: "Thanks. The subscribe action is ready for Supabase and Resend wiring.",
  };
}
