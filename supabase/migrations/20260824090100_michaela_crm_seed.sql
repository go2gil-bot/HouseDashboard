-- Michaela Hotels CRM — synthetic seed data
-- 5 properties, 25 photographed rooms, 24 customers, 60 bookings, 76 flights.
-- Room photography uses picsum.photos seeded URLs so every row resolves to a
-- real, stable image without needing an API key.

-- ---------------------------------------------------------------- hotels ----
insert into public.hotels (code, name, city, country, address, star_rating, total_rooms, timezone, hero_image_url) values
  ('MCH-LIS','Michaela Lisbon Riverside','Lisbon','Portugal','Av. Ribeirinha 12, Alfama',5,96,'Europe/Lisbon','https://picsum.photos/seed/michaela-lis-hero/1600/900'),
  ('MCH-JTR','Michaela Santorini Cliffside','Santorini','Greece','Caldera Path 4, Oia',5,84,'Europe/Athens','https://picsum.photos/seed/michaela-jtr-hero/1600/900'),
  ('MCH-ZRH','Michaela Zurich Alpine','Zurich','Switzerland','Bahnhofstrasse 88',5,120,'Europe/Zurich','https://picsum.photos/seed/michaela-zrh-hero/1600/900'),
  ('MCH-TLV','Michaela Tel Aviv Marina','Tel Aviv','Israel','HaYarkon St 210',5,140,'Asia/Jerusalem','https://picsum.photos/seed/michaela-tlv-hero/1600/900'),
  ('MCH-PRG','Michaela Prague Old Town','Prague','Czechia','Karlova 27, Stare Mesto',4,72,'Europe/Prague','https://picsum.photos/seed/michaela-prg-hero/1600/900');

-- ----------------------------------------------------------------- rooms ----
insert into public.rooms (hotel_id, room_number, room_type, max_occupancy, nightly_rate, availability, image_url, description)
select h.id, v.room_number, v.room_type, v.max_occupancy::smallint, v.nightly_rate, v.availability,
       'https://picsum.photos/seed/' || v.img_seed || '/1200/675', v.description
from (values
  -- Lisbon
  ('MCH-LIS','201','Standard Double',    2, 180.00,'Available',  'michaela-lis-standard-201','Queen bed, city-facing window, marble bath.'),
  ('MCH-LIS','305','Deluxe Sea View',    2, 265.00,'Occupied',   'michaela-lis-deluxe-305','King bed with a full Tagus river view and balcony.'),
  ('MCH-LIS','412','Junior Suite',       3, 390.00,'Available',  'michaela-lis-junior-412','Separate lounge area and rain shower.'),
  ('MCH-LIS','501','Executive Suite',    4, 610.00,'Available',  'michaela-lis-exec-501','Corner suite, dining table for six, lounge access.'),
  ('MCH-LIS','601','Presidential Suite', 6,1250.00,'Maintenance','michaela-lis-pres-601','Top-floor suite with private terrace and plunge pool.'),
  -- Santorini
  ('MCH-JTR','A1','Standard Double',     2, 210.00,'Occupied',   'michaela-jtr-standard-a1','Whitewashed cave room with vaulted ceiling.'),
  ('MCH-JTR','A7','Deluxe Sea View',     2, 340.00,'Available',  'michaela-jtr-deluxe-a7','Caldera-facing terrace with an outdoor daybed.'),
  ('MCH-JTR','B3','Terrace Deluxe',      3, 420.00,'Available',  'michaela-jtr-terrace-b3','Private terrace with a sunset-facing hot tub.'),
  ('MCH-JTR','C2','Junior Suite',        3, 520.00,'Occupied',   'michaela-jtr-junior-c2','Split-level suite carved into the cliff.'),
  ('MCH-JTR','C9','Presidential Suite',  5,1480.00,'Available',  'michaela-jtr-pres-c9','Two bedrooms, infinity pool, butler service.'),
  -- Zurich
  ('MCH-ZRH','1104','Standard Double',   2, 240.00,'Available',  'michaela-zrh-standard-1104','Oak-panelled room, blackout curtains, work desk.'),
  ('MCH-ZRH','1210','Garden Twin',       2, 260.00,'Available',  'michaela-zrh-twin-1210','Two singles overlooking the inner garden.'),
  ('MCH-ZRH','1405','Deluxe Sea View',   2, 355.00,'Occupied',   'michaela-zrh-deluxe-1405','Lake Zurich view, heated stone floor.'),
  ('MCH-ZRH','1601','Executive Suite',   4, 720.00,'Available',  'michaela-zrh-exec-1601','Alpine-view suite with a private meeting nook.'),
  ('MCH-ZRH','1701','Presidential Suite',6,1690.00,'Available',  'michaela-zrh-pres-1701','Panoramic suite with sauna and grand piano.'),
  -- Tel Aviv
  ('MCH-TLV','302','Standard Double',    2, 195.00,'Occupied',   'michaela-tlv-standard-302','Compact modern room, a short walk to the promenade.'),
  ('MCH-TLV','515','Deluxe Sea View',    2, 310.00,'Available',  'michaela-tlv-deluxe-515','Floor-to-ceiling Mediterranean view.'),
  ('MCH-TLV','708','Family Suite',       5, 480.00,'Available',  'michaela-tlv-family-708','Two connected rooms, kitchenette, bunk nook.'),
  ('MCH-TLV','909','Executive Suite',    4, 660.00,'Maintenance','michaela-tlv-exec-909','Marina-facing suite with a wraparound balcony.'),
  ('MCH-TLV','1001','Presidential Suite',6,1390.00,'Available',  'michaela-tlv-pres-1001','Rooftop suite, private pool, 24h butler.'),
  -- Prague
  ('MCH-PRG','12','Standard Double',     2, 145.00,'Available',  'michaela-prg-standard-12','Historic building with restored parquet floor.'),
  ('MCH-PRG','24','Garden Twin',         2, 160.00,'Occupied',   'michaela-prg-twin-24','Quiet courtyard twin with reading chairs.'),
  ('MCH-PRG','36','Terrace Deluxe',      3, 285.00,'Available',  'michaela-prg-terrace-36','Terrace over the Old Town rooftops.'),
  ('MCH-PRG','48','Family Suite',        5, 395.00,'Available',  'michaela-prg-family-48','Two bedrooms under original oak beams.'),
  ('MCH-PRG','55','Executive Suite',     4, 545.00,'Available',  'michaela-prg-exec-55','Castle-view suite with a fireplace.')
) as v(hotel_code, room_number, room_type, max_occupancy, nightly_rate, availability, img_seed, description)
join public.hotels h on h.code = v.hotel_code;

