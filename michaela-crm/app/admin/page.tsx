import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, getUser, isStaff } from "@/lib/supabase/server";
import { StatusPill, TierBadge } from "@/components/pills";
import { t } from "@/lib/i18n";

const TABS = ["overview", "customers", "bookings"] as const;
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
        <h1 className="text-3xl text-teal">{t.staffOnly}</h1>
        <p className="mt-3 text-muted">
          {t.staffOnlyNeeds}{" "}
          <code dir="ltr">app_metadata.role = &quot;staff&quot;</code>{" "}
          {t.staffOnlyOnAccount}{" "}
          <Link href="/account" className="text-teal underline">
            {t.myBookings}
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
      <h1 className="text-3xl text-teal">{t.adminConsole}</h1>
      <p className="mt-1 text-sm text-muted">
        {t.signedInAs} <bdi>{user.email}</bdi> {t.fullAccess}
      </p>

      <nav className="mt-6 flex gap-2">
        {TABS.map((tabName) => (
          <Link
            key={tabName}
            href={`/admin?tab=${tabName}`}
            className={`rounded-full px-4 py-1.5 text-sm capitalize ${
              tabName === tab
                ? "bg-teal text-on-teal"
                : "border border-line text-muted hover:border-teal hover:text-teal"
            }`}
          >
            {t.tabs[tabName]}
          </Link>
        ))}
      </nav>

      <div className="mt-8">
        {tab === "overview" && <Overview supabase={supabase} />}
        {tab === "customers" && <Customers supabase={supabase} />}
        {tab === "bookings" && <Bookings supabase={supabase} />}
      </div>
    </div>
  );
}

type DB = Awaited<ReturnType<typeof createClient>>;

async function Overview({ supabase }: { supabase: DB }) {
  const [{ count: customers }, { count: bookings }] = await Promise.all([
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
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
      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label={t.kpiCustomers} value={customers ?? 0} />
        <Kpi label={t.kpiBookings} value={bookings ?? 0} />
        <Kpi
          label={t.kpiRevenue}
          value={`€${Math.round(revenue).toLocaleString()}`}
        />
      </div>

      <section className="mt-8 rounded-2xl border border-line bg-surface p-6">
        <h2 className="text-lg text-teal">{t.revenueByProperty}</h2>
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
              <bdi className="w-24 text-end tabular-nums">
                €{Math.round(total).toLocaleString()}
              </bdi>
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
    <Table
      head={[t.colGuest, t.colEmail, t.colLocation, t.colTier, t.colPoints]}
    >
      {data?.map((c) => (
        <tr key={c.id} className="border-b border-line last:border-0">
          <td className="px-4 py-3" dir="auto">
            {c.first_name} {c.last_name}
          </td>
          <td className="px-4 py-3 text-muted">
            <bdi>{c.email}</bdi>
          </td>
          <td className="px-4 py-3 text-muted" dir="auto">
            {c.city}, {c.country}
          </td>
          <td className="px-4 py-3">
            <TierBadge tier={c.loyalty_tier} />
          </td>
          <td className="px-4 py-3 text-end tabular-nums">
            <bdi>{c.loyalty_points.toLocaleString()}</bdi>
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
      head={[
        t.colReference,
        t.colGuest,
        t.colProperty,
        t.colRoom,
        t.colDates,
        t.colChannel,
        t.colStatus,
        t.colTotal,
      ]}
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
              <bdi>{b.booking_reference}</bdi>
            </td>
            <td className="px-4 py-3" dir="auto">
              {c ? `${c.first_name} ${c.last_name}` : "—"}
            </td>
            <td className="px-4 py-3 text-muted" dir="auto">
              {h?.name}
            </td>
            <td className="px-4 py-3 text-muted" dir="auto">
              {r?.room_type}
            </td>
            {/* The arrow belongs to the date range, so the whole cell is one
                LTR run — otherwise it points the wrong way on an RTL page. */}
            <td className="px-4 py-3 text-muted">
              <bdi dir="ltr" className="tabular-nums">
                {b.check_in} → {b.check_out}
              </bdi>
            </td>
            <td className="px-4 py-3 text-muted" dir="auto">
              {b.channel}
            </td>
            <td className="px-4 py-3">
              <StatusPill status={b.status} />
            </td>
            <td className="px-4 py-3 text-end tabular-nums">
              <bdi>€{b.total_amount}</bdi>
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
      <bdi className="mt-1 block font-display text-3xl text-teal tabular-nums">
        {value}
      </bdi>
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
        <thead className="border-b border-line text-start text-xs uppercase tracking-wide text-muted">
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
