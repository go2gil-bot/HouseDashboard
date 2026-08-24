import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, getUser, isStaff } from "@/lib/supabase/server";
import { StatusPill, TierBadge } from "@/components/pills";

const TABS = ["overview", "customers", "bookings", "flights"] as const;
type Tab = (typeof TABS)[number];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const user = await getUser();
  if (!user) redirect("/login");

  if (!isStaff(user)) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="text-3xl text-teal">Staff only</h1>
        <p className="mt-3 text-muted">
          This console needs <code>app_metadata.role = &quot;staff&quot;</code> on
          your account. Guests see their own bookings under{" "}
          <Link href="/account" className="text-teal underline">
            My bookings
          </Link>
          .
        </p>
      </div>
    );
  }

  const tab = (TABS.includes(params.tab as Tab) ? params.tab : "overview") as Tab;
  const supabase = await createClient();

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl text-teal">Admin console</h1>
      <p className="mt-1 text-sm text-muted">
        Signed in as {user.email} — full access across all five properties.
      </p>

      <nav className="mt-6 flex gap-2">
        {TABS.map((t) => (
          <Link
            key={t}
            href={`/admin?tab=${t}`}
            className={`rounded-full px-4 py-1.5 text-sm capitalize ${
              t === tab
                ? "bg-teal text-white"
                : "border border-line text-muted hover:border-teal hover:text-teal"
            }`}
          >
            {t}
          </Link>
        ))}
      </nav>

      <div className="mt-8">
        {tab === "overview" && <Overview supabase={supabase} />}
        {tab === "customers" && <Customers supabase={supabase} />}
        {tab === "bookings" && <Bookings supabase={supabase} />}
        {tab === "flights" && <Flights supabase={supabase} />}
      </div>
    </div>
  );
}

type DB = Awaited<ReturnType<typeof createClient>>;

