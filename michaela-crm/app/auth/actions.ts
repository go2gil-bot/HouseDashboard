"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function signIn(_prev: string | null, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (error) return error.message;

  revalidatePath("/", "layout");
  redirect("/account");
}

export async function signUp(_prev: string | null, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    options: {
      // Display name only. Authorization never reads user_metadata.
      data: {
        first_name: String(formData.get("first_name") ?? ""),
        last_name: String(formData.get("last_name") ?? ""),
        marketing_opt_in: formData.get("marketing_opt_in") === "on",
      },
    },
  });

  if (error) return error.message;

  revalidatePath("/", "layout");
  redirect("/account");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
