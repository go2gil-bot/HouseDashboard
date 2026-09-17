import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { StatusPill, TierBadge } from "@/components/pills";
import { t } from "@/lib/i18n";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("id, first_name, last_name, email, loyalty_tier, loyalty_points")
    .eq("user_id", user.id)
    .maybeSingle();

  // RLS already hides other guests' bookings, but a staff member is allowed to
  // see everything — and this page is the personal view, so scope it explicitly.
  const { data: bookings } = customer
    ? await supabase
        .from("bookings")
        .select(
          "id, booking_reference, check_in, check_out, guests, status, total_amount, hotels(name, city), rooms(room_type, room_number, image_url)",
        )
        .eq("customer_id", customer.id)
        .order("check_in", { ascending: false })
    : { data: null };

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      {params.booked && (
        <p className="mb-6 rounded-xl bg-teal-soft px-4 py-3 text-sm text-teal">
          {t.bookingCreated}
        </p>
      )}
      {params.error && (
        <p className="mb-6 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger-ink">
          {params.error}
        </p>
      )}

      <h1 className="text-3xl text-teal" dir="auto">
        {customer ? `${customer.first_name} ${customer.last_name}` : t.myAccount}
      </h1>
      <p className="mt-1 flex items-center gap-3 text-sm text-muted">
        <bdi>{user.email}</bdi>
        {customer && (
          <>
            <TierBadge tier={customer.loyalty_tier} />
            <span>
              <bdi className="tabular-nums">
                {customer.loyalty_points.toLocaleString()}
              </bdi>{" "}
              {t.points}
            </span>
          </>
        )}
      </p>

      <h2 className="mt-10 text-xl text-teal">{t.myBookings}</h2>
      {!bookings?.length && (
        <p className="mt-3 text-sm text-muted">
          {t.nothingBooked}{" "}
          <Link href="/" className="text-teal underline">
            {t.searchAvailability}
          </Link>
        </p>
      )}

      <div className="mt-4 space-y-3">
        {bookings?.map((b) => {
          const hotel = b.hotels as unknown as { name: string; city: string };
          const room = b.rooms as unknown as {
            room_type: string;
            room_number: string;
            image_url: string;
          } | null;
          return (
            <article
              key={b.id}
              className="flex gap-4 overflow-hidden rounded-2xl border border-line bg-surface"
            >
              {room && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={room.image_url}
                  alt={room.room_type}
                  className="hidden w-40 shrink-0 object-cover sm:block"
                />
              )}
              <div className="flex-1 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <bdi className="font-mono text-xs text-muted">
                    {b.booking_reference}
                  </bdi>
                  <StatusPill status={b.status} />
                </div>
                <h3 className="mt-1 text-lg text-teal" dir="auto">
                  {hotel?.name}
                </h3>
                <p className="text-sm text-muted">
                  <bdi dir="auto">{room?.room_type}</bdi>{" "}
                  <bdi>#{room?.room_number}</bdi> ·{" "}
                  <bdi dir="ltr" className="tabular-nums">
                    {b.check_in} → {b.check_out}
                  </bdi>{" "}
                  · {t.guestCount(b.guests)}
                </p>
                <p className="mt-1 text-sm font-medium">
                  <bdi className="tabular-nums">€{b.total_amount}</bdi>
                </p>
              </div>
            </article>
          );
        })}
      </div>

    </div>
  );
}