async function Overview({ supabase }: { supabase: DB }) {
  const [{ count: customers }, { count: bookings }, { count: flights }] =
    await Promise.all([
      supabase.from("customers").select("*", { count: "exact", head: true }),
      supabase.from("bookings").select("*", { count: "exact", head: true }),
      supabase.from("flights").select("*", { count: "exact", head: true }),
    ]);

  const { data: rows } = await supabase
    .from("bookings")
    .select("total_amount, status, hotels(name)");

  const active = (rows ?? []).filter((r) => r.status !== "Cancelled");
  const revenue = active.reduce((s, r) => s + Number(r.total_amount), 0);

  const byHotel = new Map<string, number>();
  for (const r of active) {
    const name = (r.hotels as unknown as { name: string })?.name ?? "—";
    byHotel.set(name, (byHotel.get(name) ?? 0) + Number(r.total_amount));
  }
  const ranked = [...byHotel.entries()].sort((a, b) => b[1] - a[1]);
  const max = ranked[0]?.[1] ?? 1;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-4">
        <Kpi label="Customers" value={customers ?? 0} />
        <Kpi label="Bookings" value={bookings ?? 0} />
        <Kpi label="Flight legs" value={flights ?? 0} />
        <Kpi label="Revenue" value={`€${Math.round(revenue).toLocaleString()}`} />
      </div>

      <section className="mt-8 rounded-2xl border border-line bg-surface p-6">
        <h2 className="text-lg text-teal">Revenue by property</h2>
        <div className="mt-4 space-y-3">
          {ranked.map(([name, total]) => (
            <div key={name} className="flex items-center gap-3 text-sm">
              <span className="w-52 shrink-0 truncate text-muted">{name}</span>
              <div className="h-2 flex-1 rounded-full bg-line">
                <div
                  className="h-2 rounded-full bg-teal"
                  style={{ width: `${(total / max) * 100}%` }}
                />
              </div>
              <span className="w-24 text-right">
                €{Math.round(total).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

async function Customers({ supabase }: { supabase: DB }) {
  const { data } = await supabase
    .from("customers")
    .select(
      "id, first_name, last_name, email, country, city, loyalty_tier, loyalty_points",
    )
    .order("loyalty_points", { ascending: false });

  return (
    <Table head={["Guest", "Email", "Location", "Tier", "Points"]}>
      {data?.map((c) => (
        <tr key={c.id} className="border-b border-line last:border-0">
          <td className="px-4 py-3">
            {c.first_name} {c.last_name}
          </td>
          <td className="px-4 py-3 text-muted">{c.email}</td>
          <td className="px-4 py-3 text-muted">
            {c.city}, {c.country}
          </td>
          <td className="px-4 py-3">
            <TierBadge tier={c.loyalty_tier} />
          </td>
          <td className="px-4 py-3 text-right">
            {c.loyalty_points.toLocaleString()}
          </td>
        </tr>
      ))}
    </Table>
  );
}

async function Bookings({ supabase }: { supabase: DB }) {
  const { data } = await supabase
    .from("bookings")
    .select(
      "id, booking_reference, check_in, check_out, guests, status, channel, total_amount, customers(first_name, last_name), hotels(name), rooms(room_type)",
    )
    .order("check_in", { ascending: false })
    .limit(100);

  return (
    <Table
      head={["Reference", "Guest", "Property", "Room", "Dates", "Channel", "Status", "Total"]}
    >
      {data?.map((b) => {
        const c = b.customers as unknown as {
          first_name: string;
          last_name: string;
        } | null;
        const h = b.hotels as unknown as { name: string } | null;
        const r = b.rooms as unknown as { room_type: string } | null;
        return (
          <tr key={b.id} className="border-b border-line last:border-0">
            <td className="px-4 py-3 font-mono text-xs">
              {b.booking_reference}
            </td>
            <td className="px-4 py-3">
              {c ? `${c.first_name} ${c.last_name}` : "—"}
            </td>
            <td className="px-4 py-3 text-muted">{h?.name}</td>
            <td className="px-4 py-3 text-muted">{r?.room_type}</td>
            <td className="px-4 py-3 text-muted">
              {b.check_in} → {b.check_out}
            </td>
            <td className="px-4 py-3 text-muted">{b.channel}</td>
            <td className="px-4 py-3">
              <StatusPill status={b.status} />
            </td>
            <td className="px-4 py-3 text-right">€{b.total_amount}</td>
          </tr>
        );
      })}
    </Table>
  );
}

async function Flights({ supabase }: { supabase: DB }) {
  const { data } = await supabase
    .from("flights")
    .select(
      "id, flight_number, airline, direction, departure_airport, arrival_airport, departure_time, cabin_class, price, status, customers(first_name, last_name)",
    )
    .order("departure_time")
    .limit(100);

  return (
    <Table
      head={["Flight", "Guest", "Route", "Departs", "Cabin", "Price", "Status"]}
    >
      {data?.map((f) => {
        const c = f.customers as unknown as {
          first_name: string;
          last_name: string;
        } | null;
        return (
          <tr key={f.id} className="border-b border-line last:border-0">
            <td className="px-4 py-3">
              <div>{f.flight_number}</div>
              <div className="text-xs text-muted">{f.airline}</div>
            </td>
            <td className="px-4 py-3">
              {c ? `${c.first_name} ${c.last_name}` : "—"}
            </td>
            <td className="px-4 py-3 text-muted">
              {f.departure_airport} → {f.arrival_airport}
              <div className="text-xs">{f.direction}</div>
            </td>
            <td className="px-4 py-3 text-muted">
              {new Date(f.departure_time).toLocaleDateString()}
            </td>
            <td className="px-4 py-3 text-muted">{f.cabin_class}</td>
            <td className="px-4 py-3 text-right">€{f.price}</td>
            <td className="px-4 py-3">
              <StatusPill status={f.status} />
            </td>
          </tr>
        );
      })}
    </Table>
  );
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 font-display text-3xl text-teal">{value}</div>
    </div>
  );
}

function Table({
  head,
  children,
}: {
  head: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
      <table className="w-full text-sm">
        <thead className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-3 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