-- ------------------------------------------------------------- customers ----
insert into public.customers (first_name, last_name, email, phone, country, city, date_of_birth, loyalty_tier, loyalty_points, marketing_opt_in, notes) values
  ('Noa','Barkai','noa.barkai@example.com','+972-52-4410092','Israel','Haifa','1988-03-14','Platinum',48200,true,'Prefers a high floor and late checkout.'),
  ('Daniel','Fischer','daniel.fischer@example.com','+49-171-5540118','Germany','Munich','1979-11-02','Gold',26100,true,'Allergic to feather pillows.'),
  ('Sofia','Almeida','sofia.almeida@example.com','+351-912-880431','Portugal','Porto','1992-06-21','Silver',9400,false,null),
  ('Marc','Dubois','marc.dubois@example.com','+33-6-1209-4477','France','Lyon','1985-01-30','Gold',31050,true,'Corporate rate, Vinci Group.'),
  ('Elena','Petrova','elena.petrova@example.com','+357-99-334512','Cyprus','Limassol','1990-09-09','Silver',12750,true,null),
  ('James','OConnor','james.oconnor@example.com','+353-86-771-2290','Ireland','Dublin','1975-04-17','Bronze',2100,false,'Travels with a service dog.'),
  ('Yuki','Tanaka','yuki.tanaka@example.com','+81-90-8812-4471','Japan','Osaka','1994-12-05','Silver',14300,true,null),
  ('Amira','Haddad','amira.haddad@example.com','+961-3-441209','Lebanon','Beirut','1983-07-28','Gold',28800,true,'Requests a quiet room away from the lifts.'),
  ('Tomas','Novak','tomas.novak@example.com','+420-602-119-884','Czechia','Brno','1981-02-11','Bronze',3600,false,null),
  ('Isabella','Rossi','isabella.rossi@example.com','+39-345-771-9902','Italy','Milan','1996-05-19','Silver',10900,true,null),
  ('Oliver','Bennett','oliver.bennett@example.com','+44-7700-900431','United Kingdom','Bristol','1972-08-03','Platinum',52400,true,'Chain-wide VIP, standing welcome-amenity order.'),
  ('Maya','Shapiro','maya.shapiro@example.com','+972-54-8820117','Israel','Tel Aviv','1998-10-26','Bronze',1450,true,null),
  ('Lucas','Silva','lucas.silva@example.com','+55-11-98812-4410','Brazil','Sao Paulo','1987-03-08','Gold',24600,false,null),
  ('Anna','Kowalski','anna.kowalski@example.com','+48-601-449-201','Poland','Krakow','1991-11-14','Silver',8800,true,null),
  ('Peter','Muller','peter.muller@example.com','+41-79-441-2098','Switzerland','Bern','1968-06-30','Platinum',61300,false,'Books the Zurich Presidential every March.'),
  ('Chloe','Martin','chloe.martin@example.com','+33-7-8812-0044','France','Nice','1993-01-22','Bronze',4200,true,null),
  ('Ethan','Cohen','ethan.cohen@example.com','+1-415-555-0182','United States','San Francisco','1986-09-12','Gold',33700,true,'Needs early check-in, arrives around 07:00.'),
  ('Nadia','Rahman','nadia.rahman@example.com','+971-50-441-8823','United Arab Emirates','Dubai','1989-04-04','Silver',15900,true,null),
  ('Sven','Larsson','sven.larsson@example.com','+46-70-441-9928','Sweden','Gothenburg','1977-12-19','Bronze',5100,false,null),
  ('Clara','Mendes','clara.mendes@example.com','+351-934-120-887','Portugal','Lisbon','1995-07-07','Silver',11200,true,null),
  ('Ivan','Horvat','ivan.horvat@example.com','+385-91-441-2277','Croatia','Split','1984-02-29','Bronze',2900,false,null),
  ('Leah','Goldstein','leah.goldstein@example.com','+972-50-771-3348','Israel','Jerusalem','1990-08-16','Gold',29450,true,'Kosher breakfast requested.'),
  ('Andreas','Papadopoulos','andreas.papadopoulos@example.com','+30-694-441-0092','Greece','Athens','1980-05-23','Platinum',44900,true,'Holds the Santorini transfer contract.'),
  ('Hannah','Weiss','hannah.weiss@example.com','+43-664-441-7781','Austria','Vienna','1997-03-31','Bronze',1800,true,null);

