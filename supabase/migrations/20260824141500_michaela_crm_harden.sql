-- Michaela Hotels CRM — hardening pass on the access model
--
-- Fixes three findings from `supabase db advisors`:
--   1. handle_new_user() was reachable as an RPC endpoint. It is a trigger
--      function; nobody should be able to call it directly.
--   2. current_customer_id() was still executable by anon.
--   3. The staff FOR ALL policies overlapped the public read policies on
--      SELECT, so every catalogue read evaluated two policies.

-- ------------------------------------------------- lock down the trigger ----
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.current_customer_id() from anon;

-- --------------------------------------- split staff FOR ALL into writes ----
-- SELECT is already covered by "anyone can read hotels/rooms" and
-- "read own flights", so the staff policies only need to cover writes.

drop policy "staff manage hotels"  on public.hotels;
drop policy "staff manage rooms"   on public.rooms;
drop policy "staff manage flights" on public.flights;

create policy "staff insert hotels" on public.hotels
  for insert to authenticated with check (public.is_staff());
create policy "staff update hotels" on public.hotels
  for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "staff delete hotels" on public.hotels
  for delete to authenticated using (public.is_staff());

create policy "staff insert rooms" on public.rooms
  for insert to authenticated with check (public.is_staff());
create policy "staff update rooms" on public.rooms
  for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "staff delete rooms" on public.rooms
  for delete to authenticated using (public.is_staff());

create policy "staff insert flights" on public.flights
  for insert to authenticated with check (public.is_staff());
create policy "staff update flights" on public.flights
  for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "staff delete flights" on public.flights
  for delete to authenticated using (public.is_staff());

-- available_rooms() stays SECURITY DEFINER and stays callable by anon: a
-- visitor must be able to check availability before creating an account, and
-- the function returns room and price data only — never guest details.
comment on function public.available_rooms(bigint, date, date, integer) is
  'Public availability search. SECURITY DEFINER by design so it can test bookings for date overlap without exposing them; returns no personal data.';
