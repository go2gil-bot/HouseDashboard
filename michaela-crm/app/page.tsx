import { createClient } from "@/lib/supabase/server";
import { createBooking } from "@/app/book/actions";

type Hotel = {
  id: number;
  name: string;
  city: string;
  country: string;
  star_rating: number;
  hero_image_url: string | null;
};

type AvailableRoom = {
  room_id: number;
  hotel_id: number;
  room_number: string;
  room_type: string;
  max_occupancy: number;
  nightly_rate: string;
  image_url: string;
  description: string | null;
  nights: number;
  total_price: string;
};

function isoPlus(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // hotels and rooms are readable without an account
  const { data: hotels } = await supabase
    .from("hotels")
    .select("id, name, city, country, star_rating, hero_image_url")
    .order("id");

  const hotelList = (hotels ?? []) as Hotel[];
  const hotelId = Number(params.hotel ?? hotelList[0]?.id ?? 1);
  const from = params.from ?? isoPlus(14);
  const to = params.to ?? isoPlus(18);
  const guests = Number(params.guests ?? 2);
  const searched = Boolean(params.hotel || params.from);

  let rooms: AvailableRoom[] = [];
  if (searched && hotelList.length) {
    const { data } = await supabase.rpc("available_rooms", {
      p_hotel_id: hotelId,
      p_check_in: from,
      p_check_out: to,
      p_guests: guests,
    });
    rooms = (data ?? []) as AvailableRoom[];
  }

  const selected = hotelList.find((h) => h.id === hotelId);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-4xl text-teal">Find a room</h1>
      <p className="mt-2 max-w-xl text-muted">
        Five boutique properties. Availability is checked live against real
        bookings — no account needed to look.
      </p>

      <form
        method="get"
        className="mt-8 grid gap-4 rounded-2xl border border-line bg-surface p-6 sm:grid-cols-5"
      >
        <label className="sm:col-span-2">
          <span className="text-xs uppercase tracking-wide text-muted">
            Property
          </span>
          <select
            name="hotel"
            defaultValue={hotelId}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
          >
            {hotelList.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} — {h.city}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="text-xs uppercase tracking-wide text-muted">
            Check in
          </span>
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
          />
        </label>

        <label>
          <span className="text-xs uppercase tracking-wide text-muted">
            Check out
          </span>
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
          />
        </label>

        <label>
          <span className="text-xs uppercase tracking-wide text-muted">
            Guests
          </span>
          <input
            type="number"
            name="guests"
            min={1}
            max={8}
            defaultValue={guests}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
          />
        </label>

        <button className="rounded-full bg-teal px-6 py-2.5 text-white sm:col-span-5 sm:justify-self-start">
          Search availability
        </button>
      </form>

      {!searched && (
        <section className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hotelList.map((h) => (
            <article
              key={h.id}
              className="overflow-hidden rounded-2xl border border-line bg-surface"
            >
              {h.hero_image_url && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={h.hero_image_url}
                  alt={h.name}
                  className="aspect-video w-full object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-lg text-teal">{h.name}</h3>
                <p className="text-sm text-muted">
                  {h.city}, {h.country} · {"★".repeat(h.star_rating)}
                </p>
              </div>
            </article>
          ))}
        </section>
      )}

      {searched && (
        <section className="mt-10">
          <h2 className="text-2xl text-teal">
            {rooms.length} room{rooms.length === 1 ? "" : "s"} available
          </h2>
          <p className="text-sm text-muted">
            {selected?.name} · {from} → {to} · {guests} guest
            {guests === 1 ? "" : "s"}
          </p>

          {rooms.length === 0 && (
            <p className="mt-6 rounded-xl bg-gold-soft px-4 py-3 text-sm">
              Nothing free for those dates. Try a different property or shift
              the dates.
            </p>
          )}

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((r) => (
              <article
                key={r.room_id}
                className="overflow-hidden rounded-2xl border border-line bg-surface"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.image_url}
                  alt={r.room_type}
                  className="aspect-video w-full object-cover"
                />
                <div className="space-y-2 p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-lg text-teal">{r.room_type}</h3>
                    <span className="text-sm text-muted">#{r.room_number}</span>
                  </div>
                  <p className="text-sm text-muted">{r.description}</p>
                  <p className="text-sm">
                    <span className="font-medium">€{r.nightly_rate}</span>
                    <span className="text-muted"> / night · up to </span>
                    <span className="font-medium">{r.max_occupancy}</span>
                    <span className="text-muted"> guests</span>
                  </p>
                  <p className="rounded-lg bg-teal-soft px-3 py-1.5 text-sm">
                    {r.nights} nights · <strong>€{r.total_price}</strong> total
                  </p>

                  <form action={createBooking}>
                    <input type="hidden" name="room_id" value={r.room_id} />
                    <input type="hidden" name="hotel_id" value={r.hotel_id} />
                    <input type="hidden" name="check_in" value={from} />
                    <input type="hidden" name="check_out" value={to} />
                    <input type="hidden" name="guests" value={guests} />
                    <input
                      type="hidden"
                      name="total_price"
                      value={r.total_price}
                    />
                    <button className="mt-2 w-full rounded-full bg-teal px-4 py-2 text-sm text-white hover:opacity-90">
                      Book this room
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
