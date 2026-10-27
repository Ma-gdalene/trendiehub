-- TRENDIE MODELS: Fix application submission permissions and profile field protection
-- Run this script in the Supabase SQL Editor: https://supabase.com/dashboard/project/hapjyuomrpakftoljlcf/sql

-- 1. Grant usage on schema private to service_role and authenticated
grant usage on schema private to postgres, service_role, authenticated, anon;
grant all on schema private to postgres, service_role;

-- 2. Update private.protect_profile_fields to allow application submission transition to 'pending'
create or replace function private.protect_profile_fields()
returns trigger language plpgsql security definer set search_path = public, private, pg_temp as $$
begin
  if auth.uid() = old.id and not private.is_admin() then
    -- Allow the model to transition application_status to 'pending' when submitting an application
    if (old.application_status in ('not_submitted', 'rejected') and new.application_status = 'pending' and new.review_reason is null) then
      return new;
    end if;

    if new.role is distinct from old.role
      or new.application_status is distinct from old.application_status
      or new.review_reason is distinct from old.review_reason
      or new.points_balance is distinct from old.points_balance
      or new.suspended_at is distinct from old.suspended_at
      or new.email is distinct from old.email then
      raise exception 'Protected profile fields cannot be changed by the account owner'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;
