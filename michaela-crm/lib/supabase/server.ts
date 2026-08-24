import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — the middleware refreshes the
            // session instead, so this is safe to ignore.
          }
        },
      },
    },
  );
}

/** The signed-in user, or null. Always verified against the auth server. */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Staff is carried in app_metadata, which only the service role can write.
 * Never read this from user_metadata — guests can edit that themselves.
 */
export function isStaff(user: User | null) {
  return user?.app_metadata?.role === "staff";
}
