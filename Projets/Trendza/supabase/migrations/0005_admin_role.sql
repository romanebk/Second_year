-- Adds an admin role to profiles.
--
-- Bootstrapping: the very first person to ever sign up on a project is
-- automatically made 'admin' (see handle_new_user below). If you've already
-- created test accounts before running this migration, promote yourself
-- manually instead:
--   update public.profiles set role = 'admin' where id =
--     (select id from auth.users where email = 'you@example.com');

alter table public.profiles
  add column if not exists role text not null default 'user' check (role in ('user', 'admin'));

-- Re-create the signup trigger so the first-ever profile row becomes admin.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  is_first boolean;
begin
  select not exists (select 1 from public.profiles) into is_first;

  insert into public.profiles (id, role)
  values (new.id, case when is_first then 'admin' else 'user' end)
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Defense in depth: even though the "update own profile" RLS policy lets a
-- user update their own row, revoke column-level privilege on `role` so no
-- client request (however crafted) can self-promote. Only a service-role
-- key (which bypasses grants) or direct SQL access can change it.
revoke update (role) on public.profiles from authenticated;
