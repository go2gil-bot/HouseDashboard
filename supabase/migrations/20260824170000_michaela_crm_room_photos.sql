-- Michaela Hotels CRM — replace the placeholder room photography
--
-- The seed used picsum.photos, which serves a random photo per seed. Stable and
-- key-free, but the results were bridges, flags and street scenes sitting under
-- labels like "Presidential Suite". Swapped for loremflickr, which serves a
-- photo matching tags, so a suite actually looks like a suite.
--
-- lock=<id> keeps each room pinned to the same photo across reloads.

update public.rooms r
set image_url = 'https://loremflickr.com/800/450/'
                || case r.room_type
                     when 'Standard Double'    then 'hotel,bedroom'
                     when 'Garden Twin'        then 'hotel,room,beds'
                     when 'Deluxe Sea View'    then 'hotel,room,seaview'
                     when 'Terrace Deluxe'     then 'hotel,terrace,room'
                     when 'Junior Suite'       then 'hotel,suite'
                     when 'Family Suite'       then 'hotel,suite,family'
                     when 'Executive Suite'    then 'hotel,suite,luxury'
                     when 'Presidential Suite' then 'luxury,hotel,penthouse'
                     else 'hotel,room'
                   end
                || '?lock=' || (1000 + r.id)::text;

update public.hotels h
set hero_image_url = 'https://loremflickr.com/1024/576/'
                     || case h.city
                          when 'Lisbon'    then 'lisbon,hotel'
                          when 'Santorini' then 'santorini,hotel'
                          when 'Zurich'    then 'zurich,hotel'
                          when 'Tel Aviv'  then 'telaviv,hotel'
                          else 'prague,hotel'
                        end
                     || '?lock=' || (2000 + h.id)::text;
