import Link from "next/link";
import { getUser, isStaff } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { t } from "@/lib/i18n";

export async function SiteNav() {
  const user = await getUser();
  const staff = isStaff(user);

  return (
    <header className="border-b border-line bg-surface">
      <nav className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
        <Link href="/" className="me-auto">
          <span className="font-display text-xl text-teal">{t.wordmark}</span>
          <span className="ms-2 text-[10px] uppercase tracking-widest text-muted">
            {staff ? t.roleStaff : t.roleGuest}
          </span>
        </Link>

        <Link href="/" className="text-sm text-muted hover:text-teal">
          {t.availability}
        </Link>

        {user && (
          <Link href="/account" className="text-sm text-muted hover:text-teal">
            {t.myBookings}
          </Link>
        )}

        {staff && (
          <Link href="/admin" className="text-sm text-muted hover:text-teal">
            {t.adminLink}
          </Link>
        )}

        {user ? (
          <form action={signOut}>
            <button className="rounded-full border border-line px-4 py-1.5 text-sm text-muted hover:border-teal hover:text-teal">
              {t.signOut}
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted hover:text-teal">
              {t.signIn}
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-teal px-4 py-1.5 text-sm text-on-teal hover:opacity-90"
            >
              {t.register}
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
