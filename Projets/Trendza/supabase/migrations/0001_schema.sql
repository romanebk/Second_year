-- Trendza — core schema
-- profiles / products / favorites / stores

create extension if not exists "pgcrypto";

-- profiles ---------------------------------------------------------------
-- One row per authenticated user, extends auth.users with onboarding answers.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  pays text,
  niveau text check (niveau in ('debutant', 'pro')),
  plateforme text check (plateforme in ('woocommerce', 'mychariow', 'autre')),
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up, so the
-- onboarding form always has a row to update instead of needing an insert.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- products -----------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  description text not null,
  categorie text not null,
  image_url text not null,
  prix_conseille numeric(10, 2) not null,
  marge_estimee text not null,
  score int not null check (score between 0 and 100),
  pays_cible text[] not null default '{}',
  mois_pertinents int[] not null default '{}',
  public_cible text not null default '',
  arguments_vente text[] not null default '{}',
  angles_marketing text[] not null default '{}',
  -- `source` and `updated_at` are the hook for a future job to replace/refresh
  -- this seed data with real trend data (Google Trends, Meta Ads Library, ...)
  -- without any schema change: swap the values, keep `source` accurate.
  source text not null default 'seed',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists products_pays_cible_idx on public.products using gin (pays_cible);
create index if not exists products_mois_pertinents_idx on public.products using gin (mois_pertinents);
create index if not exists products_categorie_idx on public.products (categorie);

-- favorites ------------------------------------------------------------------
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- stores -----------------------------------------------------------------
create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nom text not null,
  plateforme text not null check (plateforme in ('woocommerce', 'mychariow', 'autre')),
  pays text not null,
  created_at timestamptz not null default now()
);
