import Link from "next/link";
import { getUser, isStaff } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export async function SiteNav() {
  const user = await getUser();
  const staff = isStaff(user);

  return (
    <header className="border-b border-line bg-surface">
      <nav className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
        <Link href="/" className="mr-auto">
          <span className="font-display text-xl text-teal">Michaela Hotels</span>
          <span className="ml-2 text-[10px] uppercase tracking-widest text-muted">
            {staff ? "Staff" : "Guest"}
          </span>
        </Link>

        <Link href="/" className="text-sm text-muted hover:text-teal">
          Availability
        </Link>

        {user && (
          <Link href="/account" className="text-sm text-muted hover:text-teal">
            My bookings
          </Link>
        )}

        {staff && (
          <Link href="/admin" className="text-sm text-muted hover:text-teal">
            Admin
          </Link>
        )}

        {user ? (
          <form action={signOut}>
            <button className="rounded-full border border-line px-4 py-1.5 text-sm text-muted hover:border-teal hover:text-teal">
              Sign out
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted hover:text-teal">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-teal px-4 py-1.5 text-sm text-white hover:opacity-90"
            >
              Register
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
