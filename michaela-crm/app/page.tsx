import { createClient } from "@/lib/supabase/server";
import { createBooking } from "@/app/book/actions";
import { t } from "@/lib/i18n";

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
      <h1 className="text-4xl text-teal">{t.findRoom}</h1>
      <p className="mt-2 max-w-xl text-muted">
        {t.homeLead}
      </p>

      <form
        method="get"
        className="mt-8 grid gap-4 rounded-2xl border border-line bg-surface p-6 sm:grid-cols-5"
      >
        <label className="sm:col-span-2">
          <span className="text-xs uppercase tracking-wide text-muted">
            {t.property}
          </span>
          <select
            name="hotel"
            defaultValue={hotelId}
            className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 focus:border-teal"
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
            {t.checkIn}
          </span>
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 focus:border-teal"
          />
        </label>

        <label>
          <span className="text-xs uppercase tracking-wide text-muted">
            {t.checkOut}
          </span>
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 focus:border-teal"
          />
        </label>

        <label>
          <span className="text-xs uppercase tracking-wide text-muted">
            {t.guests}
          </span>
          <input
            type="number"
            name="guests"
            min={1}
            max={8}
            defaultValue={guests}
            className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 focus:border-teal"
          />
        </label>

        <button className="rounded-full bg-teal px-6 py-2.5 text-on-teal sm:col-span-5 sm:justify-self-start">
          {t.searchAvailability}
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
            {t.roomsAvailable(rooms.length)}
          </h2>
          <p className="text-sm text-muted">
            <bdi dir="auto">{selected?.name}</bdi> ·{" "}
            <bdi dir="ltr" className="tabular-nums">
              {from} → {to}
            </bdi>{" "}
            · {t.guestCount(guests)}
          </p>

          {rooms.length === 0 && (
            <p className="mt-6 rounded-xl bg-gold-soft px-4 py-3 text-sm text-gold-ink">
              {t.nothingFree}
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
                    {/* Latin runs are isolated so they survive an RTL page. */}
                    <bdi className="text-sm text-muted">#{r.room_number}</bdi>
                  </div>
                  <p className="text-sm text-muted" dir="auto">
                    {r.description}
                  </p>
                  <p className="text-sm">
                    <bdi className="font-medium">€{r.nightly_rate}</bdi>
                    <span className="text-muted">{t.perNight}</span>
                    <bdi className="font-medium">{r.max_occupancy}</bdi>
                    <span className="text-muted">{t.guestsWord}</span>
                  </p>
                  <p className="rounded-lg bg-teal-soft px-3 py-1.5 text-sm text-teal">
                    {t.nights(r.nights)} ·{" "}
                    <bdi>
                      <strong>€{r.total_price}</strong>
                    </bdi>{" "}
                    {t.totalWord}
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
                    <button className="mt-2 w-full rounded-full bg-teal px-4 py-2 text-sm text-on-teal hover:opacity-90">
                      {t.bookThisRoom}
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
