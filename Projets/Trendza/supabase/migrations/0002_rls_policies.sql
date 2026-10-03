-- Trendza — Row Level Security policies

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.favorites enable row level security;
alter table public.stores enable row level security;

-- profiles: a user can only see and edit their own row -----------------------
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- products: public read-only catalogue ----------------------------------------
-- Writes are intentionally not exposed to any role here: for the MVP, rows are
-- managed exclusively via migrations/seed data or the Supabase dashboard.
create policy "products_select_public"
  on public.products for select
  using (true);

-- favorites: full CRUD restricted to the owning user --------------------------
create policy "favorites_select_own"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "favorites_insert_own"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "favorites_delete_own"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- stores: full CRUD restricted to the owning user ------------------------------
create policy "stores_select_own"
  on public.stores for select
  using (auth.uid() = user_id);

create policy "stores_insert_own"
  on public.stores for insert
  with check (auth.uid() = user_id);

create policy "stores_update_own"
  on public.stores for update
  using (auth.uid() = user_id);

create policy "stores_delete_own"
  on public.stores for delete
  using (auth.uid() = user_id);
