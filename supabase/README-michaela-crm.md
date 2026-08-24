# Michaela Hotels CRM — exercise

CRM for a five-property boutique hotel chain, built on Supabase.

## Properties

| Code | Property | City | Country | Stars |
|---|---|---|---|---|
| `MCH-LIS` | Michaela Lisbon Riverside | Lisbon | Portugal | 5 |
| `MCH-JTR` | Michaela Santorini Cliffside | Santorini | Greece | 5 |
| `MCH-ZRH` | Michaela Zurich Alpine | Zurich | Switzerland | 5 |
| `MCH-TLV` | Michaela Tel Aviv Marina | Tel Aviv | Israel | 5 |
| `MCH-PRG` | Michaela Prague Old Town | Prague | Czechia | 4 |

## Schema

The three tables the exercise asks for, plus two supporting tables that the
booking flow needs (a booking has to point at a property and a room, and the
room is what carries the photograph).

```
hotels ──< rooms
   │          │
   └──< bookings >── customers
             │            │
             └──< flights ┘
```

**Core**

- `customers` — guest profile, loyalty tier (Bronze/Silver/Gold/Platinum), points, marketing opt-in.
- `bookings` — reference, guest, property, room, stay dates, status, channel, total.
- `flights` — outbound/inbound legs attached to a booking, airline, route, times, cabin, price, status.

**Supporting**

- `hotels` — the five properties.
- `rooms` — 25 rooms (5 per property) with `image_url`, `nightly_rate`, `availability`.

Constraints worth noting: `check_out > check_in` on bookings, `arrival_time > departure_time`
and `departure_airport <> arrival_airport` on flights, and CHECK constraints on every
status/tier/class enum-like column. Every foreign key is indexed.

### RLS — two roles

RLS is enabled on all five tables and enforces a guest/staff split:

- `hotels`, `rooms` — readable by everyone including `anon`, so availability can be
  searched before registering. Writes are staff-only.
- `customers` — a guest sees only the row linked to their `auth.users` id; staff see all.
- `bookings`, `flights` — a guest sees only their own; staff see all. A guest may
  create a booking for themselves, but only staff can change or delete one.

Staff is `app_metadata.role = 'staff'` in the JWT, checked by `public.is_staff()`.
It is deliberately not `user_metadata`, which users can edit themselves.

`public.available_rooms(hotel, check_in, check_out, guests)` is the public availability
search: `SECURITY DEFINER` so an anonymous visitor can test date overlap against
`bookings` without being able to read it, returning room and price data only.

A trigger on `auth.users` creates the matching `customers` row on sign-up.

## Room photography

Every room row carries an `image_url` pointing at a seeded
`https://picsum.photos/seed/<slug>/1200/675` URL — a real photograph, stable per seed,
no API key needed. Each hotel also has a `hero_image_url` at 1600x900.

Swapping in your own photos later means updating `rooms.image_url` (or uploading to a
Supabase Storage bucket and storing the public URL there instead).

## Seed volume

| Table | Rows |
|---|---|
| `hotels` | 5 |
| `rooms` | 25 |
| `customers` | 24 |
| `bookings` | 60 |
| `flights` | 76 |

Bookings and flights are generated deterministically from MD5 hashes, so re-running the
seed on a fresh database produces the identical dataset.

## Applying

Applied to project ref **`myoypppxfxupgqmmzjim`** (org: Gil AI Course, region eu-central-1).
Dashboard: https://supabase.com/dashboard/project/myoypppxfxupgqmmzjim

```bash
npx supabase db push --project-ref myoypppxfxupgqmmzjim -p <DB_PASSWORD>
```

No Docker required — both migrations are pushed straight to the hosted database.
`supabase link` currently fails on this machine with an `AlreadyExists: supabase/.temp`
CLI error, so pass `--project-ref` explicitly instead of linking.

Verified after push: 5 hotels, 25 rooms (all with photos), 24 customers, 60 bookings,
76 flights, EUR 165,232 booked revenue. `supabase db advisors` reports no issues.

## Design

UI designed in Google Stitch: project **Michaela Hotels CRM**, design system
**Michaela Hospitality** (deep teal `#0F5B57` primary, gold `#C9A227` accent,
Playfair Display headlines / Inter body, 12px roundness).

Screens on the canvas:

- **Dashboard Home** — KPI cards, revenue-by-property bar chart, arrivals today, recent bookings table. (4 variants generated.)
- **Hotels & Rooms** — property chips, occupancy summary, filter bar, photographic room-card grid with rates and availability pills. (2 variants.)
- **Michaela Wordmark** — logo asset.

Note: the Stitch MCP `list_screens` call lags badly — it returned an empty list for
~40 minutes after screens had already rendered. Check the canvas in the Stitch UI
rather than trusting an empty API response.
