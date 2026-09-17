"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signUp } from "@/app/auth/actions";
import { t } from "@/lib/i18n";

export default function SignupPage() {
  const [error, action, pending] = useActionState(signUp, null);
  const params = useSearchParams();
  const next = params.get("next") ?? "/account";
  const awaitingConfirmation = params.get("confirm") === "1";

  if (awaitingConfirmation) {
    return (
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-3xl text-teal">{t.checkInbox}</h1>
        <p className="mt-3 text-muted">
          {t.confirmLead}
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full bg-teal px-5 py-2.5 text-on-teal"
        >
          {t.goToSignIn}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl text-teal">{t.createAccount}</h1>
      <p className="mt-2 text-sm text-muted">
        {t.signupLead}
      </p>

      <form action={action} className="mt-8 space-y-4">
        <input type="hidden" name="next" value={next} />

        <div className="grid grid-cols-2 gap-3">
          <Field label={t.firstName} name="first_name" required />
          <Field label={t.lastName} name="last_name" required />
        </div>
        <Field
          label={t.email}
          name="email"
          type="email"
          required
          placeholder="you@gmail.com"
        />
        <Field
          label={t.password}
          name="password"
          type="password"
          minLength={8}
          required
        />

        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" name="marketing_opt_in" />
          {t.marketingOptIn}
        </label>

        {error && (
          <div className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger-ink">
            <p>{error}</p>
            {error.toLowerCase().includes("invalid") && (
              <p className="mt-1 text-danger-ink">
                {t.invalidEmailHelp}
              </p>
            )}
          </div>
        )}

        <button
          disabled={pending}
          className="w-full rounded-full bg-teal px-4 py-2.5 text-on-teal disabled:opacity-60"
        >
          {pending ? t.creating : t.register}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        {t.alreadyRegistered}{" "}
        <Link href="/login" className="text-teal underline">
          {t.signIn}
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
        className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 focus:border-teal"
      />
    </label>
  );
}
