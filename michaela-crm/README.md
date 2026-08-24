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
| Create a booking | ✅ own only | ✅ any |
| See bookings | own only | all |
| See customers | own profile only | all |
| See flights | own only | all |
| `/admin` console | blocked | ✅ |

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
| Guest | `guest@michaelahotels.dev` | `MichaelaTest2026!` |
| Staff | `staff@michaelahotels.dev` | `MichaelaStaff2026!` |

Created directly in `auth.users` so no confirmation mail was sent anywhere.

## Note on registration

Supabase Auth rejects sign-ups from domains it considers invalid — including
`example.com` and any domain without real DNS. Registering through the UI works
with a real email domain. For the exercise, either use a real address or add
users from **Authentication → Users → Add user** with *Auto Confirm* ticked.

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
  account/           guest: own profile, bookings, flights
  admin/             staff: KPIs, revenue chart, customers/bookings/flights tables
  book/actions.ts    createBooking server action
lib/supabase/        server + browser clients (@supabase/ssr)
proxy.ts             refreshes the auth cookie on every request
```
