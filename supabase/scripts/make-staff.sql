-- Promote an existing account to staff.
--
--   npx supabase db query -f supabase/scripts/make-staff.sql \
--     --linked --project-ref myoypppxfxupgqmmzjim
--
-- Replace the address below first. The account must already exist.
--
-- app_metadata is the right home for this: only the service role can write it.
-- Never put a role in user_metadata (raw_user_meta_data) — users can edit that
-- themselves, which would let any guest promote themselves to staff.
--
-- The claim only reaches the app in a newly issued JWT, so the user has to sign
-- out and back in before /admin opens.

update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
                        || '{"role":"staff"}'::jsonb
where email = 'REPLACE_WITH_EMAIL'
returning email, raw_app_meta_data ->> 'role' as role;

-- To demote again:
-- update auth.users
-- set raw_app_meta_data = raw_app_meta_data - 'role'
-- where email = 'REPLACE_WITH_EMAIL';