-- -------------------------------------------------------------- bookings ----
-- Deterministic pseudo-random spread across customers, rooms and 2026 dates.
insert into public.bookings (booking_reference, customer_id, hotel_id, room_id, check_in, check_out,
                             guests, status, channel, total_amount, currency, special_requests)
select
  'MCH-2026-' || lpad(b.g::text, 4, '0'),
  c.id,
  r.hotel_id,
  r.id,
  d.check_in,
  d.check_in + d.nights,
  least(r.max_occupancy, 1 + (b.h6 % 4))::smallint,
  (array['Confirmed','Confirmed','Confirmed','Pending','Checked-in','Checked-out','Cancelled'])[1 + (b.h4 % 7)],
  (array['Direct','Direct','Booking.com','Expedia','Travel Agent','Corporate'])[1 + (b.h5 % 6)],
  round(r.nightly_rate * d.nights * (0.9 + (b.h3 % 25) / 100.0), 2),
  'EUR',
  (array[null,null,null,'Late check-out requested','High floor, quiet side','Anniversary - sparkling wine on arrival','Airport transfer booked'])[1 + (b.h2 % 7)]
from (
  select g,
         ('x' || substr(md5('mch-cust-' || g), 1, 7))::bit(28)::int as h1,
         ('x' || substr(md5('mch-note-' || g), 1, 7))::bit(28)::int as h2,
         ('x' || substr(md5('mch-rate-' || g), 1, 7))::bit(28)::int as h3,
         ('x' || substr(md5('mch-stat-' || g), 1, 7))::bit(28)::int as h4,
         ('x' || substr(md5('mch-chan-' || g), 1, 7))::bit(28)::int as h5,
         ('x' || substr(md5('mch-gsts-' || g), 1, 7))::bit(28)::int as h6,
         ('x' || substr(md5('mch-room-' || g), 1, 7))::bit(28)::int as h7,
         ('x' || substr(md5('mch-date-' || g), 1, 7))::bit(28)::int as h8,
         ('x' || substr(md5('mch-nght-' || g), 1, 7))::bit(28)::int as h9
  from generate_series(1, 60) g
) b
join lateral (
  select id from public.customers
  order by id offset (b.h1 % (select count(*) from public.customers)) limit 1
) c on true
join lateral (
  select id, hotel_id, nightly_rate, max_occupancy from public.rooms
  order by id offset (b.h7 % (select count(*) from public.rooms)) limit 1
) r on true
cross join lateral (
  select (date '2026-01-05' + (b.h8 % 330))::date as check_in,
         (1 + (b.h9 % 9))::int                    as nights
) d;

