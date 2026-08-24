"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "@/app/auth/actions";

export default function LoginPage() {
  const [error, action, pending] = useActionState(signIn, null);
  const params = useSearchParams();
  const next = params.get("next") ?? "/account";

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl text-teal">Sign in</h1>
      <p className="mt-2 text-sm text-muted">
        Guests see their own bookings. Staff accounts also get the admin console.
      </p>

      <form action={action} className="mt-8 space-y-4">
        <input type="hidden" name="next" value={next} />
        <Field label="Email" name="email" type="email" required />
        <Field label="Password" name="password" type="password" required />

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          disabled={pending}
          className="w-full rounded-full bg-teal px-4 py-2.5 text-white disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        No account?{" "}
        <Link href="/signup" className="text-teal underline">
          Register
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wide text-muted">{label}</span>
      <input
        {...props}
        className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 outline-none focus:border-teal"
      />
    </label>
  );
}
