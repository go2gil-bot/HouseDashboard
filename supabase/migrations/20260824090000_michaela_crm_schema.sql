-- Michaela Hotels CRM — schema
-- Core tables: customers, bookings, flights
-- Supporting tables: hotels, rooms (rooms carry the room photography)

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- hotels ----
create table public.hotels (
  id             bigint generated always as identity primary key,
  code           text        not null unique,
  name           text        not null,
  city           text        not null,
  country        text        not null,
  address        text,
  star_rating    smallint    not null default 5 check (star_rating between 1 and 5),
  total_rooms    integer     not null default 0 check (total_rooms >= 0),
  timezone       text        not null default 'UTC',
  hero_image_url text,
  created_at     timestamptz not null default now()
);

comment on table public.hotels is 'The five Michaela chain properties.';

-- ----------------------------------------------------------------- rooms ----
create table public.rooms (
  id             bigint generated always as identity primary key,
  hotel_id       bigint      not null references public.hotels (id) on delete cascade,
  room_number    text        not null,
  room_type      text        not null check (room_type in (
                               'Standard Double','Garden Twin','Deluxe Sea View','Terrace Deluxe',
                               'Junior Suite','Family Suite','Executive Suite','Presidential Suite')),
  max_occupancy  smallint    not null default 2 check (max_occupancy between 1 and 8),
  nightly_rate   numeric(10,2) not null check (nightly_rate > 0),
  availability   text        not null default 'Available'
                             check (availability in ('Available','Occupied','Maintenance')),
  image_url      text        not null,
  description    text,
  created_at     timestamptz not null default now(),
  unique (hotel_id, room_number)
);

comment on column public.rooms.image_url is 'Photograph of the room, shown in the CRM room gallery.';

create index rooms_hotel_id_idx on public.rooms (hotel_id);

-- ------------------------------------------------------------- customers ----
create table public.customers (
  id               bigint generated always as identity primary key,
  first_name       text        not null,
  last_name        text        not null,
  email            text        not null unique,
  phone            text,
  country          text,
  city             text,
  date_of_birth    date,
  loyalty_tier     text        not null default 'Bronze'
                               check (loyalty_tier in ('Bronze','Silver','Gold','Platinum')),
  loyalty_points   integer     not null default 0 check (loyalty_points >= 0),
  marketing_opt_in boolean     not null default false,
  notes            text,
  created_at       timestamptz not null default now()
);

create index customers_loyalty_tier_idx on public.customers (loyalty_tier);

-- -------------------------------------------------------------- bookings ----
create table public.bookings (
  id                bigint generated always as identity primary key,
  booking_reference text        not null unique,
  customer_id       bigint      not null references public.customers (id) on delete cascade,
  hotel_id          bigint      not null references public.hotels (id)    on delete restrict,
  room_id           bigint          null references public.rooms (id)     on delete set null,
  check_in          date        not null,
  check_out         date        not null,
  guests            smallint    not null default 2 check (guests between 1 and 8),
  status            text        not null default 'Pending'
                                check (status in ('Pending','Confirmed','Checked-in','Checked-out','Cancelled')),
  channel           text        not null default 'Direct'
                                check (channel in ('Direct','Booking.com','Expedia','Travel Agent','Corporate')),
  total_amount      numeric(10,2) not null check (total_amount >= 0),
  currency          char(3)     not null default 'EUR',
  special_requests  text,
  created_at        timestamptz not null default now(),
  constraint bookings_dates_valid check (check_out > check_in)
);

create index bookings_customer_id_idx on public.bookings (customer_id);
create index bookings_hotel_id_idx    on public.bookings (hotel_id);
create index bookings_room_id_idx     on public.bookings (room_id);
create index bookings_check_in_idx    on public.bookings (check_in);

-- --------------------------------------------------------------- flights ----
create table public.flights (
  id                bigint generated always as identity primary key,
  booking_id        bigint          null references public.bookings (id)  on delete cascade,
  customer_id       bigint      not null references public.customers (id) on delete cascade,
  flight_number     text        not null,
  airline           text        not null,
  direction         text        not null check (direction in ('Outbound','Inbound')),
  departure_airport char(3)     not null,
  arrival_airport   char(3)     not null,
  departure_time    timestamptz not null,
  arrival_time      timestamptz not null,
  cabin_class       text        not null default 'Economy'
                                check (cabin_class in ('Economy','Premium Economy','Business','First')),
  seat              text,
  price             numeric(10,2) not null check (price >= 0),
  currency          char(3)     not null default 'EUR',
  status            text        not null default 'Scheduled'
                                check (status in ('Scheduled','Departed','Landed','Delayed','Cancelled')),
  created_at        timestamptz not null default now(),
  constraint flights_times_valid    check (arrival_time > departure_time),
  constraint flights_airports_valid check (departure_airport <> arrival_airport)
);

create index flights_booking_id_idx     on public.flights (booking_id);
create index flights_customer_id_idx    on public.flights (customer_id);
create index flights_departure_time_idx on public.flights (departure_time);

-- ------------------------------------------------------------------- RLS ----
-- Staff-only CRM: signed-in staff read everything, nobody writes through the
-- Data API (writes go through the dashboard / service role).
alter table public.hotels    enable row level security;
alter table public.rooms     enable row level security;
alter table public.customers enable row level security;
alter table public.bookings  enable row level security;
alter table public.flights   enable row level security;

create policy "staff can read hotels"    on public.hotels    for select to authenticated using (true);
create policy "staff can read rooms"     on public.rooms     for select to authenticated using (true);
create policy "staff can read customers" on public.customers for select to authenticated using (true);
create policy "staff can read bookings"  on public.bookings  for select to authenticated using (true);
create policy "staff can read flights"   on public.flights   for select to authenticated using (true);
