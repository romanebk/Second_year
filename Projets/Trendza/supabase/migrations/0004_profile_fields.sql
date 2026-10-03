-- Add contact/identity fields to profiles, filled from the signup form.
alter table public.profiles
  add column if not exists nom text,
  add column if not exists prenoms text,
  add column if not exists telephone text;
