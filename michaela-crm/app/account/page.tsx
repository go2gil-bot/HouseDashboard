import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { StatusPill, TierBadge } from "@/components/pills";

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
        <p className="mb-6 rounded-xl bg-teal-soft px-4 py-3 text-sm">
          Booking created. Front desk will confirm it shortly.
        </p>
      )}
      {params.error && (
        <p className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {params.error}
        </p>
      )}

      <h1 className="text-3xl text-teal">
        {customer ? `${customer.first_name} ${customer.last_name}` : "My account"}
      </h1>
      <p className="mt-1 flex items-center gap-3 text-sm text-muted">
        {user.email}
        {customer && (
          <>
            <TierBadge tier={customer.loyalty_tier} />
            <span>{customer.loyalty_points.toLocaleString()} points</span>
          </>
        )}
      </p>

      <h2 className="mt-10 text-xl text-teal">My bookings</h2>
      {!bookings?.length && (
        <p className="mt-3 text-sm text-muted">
          Nothing booked yet.{" "}
          <Link href="/" className="text-teal underline">
            Search availability
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
                  <span className="font-mono text-xs text-muted">
                    {b.booking_reference}
                  </span>
                  <StatusPill status={b.status} />
                </div>
                <h3 className="mt-1 text-lg text-teal">{hotel?.name}</h3>
                <p className="text-sm text-muted">
                  {room?.room_type} #{room?.room_number} · {b.check_in} →{" "}
                  {b.check_out} · {b.guests} guests
                </p>
                <p className="mt-1 text-sm font-medium">€{b.total_amount}</p>
              </div>
            </article>
          );
        })}
      </div>

    </div>
  );
}