-- --------------------------------------------------------------- flights ----
-- Roughly 70% of non-cancelled bookings get a matched outbound + inbound leg.
insert into public.flights (booking_id, customer_id, flight_number, airline, direction,
                            departure_airport, arrival_airport, departure_time, arrival_time,
                            cabin_class, seat, price, currency, status)
select
  bk.id,
  bk.customer_id,
  a.code || (100 + (f.h1 % 800))::text,
  a.airline,
  leg.direction,
  case when leg.direction = 'Outbound' then o.origin else dst.dest   end,
  case when leg.direction = 'Outbound' then dst.dest  else o.origin  end,
  t.dep_time,
  t.dep_time + make_interval(mins => 110 + (f.h3 % 190)),
  (array['Economy','Economy','Economy','Premium Economy','Business','Business','First'])[1 + (f.h4 % 7)],
  (1 + (f.h5 % 32))::text || substr('ABCDEF', 1 + (f.h6 % 6), 1),
  round(120 + (f.h7 % 780) + (f.h8 % 100) / 100.0, 2),
  'EUR',
  case
    when bk.check_out < date '2026-08-24' then 'Landed'
    when (f.h2 % 11) = 0                  then 'Delayed'
    else 'Scheduled'
  end
from public.bookings bk
join public.hotels h on h.id = bk.hotel_id
cross join lateral (values ('Outbound'), ('Inbound')) as leg(direction)
cross join lateral (
  select ('x' || substr(md5('flt-num-'  || bk.id || leg.direction), 1, 7))::bit(28)::int as h1,
         ('x' || substr(md5('flt-stat-' || bk.id || leg.direction), 1, 7))::bit(28)::int as h2,
         ('x' || substr(md5('flt-dur-'  || bk.id || leg.direction), 1, 7))::bit(28)::int as h3,
         ('x' || substr(md5('flt-cab-'  || bk.id), 1, 7))::bit(28)::int                  as h4,
         ('x' || substr(md5('flt-seat-' || bk.id || leg.direction), 1, 7))::bit(28)::int as h5,
         ('x' || substr(md5('flt-row-'  || bk.id || leg.direction), 1, 7))::bit(28)::int as h6,
         ('x' || substr(md5('flt-prc-'  || bk.id || leg.direction), 1, 7))::bit(28)::int as h7,
         ('x' || substr(md5('flt-cnt-'  || bk.id || leg.direction), 1, 7))::bit(28)::int as h8,
         ('x' || substr(md5('flt-org-'  || bk.id), 1, 7))::bit(28)::int                  as h9,
         ('x' || substr(md5('flt-air-'  || bk.id || leg.direction), 1, 7))::bit(28)::int as h10,
         ('x' || substr(md5('flt-keep-' || bk.id), 1, 7))::bit(28)::int                  as h11
) f
cross join lateral (
  select case h.city
           when 'Lisbon'    then 'LIS'
           when 'Santorini' then 'JTR'
           when 'Zurich'    then 'ZRH'
           when 'Tel Aviv'  then 'TLV'
           else 'PRG'
         end as dest
) dst
cross join lateral (
  select (array['LHR','CDG','FRA','AMS','MAD','JFK','BER','MXP','DUB','VIE'])[1 + (f.h9 % 10)] as origin
) o
cross join lateral (
  select (array['TP','LX','LY','A3','BA','LH','AF','KL'])[1 + (f.h10 % 8)] as code,
         (array['TAP Air Portugal','SWISS','El Al','Aegean Airlines','British Airways','Lufthansa','Air France','KLM'])[1 + (f.h10 % 8)] as airline
) a
cross join lateral (
  select case leg.direction
           when 'Outbound' then bk.check_in::timestamptz  + make_interval(hours => 6  + (f.h3 % 10))
           else                 bk.check_out::timestamptz + make_interval(hours => 11 + (f.h3 % 9))
         end as dep_time
) t
where bk.status <> 'Cancelled'
  and (f.h11 % 10) < 7;
