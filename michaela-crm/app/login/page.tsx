"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "@/app/auth/actions";
import { t } from "@/lib/i18n";

export default function LoginPage() {
  const [error, action, pending] = useActionState(signIn, null);
  const params = useSearchParams();
  const next = params.get("next") ?? "/account";

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl text-teal">{t.signIn}</h1>
      <p className="mt-2 text-sm text-muted">
        {t.loginLead}
      </p>

      <form action={action} className="mt-8 space-y-4">
        <input type="hidden" name="next" value={next} />
        <Field label={t.email} name="email" type="email" required />
        <Field label={t.password} name="password" type="password" required />

        {error && (
          <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger-ink">
            {error}
          </p>
        )}

        <button
          disabled={pending}
          className="w-full rounded-full bg-teal px-4 py-2.5 text-on-teal disabled:opacity-60"
        >
          {pending ? t.signingIn : t.signIn}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        {t.noAccount}{" "}
        <Link href="/signup" className="text-teal underline">
          {t.register}
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
