-- Michaela Hotels CRM — two-role access model
--
-- Roles:
--   guest  — a registered visitor. Sees only their own customer row, bookings
--            and flights. Can search availability and create a booking.
--   staff  — hotel employee. Sees and manages everything.
--
-- Staff is identified by app_metadata.role = 'staff' in the JWT. It must NOT
-- live in user_metadata: that field is user-editable, so any guest could
-- promote themselves to staff.

-- --------------------------------------------- link customers to accounts ----
alter table public.customers
  add column user_id uuid unique references auth.users (id) on delete set null;

create index customers_user_id_idx on public.customers (user_id);

comment on column public.customers.user_id is
  'The auth.users account this guest signs in with. Null for walk-in guests created by staff.';

-- ------------------------------------------------------------- helpers -------
create or replace function public.is_staff()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'staff', false);
$$;

comment on function public.is_staff() is
  'True when the caller carries app_metadata.role = staff. Reads only the callers own JWT.';

-- SECURITY DEFINER on purpose: the customers RLS policy cannot look up the
-- caller's own customer row without this, and it returns nothing but the
-- caller's own id.
create or replace function public.current_customer_id()
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.customers where user_id = (select auth.uid()) limit 1;
$$;

revoke execute on function public.current_customer_id() from public;
grant execute on function public.current_customer_id() to authenticated;

-- ------------------------------------------ create a profile on sign-up ------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.customers (user_id, first_name, last_name, email, marketing_opt_in)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'first_name', ''), 'Guest'),
    coalesce(nullif(new.raw_user_meta_data ->> 'last_name', ''), ''),
    new.email,
    coalesce((new.raw_user_meta_data ->> 'marketing_opt_in')::boolean, false)
  )
  on conflict (email) do update set user_id = excluded.user_id;
  return new;
end;
$$;

-- raw_user_meta_data is used here for display name only, never for authorization.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- --------------------------------------------------- availability search -----
-- SECURITY DEFINER so it can see bookings while the caller cannot. It returns
-- room and price data only — no guest details ever leave this function.
create or replace function public.available_rooms(
  p_hotel_id  bigint,
  p_check_in  date,
  p_check_out date,
  p_guests    integer default 1
)
returns table (
  room_id       bigint,
  hotel_id      bigint,
  room_number   text,
  room_type     text,
  max_occupancy smallint,
  nightly_rate  numeric,
  image_url     text,
  description   text,
  nights        integer,
  total_price   numeric
)
language sql
stable
security definer
set search_path = ''
as $$
  select r.id, r.hotel_id, r.room_number, r.room_type, r.max_occupancy,
         r.nightly_rate, r.image_url, r.description,
         (p_check_out - p_check_in)::integer,
         round(r.nightly_rate * (p_check_out - p_check_in), 2)
  from public.rooms r
  where r.hotel_id = p_hotel_id
    and r.availability <> 'Maintenance'
    and r.max_occupancy >= p_guests
    and p_check_out > p_check_in
    and not exists (
      select 1
      from public.bookings b
      where b.room_id = r.id
        and b.status <> 'Cancelled'
        and b.check_in < p_check_out
        and b.check_out > p_check_in
    )
  order by r.nightly_rate;
$$;

revoke execute on function public.available_rooms(bigint, date, date, integer) from public;
grant execute on function public.available_rooms(bigint, date, date, integer) to anon, authenticated;

-- ------------------------------------------------------- replace policies ----
drop policy "staff can read hotels"    on public.hotels;
drop policy "staff can read rooms"     on public.rooms;
drop policy "staff can read customers" on public.customers;
drop policy "staff can read bookings"  on public.bookings;
drop policy "staff can read flights"   on public.flights;

-- Properties and rooms are the public catalogue: anyone may browse them.
create policy "anyone can read hotels" on public.hotels
  for select to anon, authenticated using (true);

create policy "anyone can read rooms" on public.rooms
  for select to anon, authenticated using (true);

create policy "staff manage hotels" on public.hotels
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "staff manage rooms" on public.rooms
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- Customers: your own row, or everything if you are staff.
create policy "read own customer row" on public.customers
  for select to authenticated
  using (user_id = (select auth.uid()) or public.is_staff());

create policy "update own customer row" on public.customers
  for update to authenticated
  using (user_id = (select auth.uid()) or public.is_staff())
  with check (user_id = (select auth.uid()) or public.is_staff());

create policy "staff insert customers" on public.customers
  for insert to authenticated with check (public.is_staff());

create policy "staff delete customers" on public.customers
  for delete to authenticated using (public.is_staff());

-- Bookings: your own, or everything if you are staff.
create policy "read own bookings" on public.bookings
  for select to authenticated
  using (customer_id = public.current_customer_id() or public.is_staff());

create policy "create own booking" on public.bookings
  for insert to authenticated
  with check (customer_id = public.current_customer_id() or public.is_staff());

create policy "staff update bookings" on public.bookings
  for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "staff delete bookings" on public.bookings
  for delete to authenticated using (public.is_staff());

-- Flights: your own, or everything if you are staff.
create policy "read own flights" on public.flights
  for select to authenticated
  using (customer_id = public.current_customer_id() or public.is_staff());

create policy "staff manage flights" on public.flights
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- ------------------------------------------------------------- data API ------
grant usage on schema public to anon, authenticated;
grant select on public.hotels, public.rooms to anon, authenticated;
grant select, update on public.customers to authenticated;
grant select, insert, update, delete on public.bookings to authenticated;
grant select on public.flights to authenticated;
grant insert, delete on public.customers to authenticated;
grant insert, update, delete on public.flights to authenticated;
grant usage, select on all sequences in schema public to authenticated;
