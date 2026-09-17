# Michaela Hotels — guest portal + admin console

Next.js 16 app on top of the Michaela CRM Supabase project
(`myoypppxfxupgqmmzjim`, org Gil AI Course).

## Running it

```bash
npm --prefix michaela-crm run dev
```

Then open http://localhost:3000. `.env.local` already holds the project URL and
the publishable key; it is gitignored.

## The two roles

| | Guest | Staff |
|---|---|---|
| Browse properties and rooms | ✅ (no account needed) | ✅ |
| Search availability | ✅ (no account needed) | ✅ |
| Create a booking | ✅ own only, sign-in required | ✅ any |
| See bookings | own only | all |
| See customers | own profile only | all |
| `/admin` console | blocked | ✅ |

Anyone can browse the properties and check availability without an account.
Clicking **Book this room** while signed out sends the visitor to the sign-in
page and returns them to the same search afterwards.

The split is enforced **in the database**, not in the UI. Even if someone calls
the REST API directly with the publishable key, RLS returns only their own rows.
The UI checks are just so the pages look right.

Staff is identified by `app_metadata.role = 'staff'` in the JWT. That field is
writable only by the service role — unlike `user_metadata`, which the user can
edit themselves and must never be used for authorization.

### Making an account staff

Run this in the Supabase SQL editor:

```sql
update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"role":"staff"}'::jsonb
where email = 'someone@example.com';
```

The user must sign out and back in — the claim only lands in a freshly issued JWT.

## Test accounts

| Role | Email | Password |
|---|---|---|
| Admin (Gil Levi) | `go2gil@gmail.com` | `12345` |
| Guest | `guest@michaelahotels.dev` | `MichaelaTest2026!` |
| Staff | `staff@michaelahotels.dev` | `MichaelaStaff2026!` |

All three were created directly in `auth.users`, so no confirmation mail was sent
anywhere. The Gil Levi account took over an existing seeded customer row (id 24),
which is why it already carries 6 bookings and Platinum status.

`12345` is shorter than Supabase's own minimum for passwords set through the API;
it works only because the hash was written straight to the table. Fine for an
exercise on synthetic data, not something to carry anywhere real.

## Flights

The `flights` table and its 76 rows are still in the database — they are part of
the exercise brief — but flights no longer appear anywhere in the UI. Both the
admin console and the guest account page dropped them as not relevant to a hotel
CRM.

## Note on registration

Supabase Auth rejects sign-ups from domains it considers invalid — including
`example.com` and any domain without real DNS. Registering through the UI works
with a real email domain. Note that the built-in SMTP is capped at a handful of
messages per hour on the free plan, so repeated attempts return
`email rate limit exceeded`. To register freely, either switch off
**Authentication → Sign In / Providers → Email → Confirm email**, or add users
from **Authentication → Users → Add user** with *Auto Confirm* ticked.

## Availability

`/` calls the `available_rooms(hotel, check_in, check_out, guests)` Postgres
function. It excludes rooms in maintenance, rooms too small for the party, and
rooms with an overlapping non-cancelled booking — so a room disappears from
search the moment someone books it.

The function is `SECURITY DEFINER` on purpose: an anonymous visitor must be able
to test dates against the bookings table without being able to read it. It
returns room and price data only.

## Layout

```
app/
  page.tsx           availability search + property grid (public)
  login/ signup/     Supabase Auth, server actions in app/auth/actions.ts
  account/           guest: own profile and own bookings
  admin/             staff: KPIs, revenue chart, customers and bookings tables
  book/actions.ts    createBooking server action
lib/supabase/        server + browser clients (@supabase/ssr)
proxy.ts             refreshes the auth cookie on every request
```
