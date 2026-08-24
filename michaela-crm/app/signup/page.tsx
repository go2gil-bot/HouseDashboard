"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signUp } from "@/app/auth/actions";

export default function SignupPage() {
  const [error, action, pending] = useActionState(signUp, null);
  const params = useSearchParams();
  const next = params.get("next") ?? "/account";
  const awaitingConfirmation = params.get("confirm") === "1";

  if (awaitingConfirmation) {
    return (
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-3xl text-teal">Check your inbox</h1>
        <p className="mt-3 text-muted">
          Your account was created. Click the confirmation link we emailed you,
          then sign in.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full bg-teal px-5 py-2.5 text-white"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl text-teal">Create an account</h1>
      <p className="mt-2 text-sm text-muted">
        A guest profile is created automatically and linked to your bookings.
      </p>

      <form action={action} className="mt-8 space-y-4">
        <input type="hidden" name="next" value={next} />

        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" name="first_name" required />
          <Field label="Last name" name="last_name" required />
        </div>
        <Field
          label="Email"
          name="email"
          type="email"
          required
          placeholder="you@gmail.com"
        />
        <Field
          label="Password"
          name="password"
          type="password"
          minLength={8}
          required
        />

        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" name="marketing_opt_in" />
          Send me offers from Michaela Hotels
        </label>

        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            <p>{error}</p>
            {error.toLowerCase().includes("invalid") && (
              <p className="mt-1 text-red-600">
                Supabase rejects addresses whose domain has no real mail server —
                including example.com. Use a live address.
              </p>
            )}
          </div>
        )}

        <button
          disabled={pending}
          className="w-full rounded-full bg-teal px-4 py-2.5 text-white disabled:opacity-60"
        >
          {pending ? "Creating…" : "Register"}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Already registered?{" "}
        <Link href="/login" className="text-teal underline">
          Sign in
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
